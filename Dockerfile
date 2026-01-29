# Multi-stage build for Business Event Manager
# Stage 1: Build frontend
FROM node:18-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy frontend package files
COPY frontend/package*.json ./

# Install frontend dependencies
RUN npm ci --only=production

# Copy frontend source
COPY frontend/ ./

# Build frontend for production
RUN npm run build

# Stage 2: Backend with built frontend
FROM node:18-alpine AS production

WORKDIR /app

# Install sqlite3 dependencies
RUN apk add --no-cache sqlite

# Copy backend package files
COPY backend/package*.json ./backend/

# Install backend dependencies
WORKDIR /app/backend
RUN npm ci --only=production

# Copy backend source
COPY backend/ ./

# Copy built frontend from previous stage
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist

# Create uploads directory
RUN mkdir -p /app/uploads

# Create database directory
RUN mkdir -p /app/backend/database

# Expose backend port
EXPOSE 5000

# Set working directory to backend
WORKDIR /app/backend

# Initialize database and start server
CMD ["sh", "-c", "npm run init-db && npm start"]
