import React, { useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import debounce from "lodash/debounce";
import {
  Paper,
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  LinearProgress,
  InputAdornment,
  Fade,
  Zoom,
  Chip,
  Divider,
  Container,
  useTheme,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Stack,
} from "@mui/material";
import {
  Person as PersonIcon,
  Policy as PolicyIcon,
  Description as DescriptionIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Upload as UploadIcon,
  Send as SendIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { keyframes, alpha } from "@mui/system";
import { validateClaimForm } from "@/utils/validators.js";
import ClaimSummary from "./ClaimSummary.js";
import apiService from "@services/apiService.js";
import { Claim, ClaimFormData, FormErrors } from "@typings";
interface ClaimFormProps {
  onSubmit: (data: ClaimFormData, files: File[]) => void;
  summary: string;
  loading: boolean;
  initial?: Partial<Claim>;
  mode?: "view" | "edit" | "create";
}
const MIN_POLICY_LENGTH = 6;
const DEBOUNCE_MS = 400;
const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;
const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(102, 126, 234, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(102, 126, 234, 0); }
  100% { box-shadow: 0 0 0 0 rgba(102, 126, 234, 0); }
`;
const ClaimForm: React.FC<ClaimFormProps> = ({
  onSubmit,
  initial,
  summary,
  mode,
  loading = false,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const navigate = useNavigate();
  const grad = `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`;
  const [formData, setFormData] = useState<ClaimFormData>(() => ({
    name: initial?.name ?? "",
    policyId: initial?.policy?.policyNumber ?? "",
    description: initial?.description ?? "",
  }));
  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [policyChecking, setPolicyChecking] = useState(false);
  const [policyValid, setPolicyValid] = useState<boolean | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const readOnly = mode === "view";
  const HideHeaderForm = mode === "view" || mode === "edit";
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
      if (field === "policyId") debouncedCheck(v.toUpperCase());
      if (errors[field])
        setErrors((prev) => ({
          ...prev,
          [field]: "",
        }));
    };
  const pickFiles = (list: FileList | null) => {
    if (!list) return;
    const next: File[] = [];
    for (let i = 0; i < list.length; i++) {
      const f = list.item(i);
      if (!f) continue;
      if (f.type !== "application/pdf") continue;
      next.push(f);
    }
    const merged = [...files, ...next].slice(0, 10);
    setFiles(merged);
    if (merged.length && (errors as any).file) {
      setErrors((prev) => ({
        ...prev,
        file: "",
      }));
    }
  };
  const removeFileAt = (idx: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const firstFile = files[0] ?? null;
    const validationErrors = validateClaimForm(formData, firstFile);
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
      await onSubmit(formData, files);
      setSubmitSuccess(true);
      if (!initial) {
        setFormData({
          name: "",
          policyId: "",
          description: "",
        });
        setFiles([]);
        setPolicyValid(null);
      }
      setErrors({});
      setTimeout(() => navigate("/claims"), 1000);
    } catch (error) {
      console.error(error);
      setErrors({
        submit: "Failed to submit claim. Please try again.",
      });
    }
  };
  return (
    <Container maxWidth="md">
      <Paper
        elevation={0}
        sx={{
          p: {
            xs: 3,
            md: 5,
          },
          borderRadius: 3,
          backgroundColor: theme.palette.background.paper,
          border: "1px solid",
          borderColor: "divider",
          position: "relative",
          overflow: "hidden",
          animation: `${fadeInUp} 0.6s ease-out`,
        }}
      >
        {loading && (
          <LinearProgress
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 3,
              background: "transparent",
              "& .MuiLinearProgress-bar": {
                background: grad,
              },
            }}
          />
        )}

        <>
          <Box
            sx={{
              mb: 4,
              textAlign: "center",
            }}
          >
            <Typography
              variant="h3"
              component="h1"
              gutterBottom
              sx={{
                fontWeight: 700,
                background: grad,
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {mode === "edit" ? "Edit " : mode === "view" ? "View " : "Submit "} Your Claim
            </Typography>
            {!HideHeaderForm && (
              <Typography variant="body1" color="text.secondary">
                Fill in the details below to process your reimbursement
              </Typography>
            )}
          </Box>
          <Divider
            sx={{
              mb: 4,
            }}
          >
            <Chip label="Claim Details" size="small" />
          </Divider>
        </>

        <Box
          component="form"
          id="claim-form"
          onSubmit={handleSubmit}
          sx={{
            mt: 3,
          }}
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
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonIcon color="action" />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                "&:hover fieldset": {
                  borderColor: theme.palette.primary.main,
                },
                "&.Mui-focused fieldset": {
                  borderColor: theme.palette.primary.main,
                },
              },
            }}
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
                  ? "Policy verified ✓"
                  : "Format: 6–12 alphanumeric characters")
            }
            margin="normal"
            required
            disabled={loading || readOnly}
            inputProps={{
              style: {
                textTransform: "uppercase",
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PolicyIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: policyValid !== null && (
                <InputAdornment position="end">
                  <Fade in>
                    {policyValid ? (
                      <CheckCircleIcon color="success" />
                    ) : (
                      <ErrorIcon color="error" />
                    )}
                  </Fade>
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                "&:hover fieldset": {
                  borderColor: theme.palette.primary.main,
                },
                "&.Mui-focused fieldset": {
                  borderColor: theme.palette.primary.main,
                },
              },
              "& .MuiFormHelperText-root": {
                color: policyValid === true ? theme.palette.success.main : undefined,
              },
            }}
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
              `${Math.max(0, formData.description.length)}/20 characters minimum`
            }
            margin="normal"
            required
            disabled={loading || readOnly}
            InputProps={{
              startAdornment: (
                <InputAdornment
                  position="start"
                  sx={{
                    alignSelf: "flex-start",
                    mt: 1,
                  }}
                >
                  <DescriptionIcon color="action" />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                "&:hover fieldset": {
                  borderColor: theme.palette.primary.main,
                },
                "&.Mui-focused fieldset": {
                  borderColor: theme.palette.primary.main,
                },
              },
            }}
          />

          <Box
            sx={{
              mt: 3,
              mb: 3,
            }}
          >
            <Paper
              variant="outlined"
              sx={{
                p: 3,
                borderStyle: "dashed",
                borderColor: (errors as any).file ? theme.palette.error.main : "divider",
                borderRadius: 2,
                bgcolor: theme.palette.background.default,
                transition: "all 0.3s ease",
                "&:hover": {
                  borderColor: theme.palette.primary.main,
                  bgcolor: alpha(theme.palette.background.default, isDark ? 0.9 : 0.7),
                },
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  mb: 2,
                }}
              >
                <UploadIcon color="action" />
                <Typography variant="subtitle1" fontWeight={600}>
                  Upload Supporting Documents (PDF, up to 10)
                </Typography>
              </Box>

              <Stack
                direction={{
                  xs: "column",
                  sm: "row",
                }}
                spacing={2}
                alignItems="center"
              >
                <Button variant="outlined" component="label" disabled={loading || readOnly}>
                  Choose PDFs
                  <input
                    type="file"
                    hidden
                    accept="application/pdf"
                    multiple
                    onChange={(e) => pickFiles(e.target.files)}
                  />
                </Button>
                <Typography variant="body2" color="text.secondary">
                  {files.length} selected
                </Typography>
              </Stack>

              {files.length > 0 && (
                <List
                  dense
                  sx={{
                    mt: 2,
                    bgcolor: alpha(theme.palette.background.paper, 0.4),
                    borderRadius: 1,
                  }}
                >
                  {files.map((f, idx) => (
                    <ListItem
                      key={`${f.name}-${idx}`}
                      secondaryAction={
                        !readOnly && (
                          <IconButton edge="end" onClick={() => removeFileAt(idx)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        )
                      }
                      sx={{
                        px: 1,
                      }}
                    >
                      <ListItemText
                        primary={f.name}
                        secondary={`${(f.size / 1024 / 1024).toFixed(2)} MB`}
                        primaryTypographyProps={{
                          noWrap: true,
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </Paper>
          </Box>

          {errors.submit && (
            <Zoom in>
              <Alert
                severity="error"
                sx={{
                  mb: 3,
                  borderRadius: 2,
                }}
              >
                {errors.submit}
              </Alert>
            </Zoom>
          )}

          {submitSuccess && (
            <Zoom in>
              <Alert
                severity="success"
                sx={{
                  mb: 3,
                  borderRadius: 2,
                }}
              >
                Claim submitted successfully! Redirecting to your claims...
              </Alert>
            </Zoom>
          )}

          {!readOnly && (
            <Box
              sx={{
                mt: 4,
                display: "flex",
                justifyContent: "center",
              }}
            >
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading || policyChecking}
                endIcon={!loading && <SendIcon />}
                sx={{
                  px: 6,
                  py: 1.5,
                  borderRadius: 2,
                  background: loading ? undefined : grad,
                  boxShadow: `0 4px 15px ${alpha(theme.palette.primary.main, 0.3)}`,
                  textTransform: "none",
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  transition: "all 0.3s ease",
                  animation: !loading ? `${pulse} 2s infinite` : "none",
                  "&:hover": {
                    background: loading
                      ? undefined
                      : `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.primary.main} 100%)`,
                    boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
                    transform: "translateY(-2px)",
                  },
                  "&:active": {
                    transform: "translateY(0)",
                  },
                }}
              >
                {loading ? "Submitting..." : "Submit Claim"}
              </Button>
            </Box>
          )}
        </Box>

        {summary && (
          <Fade in>
            <Box
              sx={{
                mt: 4,
              }}
            >
              <Divider
                sx={{
                  mb: 3,
                }}
              >
                <Chip label="AI Summary" size="small" color="primary" />
              </Divider>
              <ClaimSummary defaultValue={initial?.summary ?? ""} summary={summary} />
            </Box>
          </Fade>
        )}

        <Box
          sx={{
            position: "absolute",
            top: -50,
            right: -50,
            width: 150,
            height: 150,
            borderRadius: "50%",
            background: grad,
            opacity: isDark ? 0.08 : 0.06,
            pointerEvents: "none",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: -30,
            left: -30,
            width: 100,
            height: 100,
            borderRadius: "50%",
            background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.primary.main} 100%)`,
            opacity: isDark ? 0.08 : 0.06,
            pointerEvents: "none",
          }}
        />
      </Paper>
    </Container>
  );
};
export default ClaimForm;
