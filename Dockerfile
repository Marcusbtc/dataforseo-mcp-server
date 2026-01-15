FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Copiar o servidor SSE
COPY mcp-sse-server.js ./

ENV DATAFORSEO_LOGIN=""
ENV DATAFORSEO_PASSWORD=""
ENV PORT=3000

# Expor porta 3000 para rede interna
EXPOSE 3000

# Iniciar o servidor MCP via SSE
CMD ["node", "mcp-sse-server.js"]
