# ---- Base Node.js Stage ----
FROM node:18-alpine AS base
WORKDIR /app
COPY package*.json ./

# ---- Dependencies & Build Stage ----
FROM base AS builder
ENV NODE_ENV=development
RUN npm ci
COPY . .
RUN npm run build
RUN ls -la dist/

# ---- Development Stage ----
FROM base AS development
ENV NODE_ENV=development
RUN npm ci
COPY . .
RUN mkdir -p dist
# Expose port for development
EXPOSE 9091
# Healthcheck for development
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:${METRICS_PORT}/metrics || exit 1
CMD ["npm", "run", "dev"]

# ---- Production Stage ----
FROM base AS production
ENV NODE_ENV=production
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/.env.example ./.env.example
# Expose port for development
EXPOSE 9091
# Healthcheck for development
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:${METRICS_PORT}/metrics || exit 1
CMD ["npm", "start"]