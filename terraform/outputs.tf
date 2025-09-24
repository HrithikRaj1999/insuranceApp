output "ec2_public_ip" {
  description = "Public IP of EC2 instance"
  value       = aws_instance.app_server.public_ip
}

output "ec2_public_dns" {
  description = "Public DNS of EC2 instance"
  value       = aws_instance.app_server.public_dns
}

output "s3_bucket_name" {
  description = "Name of S3 bucket"
  value       = aws_s3_bucket.uploads.id
}

output "ecr_frontend_repository_url" {
  description = "URL of ECR repository for frontend"
  value       = aws_ecr_repository.frontend.repository_url
}

output "ecr_backend_repository_url" {
  description = "URL of ECR repository for backend"
  value       = aws_ecr_repository.backend.repository_url
}

output "app_url" {
  description = "Application URL"
  value       = "http://${aws_instance.app_server.public_ip}"
}