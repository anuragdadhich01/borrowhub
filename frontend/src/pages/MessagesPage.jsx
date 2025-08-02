import React from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';
import MessagingSystem from '../components/MessagingSystem';

const MessagesPage = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Messages
      </Typography>
      
      <Paper elevation={1} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <MessagingSystem />
      </Paper>
    </Container>
  );
};

export default MessagesPage;