# syntax=docker.io/docker/dockerfile:1

FROM oven/bun:1-alpine AS base
WORKDIR /app

# Install dependencies only when needed
FROM base AS deps
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile


# Rebuild the source code only when needed
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN bun run build

# Production image, copy all the files and serve static files
FROM base AS runner

ENV NODE_ENV=production

# Install a simple static file server (or use any lightweight server)
RUN bun add --global serve

# Copy built assets from builder
COPY --from=builder /app/dist ./dist

USER bun

EXPOSE 3000

ENV PORT=3000

# Serve the static files
CMD ["serve", "-s", "dist", "-l", "3000"]
