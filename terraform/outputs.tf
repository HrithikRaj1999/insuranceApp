output "ec2_public_ip" {
  description = "Public IP of the EC2 instance"
  value       = aws_instance.app_server.public_ip
}

output "ec2_public_dns" {
  description = "Public DNS of the EC2 instance"
  value       = aws_instance.app_server.public_dns
}

output "s3_bucket_name" {
  description = "Private S3 bucket name"
  value       = aws_s3_bucket.uploads.bucket
}

output "s3_bucket_api_endpoint" {
  description = "Base S3 endpoint (bucket is private; use presigned URLs)."
  value       = "https://${aws_s3_bucket.uploads.bucket}.s3.${var.aws_region}.amazonaws.com/"
}
