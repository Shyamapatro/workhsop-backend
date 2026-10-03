# Stage 1: Build the TypeScript code
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for TypeScript)
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the TypeScript project (compiles to the dist/ folder)
RUN npm run build

# Stage 2: Create the production image
FROM node:20-alpine AS production

WORKDIR /app

# Set Node environment to production
ENV NODE_ENV=production

# Copy package files
COPY package*.json ./

# Install ONLY production dependencies to keep the image lightweight
RUN npm ci --omit=dev

# Copy the compiled Javascript from the builder stage
COPY --from=builder /app/dist ./dist

# Expose the Fastify port
EXPOSE 3000

# Start the Node server
CMD ["node", "dist/app.js"]
