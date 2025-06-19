# Etapa 1: build
FROM node:20.11.1-bullseye-slim AS builder

WORKDIR /app

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

COPY package*.json ./
RUN npm install --frozen-lockfile

COPY . .
RUN npm run build

# Etapa 2: NGINX para servir o site estático
FROM nginx:alpine

# Copia a config do NGINX
COPY ./nginx.conf /etc/nginx/nginx.conf

# Copia os arquivos gerados na pasta "out" do Next.js
COPY --from=builder /app/out /usr/share/nginx/html

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
