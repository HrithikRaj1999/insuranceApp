import { ClaimFormData, FormErrors } from "../types/index.js";
export const validateClaimForm = (data: ClaimFormData, file: File | null): FormErrors => {
  const errors: FormErrors = {};
  if (!data.name.trim()) {
    errors.name = "Name is required";
  } else if (data.name.length < 2) {
    errors.name = "Name must be at least 2 characters";
  }
  if (!data.policyId.trim()) {
    errors.policyId = "Policy ID is required";
  }
  if (!data.description.trim()) {
    errors.description = "Description is required";
  } else if (data.description.length < 20) {
    errors.description = "Description must be at least 20 characters";
  }
  if (!file) {
    errors.file = "File is required";
  } else if (file.size > 10 * 1024 * 1024) {
    errors.file = "File size must be less than 10MB";
  }
  return errors;
};
export const formatDate = (date: string | Date): string => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};
