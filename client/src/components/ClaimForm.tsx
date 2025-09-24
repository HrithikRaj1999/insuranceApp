import React, { useState } from "react";
import {
  Paper,
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  CircularProgress,
} from "@mui/material";
import { ClaimFormData, FormErrors } from "@types/index.js";
import { validateClaimForm } from "@/utils/validators.js";
import FileUpload from "./FileUpload.js";
import ClaimSummary from "./ClaimSummary.js";

interface ClaimFormProps {
  onSubmit: (data: ClaimFormData, file: File) => Promise<void>;
  summary?: string;
  loading?: boolean;
}

const ClaimForm: React.FC<ClaimFormProps> = ({
  onSubmit,
  summary,
  loading = false,
}) => {
  const [formData, setFormData] = useState<ClaimFormData>({
    name: "",
    policyId: "",
    description: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});

  const handleInputChange =
    (field: keyof ClaimFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormData({ ...formData, [field]: e.target.value });

      if (errors[field]) {
        setErrors({ ...errors, [field]: "" });
      }
    };

  const handleFileChange = (newFile: File | null) => {
    setFile(newFile);
    if (newFile && errors.file) {
      setErrors({ ...errors, file: "" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateClaimForm(formData, file);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      await onSubmit(formData, file!);

      setFormData({ name: "", policyId: "", description: "" });
      setFile(null);
      setErrors({});
    } catch (error) {
      setErrors({ submit: "Failed to submit claim. Please try again." });
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Insurance Claim Submission
      </Typography>

      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
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
          disabled={loading}
        />

        <TextField
          fullWidth
          label="Policy ID"
          variant="outlined"
          value={formData.policyId}
          onChange={handleInputChange("policyId")}
          error={!!errors.policyId}
          helperText={errors.policyId || "Format: 6-12 alphanumeric characters"}
          margin="normal"
          required
          disabled={loading}
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
          disabled={loading}
        />

        <FileUpload
          file={file}
          onFileChange={handleFileChange}
          error={errors.file}
          disabled={loading}
        />

        {errors.submit && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errors.submit}
          </Alert>
        )}

        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={loading}
          size="large"
          sx={{ mt: 2, py: 1.5 }}
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            "Submit Claim"
          )}
        </Button>
      </Box>

      {summary && <ClaimSummary summary={summary} />}
    </Paper>
  );
};

export default ClaimForm;
