import React, { useEffect, useMemo, useState, useCallback } from "react";
import debounce from "lodash/debounce";
import {
  Paper,
  TextField,
  Button,
  Box,
  Typography,
  Alert,
} from "@mui/material";
import { validateClaimForm } from "@/utils/validators.js";
import FileUpload from "./FileUpload.js";
import ClaimSummary from "./ClaimSummary.js";
import { Claim, ClaimFormData, FormErrors } from "@/types/Claim.type.js";
import apiService from "@services/apiService.js";

interface ClaimFormProps {
  onSubmit: (data: ClaimFormData, file: File | null) => void;
  summary: string;
  loading: boolean;
  initial?: Partial<Claim>;
  mode?: "view" | "edit";
}

const MIN_POLICY_LENGTH = 6;
const DEBOUNCE_MS = 400;

const ClaimForm: React.FC<ClaimFormProps> = ({
  onSubmit,
  initial,
  summary,
  mode,
  loading = false,
}) => {
  const [formData, setFormData] = useState<ClaimFormData>(() => ({
    name: initial?.name ?? "",
    policyId: initial?.policy.policyNumber ?? "",
    description: initial?.description ?? "",
  }));
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [policyChecking, setPolicyChecking] = useState(false);
  const [policyValid, setPolicyValid] = useState<boolean | null>(null);
  const readOnly = mode === "view";

  const checkPolicyExists = useCallback(async (id: string) => {
    if (!id || id.length < MIN_POLICY_LENGTH) return;
    setPolicyChecking(true);
    try {
      const exists = await apiService.policyExists(id);
      setPolicyValid(exists);
      if (!exists) {
        setErrors((prev) => ({
          ...prev,
          policyId: "Policy ID not found. Please check and try again.",
        }));
      }
    } catch {
      setPolicyValid(false);
      setErrors((prev) => ({
        ...prev,
        policyId: "Could not verify Policy ID. Please try again.",
      }));
    } finally {
      setPolicyChecking(false);
    }
  }, []);

  const debouncedCheck = useMemo(
    () => debounce((id: string) => checkPolicyExists(id), DEBOUNCE_MS),
    [checkPolicyExists]
  );

  const handleInputChange =
    (field: keyof ClaimFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const v = e.target.value;
      setFormData((prev) => ({
        ...prev,
        [field]: field === "policyId" ? v.toUpperCase() : v,
      }));
      if (field === "policyId") {
        debouncedCheck(v.toUpperCase());
      }
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
      setPolicyChecking(true);
      const exists = await apiService.policyExists(formData.policyId);
      setPolicyValid(exists);
      if (!exists) {
        setErrors((prev) => ({
          ...prev,
          policyId: "Policy ID not found. Please check and try again.",
        }));
        return;
      }
    } finally {
      setPolicyChecking(false);
    }
    try {
      await onSubmit(formData, file);
      if (!initial) {
        setFormData({ name: "", policyId: "", description: "" });
        setFile(null);
        setPolicyValid(null);
      }
      setErrors({});
    } catch {
      setErrors({ submit: "Failed to submit claim. Please try again." });
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Enter Details To Reimburse
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
          helperText={
            errors.policyId ||
            (policyChecking
              ? "Checking policy..."
              : policyValid === true
              ? "Policy verified."
              : "Format: 6–12 alphanumeric characters")
          }
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
          disabled={loading || readOnly}
        />
        {errors.submit && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errors.submit}
          </Alert>
        )}
        {!readOnly && mode !== "edit" && (
          <Button
            type="submit"
            variant="contained"
            disabled={loading || policyChecking}
          >
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
