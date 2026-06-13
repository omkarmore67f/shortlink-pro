# ---------- Build Stage ----------
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies (including devDependencies needed for TS build)
COPY package*.json ./
RUN npm ci

# Copy source and compile TypeScript -> JavaScript
COPY . .
RUN npm run build

# ---------- Production Stage ----------
FROM node:20-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

# Install only production dependencies (smaller image)
COPY package*.json ./
RUN npm ci --omit=dev

# Copy compiled output from the builder stage
COPY --from=builder /app/dist ./dist

EXPOSE 5000

# Basic healthcheck hitting the /health endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

CMD ["node", "dist/server.js"]
