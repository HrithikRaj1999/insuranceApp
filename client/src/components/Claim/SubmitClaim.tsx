import React from "react";
import apiService from "@services/apiService";
import type { ClaimFormData } from "@/types";
import ClaimForm from "./ClaimForm";
const SubmitClaim: React.FC = () => {
  const [submutiing,setSubmitting]= React.useState(false)
  const handleSubmitClaim = async (data: ClaimFormData, files: File[]) => {
    setSubmitting(true)
    await apiService.submitClaim(data, files);
    setSubmitting(false)

  };
  return <ClaimForm onSubmit={handleSubmitClaim} summary="" loading={submutiing} mode="create" />;
};
export default SubmitClaim;