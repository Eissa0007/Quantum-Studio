# Stage 1: Build Frontend and Server
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source
COPY . .

# Build frontend
RUN npm run build

# Build server
RUN npx tsc server/index.ts --esModuleInterop --skipLibCheck --outDir dist-server

# Stage 2: Production
FROM node:20-alpine

# Install nginx
RUN apk add --no-cache nginx

WORKDIR /app

# Copy built frontend assets to Nginx html directory
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy built server
COPY --from=builder /app/dist-server /app/server
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

# Copy Nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Create startup script to run Node and Nginx
RUN echo '#!/bin/sh' > /start.sh && \
    echo 'node /app/server/index.js &' >> /start.sh && \
    echo 'nginx -g "daemon off;"' >> /start.sh && \
    chmod +x /start.sh

# STRICT REQUIREMENT: Only expose 7860 for Hugging Face Spaces
EXPOSE 7860

CMD ["/start.sh"]
