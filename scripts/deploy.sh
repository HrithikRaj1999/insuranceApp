#!/bin/bash
set -e

echo "Starting deployment..."

# Pull latest code
git pull origin main

# Build and start containers
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Health check
sleep 10
curl -f http://localhost:8080/api/health || exit 1

echo "Deployment completed successfully!"