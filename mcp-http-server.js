const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const express = require('express');
const { Readable } = require('stream');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

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

// Endpoint HTTP Streamable MCP
app.post('/mcp', async (req, res) => {
  try {
    console.log('Received MCP request:', JSON.stringify(req.body));
    
    // Criar streams para simular stdio
    const readable = new Readable({
      read() {}
    });
    
    const writable = {
      write: (chunk) => {
        res.write(chunk);
        return true;
      },
      end: () => {
        res.end();
      }
    };
    
    // Criar transport stdio
    const transport = new StdioServerTransport(readable, writable);
    
    // Conectar servidor
    await server.connect(transport);
    
    // Enviar requisição
    readable.push(JSON.stringify(req.body) + '\n');
    readable.push(null);
    
  } catch (error) {
    console.error('MCP Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'dataforseo-mcp-http-streamable',
    version: '1.0.0'
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`MCP HTTP Streamable Server listening on port ${PORT}`);
  console.log(`Endpoint: http://0.0.0.0:${PORT}/mcp`);
});
