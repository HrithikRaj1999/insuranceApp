import React from "react";
import { Box } from "@mui/material";
import { useNavigate, useParams, useMatch } from "react-router-dom";
import apiService from "@services/apiService.js";
const ClaimList = React.lazy(() => import("@components/Claim/ClaimList"));
const ClaimListPage: React.FC = () => {
  const navigate = useNavigate();
  const params = useParams<{
    id: string;
  }>();
  const matchView = useMatch("/claims/:id");
  const matchEdit = useMatch("/claims/:id/edit");
  const dialogOpen = !!(matchView || matchEdit);
  const dialogMode: "view" | "edit" = matchEdit ? "edit" : "view";
  const activeId = params.id ?? null;
  const [claims, setClaims] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const loadClaims = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiService.getClaims();
      setClaims(data);
    } catch (e) {
      console.error("Error loading claims:", e);
    } finally {
      setLoading(false);
    }
  }, []);
  React.useEffect(() => {
    loadClaims();
  }, [loadClaims]);
  const openDialog = (mode: "view" | "edit", id: string) => {
    navigate(mode === "edit" ? `/claims/${id}/edit` : `/claims/${id}`);
  };
  const handleViewClaim = (id: string) => openDialog("view", id);
  const handleEditClaim = (id: string) => openDialog("edit", id);
  const handleDeleteClaim = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this claim?")) return;
    try {
      await apiService.deleteClaim(id);
      await loadClaims();
    } catch (e) {
      console.error("Error deleting claim:", e);
    }
  };

  return (
    <Box>
      <ClaimList
        loading={loading}
        claims={claims}
        onView={handleViewClaim}
        onEdit={handleEditClaim}
        onDelete={handleDeleteClaim}
      />
    </Box>
  );
};
export default ClaimListPage;
