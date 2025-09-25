#!/bin/bash
set -euxo pipefail

# ----- Variables injected by Terraform -----
PROJECT_NAME=${project_name}
AWS_REGION=${aws_region}
S3_BUCKET_NAME=${s3_bucket_name}
GITHUB_REPO=${github_repo}

# ----- Update & prerequisites -----
apt-get update
apt-get install -y ca-certificates curl git

# ----- Docker official apt repo -----
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
chmod a+r /etc/apt/keyrings/docker.asc

. /etc/os-release || true
CODENAME="$UBUNTU_CODENAME"
if [ -z "$CODENAME" ]; then CODENAME="$VERSION_CODENAME"; fi

ARCH="$(dpkg --print-architecture)"

cat >/etc/apt/sources.list.d/docker.list <<EOF
deb [arch=$ARCH signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $CODENAME stable
EOF

apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Let 'ubuntu' run docker without sudo
usermod -aG docker ubuntu
systemctl enable --now docker

# ----- Clone repo (idempotent) -----
cd /home/ubuntu
if [ ! -d "insuranceApp" ]; then
  git clone "$GITHUB_REPO" insuranceApp
  chown -R ubuntu:ubuntu insuranceApp
fi

# ----- Build Frontend Docker Image -----
cd /home/ubuntu/insuranceApp/client
docker build -t fe:latest .

# ----- Build Backend Docker Image -----
cd /home/ubuntu/insuranceApp/server
docker build -t be:latest .

# ----- Start Docker Compose -----
cd /home/ubuntu/insuranceApp/docker
docker compose up -d
