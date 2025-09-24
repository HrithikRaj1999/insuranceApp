import React, { useState } from "react";
import { Container, Tabs, Tab, Box } from "@mui/material";
import Layout from "@components/Layout.js";
import ClaimForm from "@components/ClaimForm.js";
import SuccessNotification from "@components/Notifications.js";
import ClaimList from "@components/ClaimList.js";
import { ClaimFormData } from "./types/Claim.type.js";
import apiService from "@services/apiService.js";
import ClaimDialog from "@components/ClaimDialog.js";
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

const App: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [claims, setClaims] = useState<ClaimFormData[]>([]);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState("");
  const [notification, setNotification] = useState({
    open: false,
    message: "",
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"view" | "edit">("view");
  const [activeId, setActiveId] = useState<string | null>(null);

  const openDialog = (mode: "view" | "edit", id: string) => {
    setDialogMode(mode);
    setActiveId(id);
    setDialogOpen(true);
  };

  const handleViewClaim = (id: string) => openDialog("view", id);
  const handleEditClaim = (id: string) => openDialog("edit", id);

  const handleSaved = async () => {
    await loadClaims();
    setNotification({ open: true, message: "Claim updated successfully!" });
  };
  const handleSubmitClaim = async (data: ClaimFormData, file: File) => {
    setLoading(true);
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("policyId", data.policyId);
    formData.append("description", data.description);
    formData.append("file", file);

    try {
      const response = await apiService.submitClaim(formData);
      setSummary(response.summary || "");
      setNotification({
        open: true,
        message: "Claim submitted successfully!",
      });

      await loadClaims();

      setTimeout(() => setTabValue(1), 2000);
    } catch (error) {
      console.error("Error submitting claim:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loadClaims = async () => {
    try {
      const data = await apiService.getClaims();
      setClaims(data);
    } catch (error) {
      console.error("Error loading claims:", error);
    }
  };

  const handleDeleteClaim = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this claim?")) {
      try {
        await apiService.deleteClaim(id);
        await loadClaims();
        setNotification({
          open: true,
          message: "Claim deleted successfully!",
        });
      } catch (error) {
        console.error("Error deleting claim:", error);
      }
    }
  };

  React.useEffect(() => {
    if (tabValue === 1) {
      loadClaims();
    }
  }, [tabValue]);

  return (
    <Layout>
      <Container maxWidth="md">
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
            <Tab label="Submit Claim" />
            <Tab label="My Claims" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <ClaimForm
            onSubmit={handleSubmitClaim}
            summary={tabValue === 1 ? summary : null}
            loading={loading}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <ClaimList
            claims={claims}
            onView={handleViewClaim}
            onEdit={handleEditClaim}
            onDelete={handleDeleteClaim}
          />
        </TabPanel>
        <ClaimDialog
          open={dialogOpen}
          mode={dialogMode}
          claimId={activeId}
          onClose={() => setDialogOpen(false)}
          onSaved={handleSaved}
        />

        <SuccessNotification
          open={notification.open}
          message={notification.message}
          onClose={() => setNotification({ ...notification, open: false })}
        />
      </Container>
    </Layout>
  );
};

export default App;
