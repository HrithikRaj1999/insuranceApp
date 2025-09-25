import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Link,
  CircularProgress,
} from "@mui/material";
import { Claim } from "@/types/Claim.type.js";
import apiService from "@services/apiService.js";
import ClaimForm from "@components/ClaimForm.js";
import Loader from "@/utils/Loader";

type Mode = "view" | "edit";

interface Props {
  open: boolean;
  mode: Mode;
  claimId: string | null;
  onClose: () => void;
  onSaved?: (updated: Claim) => void;
}

const ClaimDialog: React.FC<Props> = ({
  open,
  mode,
  claimId,
  onClose,
  onSaved,
}) => {
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [claim, setClaim] = React.useState<Claim | null>(null);

  React.useEffect(() => {
    if (!open || !claimId) {
      setClaim(null);
      return;
    }
    setLoading(true);
    apiService
      .getClaim(claimId)
      .then((c) => {
        setClaim(c);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [open, claimId]);

  const handleUpdate = async (data: Partial<Claim>, file?: File | null) => {
    if (!claimId) return;
    setSaving(true);
    try {
      let body: any = data;
      if (file) {
        const fd = new FormData();
        Object.entries(data).forEach(([k, v]) => fd.append(k, String(v ?? "")));
        fd.append("file", file);
        body = fd;
      }
      const updated = await apiService.updateClaim(claimId, body);
      onSaved?.(updated);
      onClose();
    } catch (e) {
      console.error("Update failed:", e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {mode === "view" ? "Claim Details" : "Edit Claim"}
      </DialogTitle>

      <DialogContent dividers>
        {loading || !claim ? (
          <Loader />
        ) : (
          <>
            <ClaimForm
              initial={claim}
              mode={mode}
              onSubmit={(formValues, file) => handleUpdate(formValues, file)}
              loading={saving}
              summary={claim.summary ?? ""}
            />

            {/* Optional: show existing attachment */}
            {claim.fileUrl && (
              <Stack mt={2}>
                <Link href={claim.fileUrl} target="_blank" rel="noopener">
                  View attached file
                </Link>
              </Stack>
            )}
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        {mode === "edit" && (
          <Button
            type="submit"
            form="claim-form"
            variant="contained"
            disabled={saving}
          >
            {saving ? "Saving..." : "Save changes"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ClaimDialog;
