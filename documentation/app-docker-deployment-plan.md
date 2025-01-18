# NoSwipe Docker Deployment Plan

## Overview
This document outlines the steps to containerize and deploy NoSwipe on Digital Ocean, with separate containers for the Django backend and Next.js frontend.

## Current Status: Planning Phase ⏳

## Phase 1: Local Docker Setup ⏳

### Backend Containerization
- [ ] Create Django Dockerfile
```dockerfile
FROM python:3.10-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Set work directory
WORKDIR /app/backend

# Install Python dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY backend/ .

# Collect static files
RUN python manage.py collectstatic --noinput

# Expose port
EXPOSE 8000

# Run gunicorn
CMD ["gunicorn", "backend.wsgi:application", "--bind", "0.0.0.0:8000"]
```

### Frontend Containerization
- [ ] Create Next.js Dockerfile
```dockerfile
FROM node:18-alpine

# Set work directory
WORKDIR /app/frontend

# Install dependencies
COPY frontend/package*.json ./
RUN npm ci

# Copy project files
COPY frontend/ .

# Build application
RUN npm run build

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
```

### Docker Compose Setup
- [ ] Create docker-compose.yml
```yaml
version: '3.8'

services:
  backend:
    build: 
      context: .
      dockerfile: backend/Dockerfile
    ports:
      - "8000:8000"
    environment:
      - DEBUG=0
      - DJANGO_SETTINGS_MODULE=backend.settings
      - ALLOWED_HOSTS=localhost,127.0.0.1
    volumes:
      - backend_static:/app/backend/staticfiles
      - backend_media:/app/backend/media

  frontend:
    build:
      context: .
      dockerfile: frontend/Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:8000
    depends_on:
      - backend

volumes:
  backend_static:
  backend_media:
```

### Local Testing
- [ ] Test backend container build and run
- [ ] Test frontend container build and run
- [ ] Test docker-compose full stack deployment
- [ ] Verify all features work in containerized environment
- [ ] Document any required environment variables

## Phase 2: Digital Ocean Setup 🔲

### Infrastructure Setup
- [ ] Create Digital Ocean account
- [ ] Install doctl CLI tool
- [ ] Set up Container Registry
- [ ] Create App Platform project
- [ ] Configure environment variables
- [ ] Set up networking rules

### Domain and SSL
- [ ] Purchase domain (if needed)
- [ ] Configure DNS settings
- [ ] Set up SSL certificates
- [ ] Configure CORS settings

### Deployment Configuration
- [ ] Create app specification
```yaml
name: noswipe
region: nyc
services:
  - name: backend
    github:
      repo: gabrielebardi/NoSwipe
      branch: main
      deploy_on_push: true
    source_dir: backend
    dockerfile_path: backend/Dockerfile
    http_port: 8000
    instance_size_slug: basic-xxs
    instance_count: 1
    routes:
      - path: /api
      - path: /admin
      - path: /static
      - path: /media

  - name: frontend
    github:
      repo: gabrielebardi/NoSwipe
      branch: main
      deploy_on_push: true
    source_dir: frontend
    dockerfile_path: frontend/Dockerfile
    http_port: 3000
    instance_size_slug: basic-xxs
    instance_count: 1
    routes:
      - path: /
```

## Phase 3: CI/CD Setup 🔲

### GitHub Actions
- [ ] Create deployment workflow
```yaml
name: Deploy to Digital Ocean
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install doctl
        uses: digitalocean/action-doctl@v2
        with:
          token: ${{ secrets.DIGITALOCEAN_ACCESS_TOKEN }}
      - name: Deploy to Digital Ocean
        run: doctl apps create-deployment ${{ secrets.APP_ID }}
```

### Monitoring Setup
- [ ] Set up error tracking (Sentry)
- [ ] Configure performance monitoring
- [ ] Set up logging aggregation
- [ ] Create monitoring dashboards

## Phase 4: Production Deployment 🔲

### Pre-deployment Checklist
- [ ] Verify all environment variables
- [ ] Check security settings
- [ ] Test backup procedures
- [ ] Document rollback procedures

### Deployment Steps
- [ ] Deploy backend container
- [ ] Deploy frontend container
- [ ] Verify all services are running
- [ ] Test all critical paths
- [ ] Monitor for any issues

### Post-deployment
- [ ] Set up automated backups
- [ ] Configure auto-scaling rules
- [ ] Document maintenance procedures
- [ ] Set up alerting

## Cost Estimates (Monthly)
- App Platform Basic: $12 (2 containers)
- Container Registry: Free tier
- Domain: ~$1/month
- **Total Estimated**: $13/month

## Status Legend
- ✅ Completed
- ⏳ In Progress
- 🔲 Not Started

## Notes
1. All secrets and API keys should be stored as environment variables
2. Regular security updates should be automated
3. Implement rate limiting and CORS properly
4. Set up proper logging and monitoring from day one
5. Document all deployment procedures

## Rollback Procedures
1. Keep last 3 working versions tagged in registry
2. Document steps to revert to previous version
3. Test rollback procedures regularly

Remember to update this plan as we progress and add more specific details based on our implementation.
