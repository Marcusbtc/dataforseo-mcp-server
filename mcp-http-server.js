const { spawn } = require('child_process');
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

let mcpProcess = null;
let mcpReady = false;

// Iniciar processo MCP stdio
function startMCPProcess() {
  mcpProcess = spawn('node', ['dist/index.js'], {
    env: process.env,
  });
  
  mcpProcess.stderr.on('data', (data) => {
    const msg = data.toString();
    console.error('[MCP stderr]', msg);
    if (msg.includes('MCP Server connected')) {
      mcpReady = true;
    }
  });
  
  mcpProcess.on('close', (code) => {
    console.log(`[MCP] Process exited with code ${code}`);
    mcpReady = false;
  });
}

startMCPProcess();

// Processar requisições MCP via stdin/stdout
async function processMCPRequest(request) {
  return new Promise((resolve, reject) => {
    if (!mcpReady) {
      reject(new Error('MCP server not ready'));
      return;
    }

    let responseData = '';
    const timeout = setTimeout(() => {
      clearTimeout(timeout);
      mcpProcess.stdout.removeListener('data', dataHandler);
      reject(new Error('MCP request timeout'));
    }, 10000);

    const dataHandler = (data) => {
      responseData += data.toString();
      const lines = responseData.split('\n').filter(l => l.trim());
      
      for (const line of lines) {
        try {
          const response = JSON.parse(line);
          if (response.id === request.id) {
            clearTimeout(timeout);
            mcpProcess.stdout.removeListener('data', dataHandler);
            resolve(response);
            return;
          }
        } catch (e) {
          // Linha não é JSON válido, ignora
        }
      }
    };

    mcpProcess.stdout.on('data', dataHandler);
    mcpProcess.stdin.write(JSON.stringify(request) + '\n');
  });
}

// Endpoint HTTP Streamable
app.post('/mcp', async (req, res) => {
  try {
    console.log('Received MCP request:', JSON.stringify(req.body));
    
    const { method, params, id } = req.body;
    
    // Notificações não precisam de resposta
    if (method.startsWith('notifications/')) {
      res.status(204).send();
      return;
    }
    
    // Responder initialize diretamente
    if (method === 'initialize') {
      res.json({
        jsonrpc: '2.0',
        id,
        result: {
          protocolVersion: '2025-06-18',
          capabilities: {
            tools: {}
          },
          serverInfo: {
            name: 'dataforseo-mcp-server',
            version: '1.0.0'
          }
        }
      });
      return;
    }
    
    // Processar outras requisições via MCP stdio
    const response = await processMCPRequest(req.body);
    res.json(response);
    
  } catch (error) {
    console.error('MCP Error:', error);
    res.status(500).json({
      jsonrpc: '2.0',
      id: req.body.id || 0,
      error: {
        code: -32603,
        message: error.message
      }
    });
  }
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    mcpReady,
    service: 'dataforseo-mcp-http-streamable'
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`MCP HTTP Streamable Server listening on port ${PORT}`);
  console.log(`Endpoint: http://0.0.0.0:${PORT}/mcp`);
});
