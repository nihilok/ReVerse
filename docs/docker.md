# Docker Setup & Deployment

This document explains how to deploy ReVerse using Docker for both development and production environments.

## Overview

The project includes:

- `Dockerfile` - Multi-stage build for production
- `docker-compose.yml` - Orchestration for services
- `scripts/deploy.sh` - Automated deployment script
- `.env.production.example` - Environment variable template

## Quick Deployment

### Using the Deployment Script (Recommended)

The easiest way to deploy:

```bash
./scripts/deploy.sh -d reverse.jarv.dev -k sk-ant-your-api-key
```

This automated script will:
1. ✅ Generate a secure authentication secret (32+ characters)
2. ✅ Create `.env.production` with all configuration
3. ✅ Build Docker images
4. ✅ Start PostgreSQL database and wait for it to be ready
5. ✅ Run database migrations
6. ✅ Start the application
7. ✅ Verify deployment is successful

**Example with custom PostgreSQL settings:**

```bash
./scripts/deploy.sh \
  --domain myapp.com \
  --api-key sk-ant-xxx \
  --db-user mydbuser \
  --db-password securepass123 \
  --db-name mydb
```

**Example with custom port:**

```bash
./scripts/deploy.sh \
  --domain myapp.com \
  --port 3001 \
  --api-key sk-ant-xxx
```

**Example with external database:**

```bash
./scripts/deploy.sh \
  --domain myapp.com \
  --api-key sk-ant-xxx \
  --db-url postgresql://user:pass@external-db.com:5432/mydb
```

**Deployment Options:**

| Option | Description | Default | Required |
|--------|-------------|---------|----------|
| `-d, --domain` | Your domain name | - | ✅ Yes |
| `-k, --api-key` | Anthropic API key | - | ✅ Yes |
| `-p, --port` | NextJS application port | 3000 | No |
| `-s, --secret` | Better Auth secret | Auto-generated | No |
| `--db-user` | PostgreSQL user | postgres | No |
| `--db-password` | PostgreSQL password | postgres | No |
| `--db-name` | Database name | appdb | No |
| `--db-host` | Database host | postgres | No |
| `--db-port` | Database port | 5432 | No |
| `--db-url` | Full database URL | Auto-built | No |
| `--no-build` | Skip building images | false | No |
| `--no-migrate` | Skip migrations | false | No |

**Quick Updates (Skip Rebuild):**

When you only change environment variables and don't need to rebuild:

```bash
./scripts/deploy.sh -d myapp.com -k sk-ant-xxx --no-build
```

Run `./scripts/deploy.sh --help` for complete documentation

## Docker Compose Services

### PostgreSQL

Database service running PostgreSQL 16:

```yaml
services:
  postgres:
    image: postgres:16-alpine
    container_name: app-template-postgres
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: appdb
    ports:
      - "5432:5432"
```

### Application

Next.js application in production mode:

```yaml
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
      target: production
    environment:
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/appdb
      NODE_ENV: production
    ports:
      - "3000:3000"
    depends_on:
      postgres:
        condition: service_healthy
```

## Development Setup

### Start Database Only

For local development where you run Next.js locally but want the database in Docker:

```bash
# Start PostgreSQL
docker-compose up postgres -d

# Verify it's running
docker-compose ps

# Check logs
docker-compose logs postgres
```

Then run the Next.js dev server locally:

```bash
npm run dev
```

### Start All Services

To run everything in Docker:

```bash
# Set required environment variables
export BETTER_AUTH_SECRET="your-production-secret-min-32-chars-long"

# Build and start all services
docker-compose up --build

# Or run in detached mode
docker-compose up -d --build
```

**Important**: The `BETTER_AUTH_SECRET` must be at least 32 characters long for production builds.

### Stop Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (deletes database data!)
docker-compose down -v
```

## Production Dockerfile

The Dockerfile uses multi-stage builds for optimization:

### Stage 1: Dependencies

```dockerfile
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
```

Installs only production dependencies.

### Stage 2: Builder

```dockerfile
FROM base AS builder

# Accept build arguments
ARG BETTER_AUTH_SECRET
ARG BETTER_AUTH_URL=http://localhost:3000
ARG DATABASE_URL

# Set as environment variables for build
ENV BETTER_AUTH_SECRET=${BETTER_AUTH_SECRET}
ENV BETTER_AUTH_URL=${BETTER_AUTH_URL}
ENV DATABASE_URL=${DATABASE_URL}

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build
```

Builds the Next.js application. Build arguments are required because Next.js evaluates environment variables during the build process for static optimization and server-side code bundling.

### Stage 3: Production

```dockerfile
FROM base AS production
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
```

Final production image:
- Uses non-root user for security
- Includes only necessary files
- Optimized for size and performance

## Building Images

### Build Production Image

When building the Docker image, you must provide required environment variables as build arguments:

```bash
docker build \
  --build-arg BETTER_AUTH_SECRET="your-production-secret-min-32-chars-long" \
  --build-arg DATABASE_URL="postgresql://user:pass@host:5432/db" \
  -t app-template:latest .
