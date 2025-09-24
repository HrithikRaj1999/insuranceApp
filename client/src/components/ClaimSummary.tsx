import React from "react";
import { Card, CardContent, Typography, Box } from "@mui/material";
import { AutoAwesomeMosaicOutlined } from "@mui/icons-material";

interface ClaimSummaryProps {
  summary: string;
  defaultValue?: string;
}

const ClaimSummary: React.FC<ClaimSummaryProps> = ({
  summary,
  defaultValue,
}) => {
  return (
    <Card
      sx={{
        mt: 3,
        bgcolor: "primary.50",
        border: "1px solid",
        borderColor: "primary.200",
      }}
    >
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <AutoAwesomeMosaicOutlined color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6" color="primary">
            AI-Generated Summary
          </Typography>
        </Box>

        {/* Scrollable area */}
        <Box
          sx={{
            maxHeight: 200, 
            overflowY: "auto", 
            pr: 1, // add a bit of padding so scrollbar doesn’t cover text
          }}
        >
          <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
            {summary ?? defaultValue}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ClaimSummary;
