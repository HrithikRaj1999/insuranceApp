import React from "react";
import apiService from "@services/apiService.js";
import ClaimForm from "./ClaimForm.js";

const SubmitClaimPage: React.FC = () => {
  const [loading, setLoading] = React.useState(false);
  const [summary, setSummary] = React.useState("");

  const handleSubmitClaim = async (data: any, file: File | null) => {
    setLoading(true);
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("policyId", data.policyId);
    formData.append("description", data.description);
    if (file) formData.append("file", file);

    try {
      const response = await apiService.submitClaim(formData);
      setSummary(response.summary || "");
    } finally {
      setLoading(false);
    }
  };

  return (
    <React.Suspense fallback={<div style={{ padding: 24 }}>Loading…</div>}>
      <ClaimForm
        onSubmit={handleSubmitClaim}
        summary={summary}
        loading={loading}
      />
    </React.Suspense>
  );
};

export default SubmitClaimPage;
