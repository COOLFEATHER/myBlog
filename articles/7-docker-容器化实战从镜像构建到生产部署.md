---
id: 7
title: "Docker 容器化实战：从镜像构建到生产部署"
date: 2024-03-16
category: "开发工具"
tags: ["Docker", "Linux", "Node.js"]
summary: "手把手带你将 Node.js 应用容器化，编写 Dockerfile 和 docker-compose.yml，实现本地开发与生产环境无缝切换。"
cover: ""
readCount: 119
likeCount: 39
collectCount: 21
---
## Dockerfile 基础

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["node", "app.js"]
```

## 多阶段构建优化体积

```dockerfile
# 构建阶段
FROM node:20-alpine AS builder
WORKDIR /app
COPY . .
RUN npm ci

# 运行阶段
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
CMD ["node", "dist/app.js"]
```

## docker-compose.yml

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - '3000:3000'
    environment:
      - NODE_ENV=production
    restart: unless-stopped
```

## 常用命令

```bash
docker build -t myapp .
docker run -d -p 3000:3000 myapp
docker-compose up -d
```