# Stage 1: Build
FROM node:18-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src ./src

RUN npm run build


# Stage 2: Runtime
FROM node:18-alpine
WORKDIR /app

RUN addgroup -g 1001 -S nodejs && adduser -S chatservice -u 1001

COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist

RUN chown -R chatservice:nodejs /app
USER chatservice

CMD ["node", "dist/index.js"]
