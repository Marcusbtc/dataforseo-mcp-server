const { spawn } = require('child_process');
const express = require('express');
const app = express();

app.use(express.json());

const PORT = process.env.PORT || 3000;

// Endpoint para listar ferramentas disponíveis
app.post('/mcp/tools/list', async (req, res) => {
  const mcpProcess = spawn('node', ['dist/index.js']);
  
  let output = '';
  mcpProcess.stdout.on('data', (data) => {
    output += data.toString();
  });
  
  mcpProcess.stdin.write(JSON.stringify({
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/list'
  }) + '\n');
  
  mcpProcess.stdin.end();
  
  setTimeout(() => {
    try {
      const result = JSON.parse(output.split('\n').find(line => line.includes('result')));
      res.json(result);
    } catch (e) {
      res.status(500).json({ error: 'Failed to parse MCP response', output });
    }
  }, 2000);
});

// Endpoint para chamar ferramentas
app.post('/mcp/tools/call', async (req, res) => {
  const { name, arguments: args } = req.body;
  
  const mcpProcess = spawn('node', ['dist/index.js']);
  
  let output = '';
  mcpProcess.stdout.on('data', (data) => {
    output += data.toString();
  });
  
  mcpProcess.stdin.write(JSON.stringify({
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/call',
    params: { name, arguments: args }
  }) + '\n');
  
  mcpProcess.stdin.end();
  
  setTimeout(() => {
    try {
      const lines = output.split('\n').filter(l => l.trim());
      const result = JSON.parse(lines[lines.length - 1]);
      res.json(result);
    } catch (e) {
      res.status(500).json({ error: 'Failed to parse MCP response', output });
    }
  }, 5000);
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'dataforseo-mcp-http' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`MCP HTTP Server listening on port ${PORT}`);
});
