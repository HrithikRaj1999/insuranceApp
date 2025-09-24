import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { AutoAwesomeMosaicOutlined } from '@mui/icons-material';

interface ClaimSummaryProps {
  summary: string;
}

const ClaimSummary: React.FC<ClaimSummaryProps> = ({ summary }) => {
  return (
    <Card sx={{ 
      mt: 3, 
      bgcolor: 'primary.50', 
      border: '1px solid', 
      borderColor: 'primary.200' 
    }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <AutoAwesomeMosaicOutlined color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6" color="primary">
            AI-Generated Summary
          </Typography>
        </Box>
        <Typography variant="body1">{summary}</Typography>
      </CardContent>
    </Card>
  );
};

export default ClaimSummary;