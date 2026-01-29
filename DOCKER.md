# Docker Deployment Guide

## Overview

The Business Event Manager application is containerized as a monorepo with support for both production and development environments.

## Architecture

### Production Setup
- **Single Container**: Multi-stage build combining frontend and backend
- **Frontend**: Built statically and served by backend
- **Backend**: Node.js/Express server on port 5000
- **Database**: SQLite with volume persistence
- **Uploads**: File storage with volume persistence

### Development Setup
- **Two Containers**: Separate backend and frontend with hot reload
- **Backend**: Nodemon auto-reload on port 5000
- **Frontend**: Vite dev server with HMR on port 3000
- **Volumes**: Source code mounted for live updates

## Quick Start

### Production Deployment

Build and run the production container:

```bash
# Build the image
docker-compose build

# Start the container
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the container
docker-compose down
```

Access the application at `http://localhost:5000`

### Development Mode

Run with hot reload for development:

```bash
# Start development containers
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop containers
docker-compose -f docker-compose.dev.yml down
```

Access:
- Frontend: `http://localhost:3000` (with HMR)
- Backend API: `http://localhost:5000/api`

## Docker Commands

### Building

```bash
# Build production image
docker-compose build

# Build without cache
docker-compose build --no-cache

# Build development images
docker-compose -f docker-compose.dev.yml build
```

### Running

```bash
# Start in detached mode
docker-compose up -d

# Start with logs
docker-compose up

# Start specific service
docker-compose up app

# Scale services (dev mode)
docker-compose -f docker-compose.dev.yml up --scale backend=2
```

### Managing

```bash
# Stop containers
docker-compose stop

# Remove containers
docker-compose down

# Remove containers and volumes
docker-compose down -v

# Restart containers
docker-compose restart

# View running containers
docker-compose ps
```

### Logs

```bash
# View all logs
docker-compose logs

# Follow logs
docker-compose logs -f

# View specific service logs
docker-compose logs backend

# Last 100 lines
docker-compose logs --tail=100
```

### Executing Commands

```bash
# Execute command in running container
docker-compose exec app sh

# Run npm commands in backend
docker-compose exec app npm run init-db

# Access SQLite database
docker-compose exec app sqlite3 /app/backend/database/business_events.db
```

## Configuration

### Environment Variables

Production environment variables are set in `docker-compose.yml`:

```yaml
environment:
  - PORT=5000
  - DB_PATH=./database/business_events.db
  - UPLOAD_PATH=../uploads
  - NODE_ENV=production
```

To override, create a `.env` file:

```env
PORT=5000
DB_PATH=./database/business_events.db
UPLOAD_PATH=../uploads
NODE_ENV=production
```

### Volume Persistence

Two volumes are mounted for data persistence:

1. **Database**: `./backend/database:/app/backend/database`
2. **Uploads**: `./uploads:/app/uploads`

Data persists even when containers are removed.

### Port Mapping

Default port mapping:
- Production: `5000:5000`
- Development Backend: `5000:5000`
- Development Frontend: `3000:3000`

To change ports, modify `docker-compose.yml`:

```yaml
ports:
  - "8080:5000"  # Host:Container
```

## Multi-Stage Build

The production Dockerfile uses a multi-stage build:

### Stage 1: Frontend Builder
- Uses Node.js 18 Alpine
- Installs frontend dependencies
- Builds static files with Vite
- Outputs to `dist/` directory

### Stage 2: Production
- Uses Node.js 18 Alpine
- Installs backend dependencies
- Copies built frontend from stage 1
- Sets up database and uploads directories
- Runs database initialization on startup

Benefits:
- Smaller final image (no frontend build tools)
- Optimized layer caching
- Faster deployments

## Development Workflow

### Initial Setup

```bash
# Clone repository
git clone https://github.com/ObaidulKabir/Business-Event-Management.git
cd Business-Event-Management

# Start development environment
docker-compose -f docker-compose.dev.yml up -d
```

### Making Changes

1. Edit code in your local `backend/` or `frontend/` directories
2. Changes automatically reflected:
   - Backend: Nodemon restarts server
   - Frontend: Vite HMR updates browser
3. Test changes at `http://localhost:3000`

### Running Tests

