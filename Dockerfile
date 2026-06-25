ARG NODE_VERSION=24.13.0-slim

# 1. 安装依赖阶段
FROM node:${NODE_VERSION} AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
# 安装 pnpm 并执行严格安装
RUN npm install -g pnpm && pnpm i --frozen-lockfile

# 2. 构建阶段
FROM node:${NODE_VERSION} AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 如果使用了 Prisma，在 build 之前必须先生成 Prisma Client
RUN pnpm exec prisma generate 

RUN pnpm run build

# 3. 运行阶段
FROM node:${NODE_VERSION} AS runner
WORKDIR /app
ENV NODE_ENV=production

# 从 builder 阶段复制 standalone 成果
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["node", "server.js"]