```

### Build with Cache

Docker BuildKit automatically caches layers:

```bash
docker build \
  --build-arg BETTER_AUTH_SECRET="your-production-secret-min-32-chars-long" \
  --build-arg DATABASE_URL="postgresql://user:pass@host:5432/db" \
  --cache-from app-template:latest \
  -t app-template:latest .
```

### Multi-Platform Build

For ARM and x86:

```bash
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t app-template:latest \
  .
```

## Running Containers

### Run Production Container

```bash
docker run -d \
  --name app-template \
  -p 3000:3000 \
  -e DATABASE_URL=postgresql://user:pass@host:5432/db \
  -e BETTER_AUTH_SECRET=your-secret \
  -e BETTER_AUTH_URL=http://localhost:3000 \
  app-template:latest
```

### Run with Environment File

```bash
docker run -d \
  --name app-template \
  -p 3000:3000 \
  --env-file .env.production \
  app-template:latest
```

### Connect to Running Container

```bash
# Execute commands in container
docker exec -it app-template sh

# View logs
docker logs -f app-template

# Inspect container
docker inspect app-template
```

## Database Management

### Access PostgreSQL

```bash
# Connect to PostgreSQL container
docker-compose exec postgres psql -U postgres -d appdb

# Or using docker directly
docker exec -it app-template-postgres psql -U postgres -d appdb
```

### Backup Database

```bash
# Create backup
docker-compose exec postgres pg_dump -U postgres appdb > backup.sql

# Restore backup
docker-compose exec -T postgres psql -U postgres appdb < backup.sql
```

### Reset Database

```bash
# Stop and remove volumes
docker-compose down -v

# Start fresh
docker-compose up postgres -d

# Run migrations
npm run db:push
```

## Volumes and Persistence

### Database Persistence

PostgreSQL data is stored in a Docker volume:

```yaml
volumes:
  postgres_data:
```

This ensures data persists between container restarts.

### List Volumes

```bash
docker volume ls

# Inspect volume
docker volume inspect app-template_postgres_data
```

### Remove Volumes

```bash
# Remove all project volumes
docker-compose down -v

# Remove specific volume
docker volume rm app-template_postgres_data
```

## Networking

Services communicate through Docker's internal network:

```yaml
services:
  app:
    environment:
      # Uses service name as hostname
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/appdb
```

### Access from Host

```bash
# App is available at
http://localhost:3000

# Database is available at
postgresql://postgres:postgres@localhost:5432/appdb
```

## Optimization Tips

### 1. Use .dockerignore

Create `.dockerignore` to exclude unnecessary files:

```
node_modules
.next
.git
.env*
!.env.example
*.log
.DS_Store
coverage
```

### 2. Layer Caching

Order Dockerfile commands from least to most frequently changed:

1. Base image and system packages
2. Dependencies (package.json)
3. Application code
4. Build step

### 3. Multi-Stage Builds

Separates build dependencies from runtime, reducing image size.

### 4. Use Alpine Images

Alpine Linux images are much smaller:

```dockerfile
FROM node:20-alpine  # ~100MB
# vs
FROM node:20         # ~900MB
```

## Troubleshooting

### Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>

# Or change port in docker-compose.yml
ports:
  - "3001:3000"
```

### Build Failures

```bash
# Clean build cache
docker builder prune

# Rebuild without cache
docker-compose build --no-cache
```

### Database Connection Issues

```bash
# Check if PostgreSQL is ready
docker-compose exec postgres pg_isready

# Check logs
docker-compose logs postgres

# Verify connection string
docker-compose exec app env | grep DATABASE_URL
```

### Container Won't Start

```bash
# Check logs
docker-compose logs app

# Check container status
docker-compose ps

# Restart services
docker-compose restart app
```

## CI/CD Integration

The GitHub Actions workflow builds and tests Docker images:

```yaml
- name: Build Docker image
  uses: docker/build-push-action@v5
  with:
    context: .
    push: false
    tags: app-template:latest
    cache-from: type=gha
    cache-to: type=gha,mode=max
```

For production deployment, push to a registry:

```yaml
- name: Login to Docker Hub
  uses: docker/login-action@v3
  with:
    username: ${{ secrets.DOCKER_USERNAME }}
    password: ${{ secrets.DOCKER_PASSWORD }}

- name: Build and push
  uses: docker/build-push-action@v5
  with:
    context: .
    push: true
    tags: username/app-template:latest
```

## Production Deployment

For production, consider:

1. **Container Registry**: Push to Docker Hub, GitHub Container Registry, or AWS ECR
2. **Orchestration**: Use Kubernetes, Docker Swarm, or AWS ECS
3. **Environment Variables**: Use secrets management (AWS Secrets Manager, Vault)
4. **Health Checks**: Implement proper health check endpoints
5. **Monitoring**: Add logging and metrics (Prometheus, Grafana)
6. **Scaling**: Configure horizontal scaling based on load

Example Kubernetes deployment:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: app-template
spec:
  replicas: 3
  selector:
    matchLabels:
      app: app-template
  template:
    metadata:
      labels:
        app: app-template
    spec:
      containers:
      - name: app
        image: app-template:latest
        ports:
        - containerPort: 3000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: database-url
```
