FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Copiar o servidor HTTP Streamable
COPY mcp-http-server.js ./

ENV DATAFORSEO_LOGIN=""
ENV DATAFORSEO_PASSWORD=""
ENV PORT=3000

EXPOSE 3000

# Iniciar servidor HTTP Streamable
CMD ["node", "mcp-http-server.js"]
