FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

ENV DATAFORSEO_LOGIN=""
ENV DATAFORSEO_PASSWORD=""

# Expor porta 3000 para acesso interno
EXPOSE 3000

# Manter container rodando usando tail -f em foreground
CMD sh -c "npm start & tail -f /dev/null"
