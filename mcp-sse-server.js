const { SSEServerTransport } = require('@modelcontextprotocol/sdk/server/sse.js');
const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { spawn } = require('child_process');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

// Criar servidor MCP
const server = new Server(
  {
    name: 'dataforseo-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Iniciar o servidor MCP original em background
let mcpProcess = null;

function startMCPProcess() {
  mcpProcess = spawn('node', ['dist/index.js'], {
    env: process.env,
  });
  
  mcpProcess.stdout.on('data', (data) => {
    console.log('[MCP]', data.toString());
  });
  
  mcpProcess.stderr.on('data', (data) => {
    console.error('[MCP Error]', data.toString());
  });
}

startMCPProcess();

// SSE endpoint
app.get('/sse', async (req, res) => {
  console.log('SSE connection established');
  
  const transport = new SSEServerTransport('/messages', res);
  await server.connect(transport);
});

// POST endpoint para mensagens MCP
app.post('/messages', express.json(), async (req, res) => {
  console.log('Received message:', req.body);
  // Processar mensagem MCP
  res.status(202).send();
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'dataforseo-mcp-sse',
    mcpRunning: mcpProcess !== null 
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`MCP SSE Server listening on port ${PORT}`);
});
