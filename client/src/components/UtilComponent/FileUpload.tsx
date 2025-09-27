import React from "react";
import { Button, Alert, Box, Typography, IconButton } from "@mui/material";
import { formatFileSize } from "@/utils/validators.js";
import { CheckCircle, CloudUpload, Delete } from "@mui/icons-material";
interface FileUploadProps {
  file: File | null;
  onFileChange: (file: File | null) => void;
  error?: string;
  disabled?: boolean;
}
const FileUpload: React.FC<FileUploadProps> = ({ file, onFileChange, error, disabled = false }) => {
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      onFileChange(selectedFile);
    }
  };
  const handleRemoveFile = () => {
    onFileChange(null);
  };
  return (
    <Box
      sx={{
        mt: 2,
        mb: 1,
      }}
    >
      {!file ? (
        <Button
          variant="outlined"
          component="label"
          fullWidth
          startIcon={<CloudUpload />}
          disabled={disabled}
        >
          Upload File (PDF/Image, Max 10MB)
          <input
            type="file"
            hidden
            accept=".pdf,image/*"
            onChange={handleFileSelect}
            disabled={disabled}
          />
        </Button>
      ) : (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            p: 2,
            border: "1px solid",
            borderColor: "success.main",
            borderRadius: 1,
            bgcolor: "success.50",
          }}
        >
          <CheckCircle
            color="success"
            sx={{
              mr: 1,
            }}
          />
          <Box
            sx={{
              flexGrow: 1,
            }}
          >
            <Typography variant="body1">{file.name}</Typography>
            <Typography variant="caption" color="text.secondary">
              {formatFileSize(file.size)}
            </Typography>
          </Box>
          <IconButton onClick={handleRemoveFile} disabled={disabled} size="small">
            <Delete />
          </IconButton>
        </Box>
      )}

      {error && (
        <Alert
          severity="error"
          sx={{
            mt: 1,
          }}
        >
          {error}
        </Alert>
      )}
    </Box>
  );
};
export default FileUpload;
