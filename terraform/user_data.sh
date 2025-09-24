#!/bin/bash
set -e

# Update system
apt-get update
apt-get upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
usermod -aG docker ubuntu

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Install Git
apt-get install -y git

# Clone repository
cd /home/ubuntu
git clone ${github_repo} insurance-app
cd insurance-app

# Create .env file
cat > .env <<EOF
NODE_ENV=production
AWS_REGION=${AWS::Region}
S3_BUCKET_NAME=${project_name}-uploads
EOF

# Start application
docker-compose up -d

# Setup auto-start on reboot
cat > /etc/systemd/system/insurance-app.service <<EOF
[Unit]
Description=Insurance App
After=docker.service
Requires=docker.service

[Service]
Type=simple
WorkingDirectory=/home/ubuntu/insurance-app
ExecStart=/usr/local/bin/docker-compose up
ExecStop=/usr/local/bin/docker-compose down
Restart=always

[Install]
WantedBy=multi-user.target
EOF

systemctl enable insurance-app