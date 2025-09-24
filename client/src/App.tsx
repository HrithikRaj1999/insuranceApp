import React, { useState } from 'react';
import {
  Container, Paper, TextField, Button, Box, Typography,
  Alert, CircularProgress, Card, CardContent, Snackbar,
  ThemeProvider, createTheme, CssBaseline
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import axios from 'axios';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
  },
});

interface Claim {
  name: string;
  policyId: string;
  description: string;
}

const App: React.FC = () => {
  const [claim, setClaim] = useState<Claim>({
    name: '',
    policyId: '',
    description: ''
  });
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!claim.name.trim()) newErrors.name = 'Name is required';
    if (!claim.policyId.trim()) newErrors.policyId = 'Policy ID is required';
    if (!claim.description.trim()) newErrors.description = 'Description is required';
    if (!file) newErrors.file = 'File is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('name', claim.name);
    formData.append('policyId', claim.policyId);
    formData.append('description', claim.description);
    if (file) formData.append('file', file);

    try {
      const response = await axios.post('http://localhost:5000/api/claims', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setSummary(response.data.summary || '');
      setSuccess(true);
      // Reset form
      setClaim({ name: '', policyId: '', description: '' });
      setFile(null);
      setErrors({});
    } catch (error) {
      console.error('Error submitting claim:', error);
      setErrors({ submit: 'Failed to submit claim. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Insurance Claim Submission
          </Typography>
          
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
            <TextField
              fullWidth
              label="Full Name"
              variant="outlined"
              value={claim.name}
              onChange={(e) => setClaim({ ...claim, name: e.target.value })}
              error={!!errors.name}
              helperText={errors.name}
              margin="normal"
              required
            />
            
            <TextField
              fullWidth
              label="Policy ID"
              variant="outlined"
              value={claim.policyId}
              onChange={(e) => setClaim({ ...claim, policyId: e.target.value })}
              error={!!errors.policyId}
              helperText={errors.policyId}
              margin="normal"
              required
            />
            
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Claim Description"
              variant="outlined"
              value={claim.description}
              onChange={(e) => setClaim({ ...claim, description: e.target.value })}
              error={!!errors.description}
              helperText={errors.description}
              margin="normal"
              required
            />
            
            <Button
              variant="outlined"
              component="label"
              fullWidth
              startIcon={file ? <CheckCircleIcon /> : <CloudUploadIcon />}
              sx={{ mt: 2, mb: 1 }}
              color={file ? "success" : "primary"}
            >
              {file ? file.name : 'Upload File (PDF/Image)'}
              <input
                type="file"
                hidden
                accept=".pdf,image/*"
                onChange={(e) => {
                  const selectedFile = e.target.files?.[0];
                  if (selectedFile) {
                    setFile(selectedFile);
                    setErrors({ ...errors, file: '' });
                  }
                }}
              />
            </Button>
            {errors.file && (
              <Alert severity="error" sx={{ mb: 2 }}>{errors.file}</Alert>
            )}
            
            {errors.submit && (
              <Alert severity="error" sx={{ mb: 2 }}>{errors.submit}</Alert>
            )}
            
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              size="large"
              sx={{ mt: 2, py: 1.5 }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Submit Claim'}
            </Button>
          </Box>

          {summary && (
            <Card sx={{ mt: 3, bgcolor: 'primary.50', border: '1px solid', borderColor: 'primary.200' }}>
              <CardContent>
                <Typography variant="h6" color="primary" gutterBottom>
                  AI-Generated Summary
                </Typography>
                <Typography variant="body1">{summary}</Typography>
              </CardContent>
            </Card>
          )}
        </Paper>
        
        <Snackbar
          open={success}
          autoHideDuration={6000}
          onClose={() => setSuccess(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={() => setSuccess(false)} 
            severity="success" 
            sx={{ width: '100%' }}
          >
            Claim submitted successfully!
          </Alert>
        </Snackbar>
      </Container>
    </ThemeProvider>
  );
};

export default App;