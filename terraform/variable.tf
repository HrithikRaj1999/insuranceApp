variable "aws_region" {
  description = "AWS region to deploy into"
  type        = string
  default     = "ap-south-1" # Mumbai
}

variable "project_name" {
  description = "Project name (used for tags and names)"
  type        = string
  default     = "insuranceApp"
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t3.medium"
}

variable "key_pair_name" {
  description = "Existing EC2 key pair name in the chosen region"
  type        = string
}

variable "github_repo" {
  description = "GitHub repository to clone on boot"
  type        = string
  default     = "https://github.com/HrithikRaj1999/insuranceApp"
}
