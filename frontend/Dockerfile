# ---------- Build Stage ----------
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Build-time API URL can be overridden via --build-arg
ARG VITE_API_BASE_URL=http://localhost:5000/api
ARG VITE_APP_BASE_URL=http://localhost:5000
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_APP_BASE_URL=$VITE_APP_BASE_URL

RUN npm run build

# ---------- Production Stage ----------
FROM nginx:1.27-alpine AS production

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy built static files
COPY --from=builder /app/dist /usr/share/nginx/html

# Custom nginx config for SPA routing (React Router)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:80 || exit 1

CMD ["nginx", "-g", "daemon off;"]
