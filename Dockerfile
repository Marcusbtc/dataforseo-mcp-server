FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

ENV DATAFORSEO_LOGIN=""
ENV DATAFORSEO_PASSWORD=""

CMD ["npm", "start"]
