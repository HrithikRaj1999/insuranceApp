# client
VITE_API_URL=http://localhost:8080

# Server

PORT=8080
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/insurance-claims
LOG_LEVEL=info

OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
OPENAI_MODEL=gpt-3.5-turbo
OPENAI_MAX_TOKENS=100
OPENAI_TEMPERATURE=0.3
# Hard gate to prevent paid usage:
ALLOW_OPENAI_PAID=false
USE_MOCK_AI=true

AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
S3_BUCKET_NAME=insurance-claims-bucket
AWS_S3_PREFIX=claims
S3_OBJECT_ACL=private
# If true, API returns time-limited signed URLs for S3 objects
USE_SIGNED_URLS=true

########################################
# CORS
########################################
# Comma-separated list (no spaces) e.g. http://localhost:3000,https://yourdomain.com
CORS_ORIGINS=http://localhost:3000
