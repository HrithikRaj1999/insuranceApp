import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import apiService from "@services/apiService.js";
import type { ClaimFormData } from "@/types/Claim.type.js";
import Loader from "@/utils/Loader";

const ClaimForm = React.lazy(() => import("@components/ClaimForm"));

const ClaimEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [initial, setInitial] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await apiService.getClaim(id!);
        if (alive) setInitial(data);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [id]);

  const handleUpdate = async (data: ClaimFormData, file: File | null) => {
    setSaving(true);
    try {
      const form = new FormData();
      form.append("name", data.name);
      form.append("policyId", data.policyId);
      form.append("description", data.description);
      if (file) form.append("file", file);
      await apiService.updateClaim(id!, form);
      navigate("/claims");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader />;
  if (!initial) return <div style={{ padding: 24 }}>Claim not found.</div>;

  return (
    <ClaimForm
      onSubmit={handleUpdate}
      summary={initial.summary ?? ""}
      loading={saving}
      initial={initial}
      mode="edit"
    />
  );
};

export default ClaimEditPage;
