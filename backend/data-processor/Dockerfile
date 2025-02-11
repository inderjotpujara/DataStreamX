FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm install

# Copy source code and config files
COPY . .

# Create dist directory
RUN mkdir -p dist

# Build TypeScript
RUN npm run build

# Verify the build output exists
RUN ls -la dist/

# Run the compiled JavaScript
CMD ["npm", "start"]