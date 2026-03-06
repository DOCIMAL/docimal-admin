# ===== 1. Base =====
FROM node:20-alpine AS base
WORKDIR /app
RUN npm install -g pnpm

# ===== 2. Dependencies =====
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# ===== 3. Build =====
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

# ===== 4. Production (nginx) =====
FROM nginx:stable-alpine AS runner

# Copy built static files
COPY --from=builder /app/dist /usr/share/nginx/html

# Custom nginx config for SPA routing + port 3100
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3100

CMD ["nginx", "-g", "daemon off;"]
