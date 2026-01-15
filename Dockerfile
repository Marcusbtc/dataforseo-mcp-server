FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install && npm install express

COPY . .
RUN npm run build

# Copiar o wrapper HTTP
COPY server-wrapper.js ./

ENV DATAFORSEO_LOGIN=""
ENV DATAFORSEO_PASSWORD=""
ENV PORT=3000

# Expor porta 3000 para rede interna
EXPOSE 3000

# Iniciar o wrapper HTTP
CMD ["node", "server-wrapper.js"]
