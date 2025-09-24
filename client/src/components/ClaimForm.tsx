import React, { useEffect, useState } from "react";
import {
  Paper,
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  CircularProgress,
} from "@mui/material";
import { validateClaimForm } from "@/utils/validators.js";
import FileUpload from "./FileUpload.js";
import ClaimSummary from "./ClaimSummary.js";
import { Claim, ClaimFormData, FormErrors } from "@/types/Claim.type.js";

interface ClaimFormProps {
  onSubmit: (data: ClaimFormData, file: File | null) => void;
  summary: string;
  loading: boolean;
  initial?: Partial<Claim>;
  mode?: "view" | "edit";
}

const ClaimForm: React.FC<ClaimFormProps> = ({
  onSubmit,
  initial,
  summary,
  mode,
  loading = false,
}) => {
  const [formData, setFormData] = useState<ClaimFormData>({
    name: "",
    policyId: "",
    description: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const readOnly = mode === "view";
  useEffect(() => {
    if (initial) {
      setFormData({
        name: initial.name ?? "",
        policyId: initial.policyId ?? "",
        description: initial.description ?? "",
      });
    }
  }, [initial]);

  const handleInputChange =
    (field: keyof ClaimFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const v = e.target.value;
      setFormData((prev) => ({
        ...prev,
        [field]: field === "policyId" ? v.toUpperCase() : v, // keep Policy ID uppercase
      }));
      if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
    };

  const handleFileChange = (newFile: File | null) => {
    setFile(newFile);
    if (newFile && errors.file) setErrors((prev) => ({ ...prev, file: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateClaimForm(formData, file);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    try {
      await onSubmit(formData, file);
      // If this form is used for "Create", reset afterwards:
      if (!initial) {
        setFormData({ name: "", policyId: "", description: "" });
        setFile(null);
      }
      setErrors({});
    } catch {
      setErrors({ submit: "Failed to submit claim. Please try again." });
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Happy Claim
      </Typography>

      <Box
        component="form"
        id="claim-form"
        onSubmit={handleSubmit}
        sx={{ mt: 3 }}
      >
        <TextField
          fullWidth
          label="Full Name"
          variant="outlined"
          value={formData.name}
          onChange={handleInputChange("name")}
          error={!!errors.name}
          helperText={errors.name}
          margin="normal"
          required
          disabled={loading || readOnly}
        />

        <TextField
          fullWidth
          label="Policy ID"
          variant="outlined"
          value={formData.policyId}
          onChange={handleInputChange("policyId")}
          error={!!errors.policyId}
          helperText={errors.policyId || "Format: 6–12 alphanumeric characters"}
          margin="normal"
          required
          disabled={loading || readOnly}
          inputProps={{ style: { textTransform: "uppercase" } }}
        />

        <TextField
          fullWidth
          multiline
          rows={4}
          label="Claim Description"
          variant="outlined"
          value={formData.description}
          onChange={handleInputChange("description")}
          error={!!errors.description}
          helperText={
            errors.description ||
            `${formData.description.length}/20 characters minimum`
          }
          margin="normal"
          required
          disabled={loading || readOnly}
        />

        <FileUpload
          file={file}
          onFileChange={handleFileChange}
          error={errors.file}
          disabled={loading || readOnly} // also disable file in read-only mode
        />

        {errors.submit && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errors.submit}
          </Alert>
        )}

        {!readOnly && mode !== "edit" && (
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? "Submitting..." : "Submit"}
          </Button>
        )}
      </Box>

      {summary && (
        <ClaimSummary defaultValue={initial?.summary ?? ""} summary={summary} />
      )}
    </Paper>
  );
};

export default ClaimForm;
