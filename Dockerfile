FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

ENV DATAFORSEO_LOGIN=""
ENV DATAFORSEO_PASSWORD=""

# Criar script de inicialização que mantém o processo rodando
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'tail -f /dev/null & npm start' >> /app/start.sh && \
    chmod +x /app/start.sh

# Expor porta 3000 caso seja necessário
EXPOSE 3000

CMD ["/app/start.sh"]
