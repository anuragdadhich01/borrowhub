import React, { useState } from 'react';
import {
  Alert,
  IconButton,
  Typography,
  Box,
  Collapse
} from '@mui/material';
import {
  Close,
  Info,
  Science
} from '@mui/icons-material';

const DemoBanner = () => {
  const [open, setOpen] = useState(true);

  if (!open) return null;

  return (
    <Collapse in={open}>
      <Alert
        severity="info"
        sx={{
          borderRadius: 0,
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          borderColor: 'primary.main',
          color: 'primary.dark',
          '& .MuiAlert-icon': {
            color: 'primary.main'
          }
        }}
        icon={<Science />}
        action={
          <IconButton
            aria-label="close"
            color="inherit"
            size="small"
            onClick={() => setOpen(false)}
          >
            <Close fontSize="inherit" />
          </IconButton>
        }
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            🚀 Demo Mode:
          </Typography>
          <Typography variant="body2">
            This is a demonstration version of BorrowHub. Some features may be limited or show sample data.
          </Typography>
        </Box>
      </Alert>
    </Collapse>
  );
};

export default DemoBanner;