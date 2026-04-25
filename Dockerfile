# ── Stage 1: Build the Vite app ──────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency files first (better layer caching)
COPY package*.json ./

# Install all dependencies (including devDependencies needed for build)
RUN npm ci

# Copy source code
COPY . .

# Build the production bundle into /app/dist
RUN npm run build

# ── Stage 2: Serve with Express ───────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev

# Copy the built dist from the builder stage
COPY --from=builder /app/dist ./dist

# Copy the Express server entry point
COPY index.js ./

# Cloud Run injects PORT automatically (default 8080)
ENV PORT=8080
EXPOSE 8080

# Start the server
CMD ["node", "index.js"]
