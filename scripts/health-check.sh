#!/bin/bash

# Health check endpoint
HEALTH_URL="http://localhost:5000/api/health"
MAX_ATTEMPTS=30
ATTEMPT=0

while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
    if curl -f $HEALTH_URL > /dev/null 2>&1; then
        echo "Health check passed!"
        exit 0
    fi
    
    echo "Attempt $((ATTEMPT + 1))/$MAX_ATTEMPTS failed, retrying..."
    sleep 2
    ATTEMPT=$((ATTEMPT + 1))
done

echo "Health check failed after $MAX_ATTEMPTS attempts"
exit 1