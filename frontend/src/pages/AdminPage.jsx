import React, { useContext, useEffect, useState } from 'react';
import { Container, Alert, CircularProgress, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import AdminDashboard from '../components/AdminDashboard';

const AdminPage = () => {
  const { user, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if user is authenticated and has admin role
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Note: In a real implementation, you'd want to verify admin status from the server
    // For now, we'll check if the user email indicates admin access
    const isAdmin = user?.email === 'admin@borrowhub.com' || user?.role === 'admin';
    
    if (!isAdmin) {
      setError('You do not have permission to access the admin panel.');
    }
    
    setLoading(false);
  }, [isAuthenticated, user, navigate]);

  if (loading) {
    return (
      <Container>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <AdminDashboard />
    </Container>
  );
};

export default AdminPage;