```bash
# Run backend tests
docker-compose -f docker-compose.dev.yml exec backend npm test

# Run specific test file
docker-compose -f docker-compose.dev.yml exec backend npm test -- contacts.test.js

# Watch mode
docker-compose -f docker-compose.dev.yml exec backend npm test -- --watch
```

### Database Management

```bash
# Initialize/reset database
docker-compose exec app npm run init-db

# Access database directly
docker-compose exec app sqlite3 /app/backend/database/business_events.db

# Backup database
docker cp business-event-manager:/app/backend/database/business_events.db ./backup.db

# Restore database
docker cp ./backup.db business-event-manager:/app/backend/database/business_events.db
```

## Production Deployment

### Building for Production

```bash
# Build optimized image
docker-compose build --no-cache

# Tag for registry
docker tag business-event-manager:latest your-registry/business-event-manager:v1.0.0

# Push to registry
docker push your-registry/business-event-manager:v1.0.0
```

### Deploying

```bash
# Pull latest image
docker-compose pull

# Start with latest image
docker-compose up -d

# Check health
docker-compose ps
curl http://localhost:5000/api/health
```

### Health Checks

The production container includes health checks:

```yaml
healthcheck:
  test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:5000/api/health"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

Check health status:

```bash
docker-compose ps
docker inspect business-event-manager | grep -A 10 Health
```

## Troubleshooting

### Container Won't Start

```bash
# Check logs
docker-compose logs

# Check if port is in use
netstat -an | grep 5000

# Remove and recreate
docker-compose down
docker-compose up -d
```

### Database Issues

```bash
# Reset database
docker-compose exec app npm run init-db

# Check database file permissions
docker-compose exec app ls -la /app/backend/database/

# Verify database integrity
docker-compose exec app sqlite3 /app/backend/database/business_events.db "PRAGMA integrity_check;"
```

### File Upload Issues

```bash
# Check uploads directory
docker-compose exec app ls -la /app/uploads/

# Fix permissions
docker-compose exec app chmod 777 /app/uploads/

# Verify volume mount
docker inspect business-event-manager | grep -A 20 Mounts
```

### Frontend Not Loading

```bash
# Verify frontend build
docker-compose exec app ls -la /app/frontend/dist/

# Check server logs
docker-compose logs app | grep "frontend"

# Rebuild without cache
docker-compose build --no-cache
docker-compose up -d
```

### Performance Issues

```bash
# Check resource usage
docker stats business-event-manager

# View container processes
docker-compose top

# Increase memory limit (in docker-compose.yml)
deploy:
  resources:
    limits:
      memory: 1G
```

## Security Considerations

### Production Hardening

1. **Run as non-root user**: Add to Dockerfile
```dockerfile
RUN addgroup -g 1001 appuser && \
    adduser -D -u 1001 -G appuser appuser
USER appuser
```

2. **Use secrets for sensitive data**:
```bash
docker secret create db_password ./db_password.txt
```

3. **Limit container capabilities**:
```yaml
security_opt:
  - no-new-privileges:true
cap_drop:
  - ALL
```

4. **Use read-only filesystem where possible**:
```yaml
read_only: true
tmpfs:
  - /tmp
```

### Network Security

```yaml
networks:
  backend:
    driver: bridge
    internal: true
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Docker Build and Deploy

on:
  push:
    branches: [ master ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build Docker image
        run: docker-compose build
      
      - name: Run tests
        run: docker-compose run app npm test
      
      - name: Push to registry
        run: |
          docker tag business-event-manager ${{ secrets.REGISTRY }}/business-event-manager:${{ github.sha }}
          docker push ${{ secrets.REGISTRY }}/business-event-manager:${{ github.sha }}
```

## Backup and Restore

### Automated Backups

```bash
#!/bin/bash
# backup.sh
docker exec business-event-manager sqlite3 /app/backend/database/business_events.db ".backup /tmp/backup.db"
docker cp business-event-manager:/tmp/backup.db ./backups/backup-$(date +%Y%m%d-%H%M%S).db
```

### Restore from Backup

```bash
# Stop container
docker-compose stop

# Replace database
cp ./backups/backup-20260129-120000.db ./backend/database/business_events.db

# Start container
docker-compose start
```

## Monitoring

### Logging

```bash
# Configure JSON logging in docker-compose.yml
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
```

### Metrics

```bash
# Export metrics
docker stats --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}" business-event-manager
```

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Node.js Docker Best Practices](https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md)
