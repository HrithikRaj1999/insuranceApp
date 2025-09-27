FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY tsconfig.json ./
RUN npm ci
RUN npm install -g tsx
COPY src ./src
RUN npm run build
RUN tsx src/seed/seed.ts

FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
RUN mkdir -p uploads temp-uploads
RUN apk add --no-cache dumb-init
EXPOSE 8080
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/server.js"]
