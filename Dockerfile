# Stage 1 - Builder
FROM node:20-bookworm-slim AS builder

ENV NEXT_TELEMETRY_DISABLED=1
ENV GENERATE_SOURCEMAP=false

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --no-audit --prefer-offline

COPY . .

# Executa o build usando node diretamente com --max-old-space-size
RUN node --max-old-space-size=8192 node_modules/.bin/next build

# Stage 2 - Runner
FROM node:20-bookworm-slim

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=builder /app/package.json ./
COPY --from=builder /app/package-lock.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.mjs ./

EXPOSE 3000
CMD ["npm", "start"]
