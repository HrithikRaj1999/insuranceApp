import React from "react";
import apiService from "@services/apiService";
import type { ClaimFormData } from "@/types/Claim.type";
import ClaimForm from "./ClaimForm";

const SubmitClaim: React.FC = () => {
  const handleSubmitClaim = async (data: ClaimFormData, files: File[]) => {
    await apiService.submitClaim(data, files);
  };

  return (
    <ClaimForm
      onSubmit={handleSubmitClaim}
      summary=""
      loading={false}
      mode="create"
    />
  );
};

export default SubmitClaim;
