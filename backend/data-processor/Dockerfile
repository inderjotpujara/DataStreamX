# ---- Base Node.js Stage ----
FROM node:18-alpine AS base
WORKDIR /app
# Cache package files
COPY package*.json ./

# ---- Dependencies & Build Stage ----
FROM base AS builder
# Set to development for dev dependencies
ENV NODE_ENV=development
# Install all dependencies including devDependencies
RUN npm i
# Copy source code
COPY . .
# Build TypeScript
RUN npm run build
# Verify build output
RUN ls -la dist/

# ---- Development Stage ----
FROM base AS development
# Set development environment
ENV NODE_ENV=development
# Install all dependencies including devDependencies
RUN npm i
# Copy source files for hot reloading
COPY . .
# Create dist directory to avoid permission issues
RUN mkdir -p dist
# Start development mode with hot reloading
CMD ["npm", "run", "dev"]

# ---- Production Stage ----
FROM base AS production
# Set production environment
ENV NODE_ENV=production
# Install only production dependencies
RUN npm i --only=production
# Copy build artifacts from builder
COPY --from=builder /app/dist ./dist
# Copy production configs if any
COPY --from=builder /app/.env.example ./.env.example
# Start production server
CMD ["npm", "start"]