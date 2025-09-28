import React from "react";
import { Snackbar, Alert } from "@mui/material";
interface SuccessNotificationProps {
  open: boolean;
  message: string;
  onClose: () => void;
}
const SuccessNotification: React.FC<SuccessNotificationProps> = ({
  open,
  message,
  onClose
}) => {
  return <Snackbar open={open} autoHideDuration={6000} onClose={onClose} anchorOrigin={{
    vertical: "bottom",
    horizontal: "center"
  }}>
      <Alert onClose={onClose} severity="success" sx={{
      width: "100%"
    }} variant="filled">
        {message}
      </Alert>
    </Snackbar>;
};
export default SuccessNotification;