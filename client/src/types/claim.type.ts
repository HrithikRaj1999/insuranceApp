export interface Claim {
  id?: string;
  name: string;
  policyId: string;
  description: string;
  summary?: string;
  fileUrl?: string;
  fileS3Url?: string;
  fileS3Key?: string;
  fileLocalPath?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ClaimFormData {
  name: string;
  policyId: string;
  description: string;
}

export interface ApiError {
  error: string;
  message?: string;
}

export interface FormErrors {
  [key: string]: string;
}