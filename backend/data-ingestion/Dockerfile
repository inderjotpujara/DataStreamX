FROM node:18-alpine
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install --production

# Copy the rest of the code
COPY . .

# Expose a port if needed (not strictly necessary if the service doesn't receive HTTP requests)
EXPOSE 4000

# Build TypeScript
RUN npm run build

# Run the compiled JavaScript
CMD ["npm", "start"]