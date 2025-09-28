import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import apiService from "@services/apiService.js";
import type { ClaimFormData } from "@/types";
import Loader from "@components/UI/Loader";
const ClaimForm = React.lazy(() => import("@components/Claim/ClaimForm"));
const ClaimEditPage: React.FC = () => {
  const {
    id
  } = useParams<{
    id: string;
  }>();
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
  const handleUpdate = async (data: ClaimFormData, files: File[]) => {
    if (!id) {
      console.error("Missing claim id in route.");
      return;
    }
    setSaving(true);
    try {
      await apiService.updateClaim(id, data, files);
      navigate("/claims");
    } finally {
      setSaving(false);
    }
  };
  if (loading) return <Loader />;
  if (!initial) return <div style={{
    padding: 24
  }}>
        Claim not found.
      </div>;
  return <ClaimForm onSubmit={handleUpdate} summary={initial.summary ?? ""} loading={saving} initial={initial} mode="edit" />;
};
export default ClaimEditPage;