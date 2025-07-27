// frontend/src/pages/RegisterPage.jsx

import React, { useState } from 'react';
import {
  Container,
  Box,
  Avatar,
  Typography,
  TextField,
  Button,
  Grid,
  Link as MuiLink,
  Alert,
  CircularProgress,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import axios from 'axios';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // FIX: Using the correct, single path for the register endpoint
 const API_ENDPOINT = 'https://psflzclkbl.execute-api.us-east-1.amazonaws.com/Prod/register';

  const { name, email, password } = formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await axios.post(API_ENDPOINT, formData);
      
      const data = JSON.parse(res.data.body);
      
      setSuccess(data.message || 'Registration successful! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      const errorMessage = err.response?.data?.body || 'An error occurred. Please try again.';
      setError(errorMessage);
      console.error(err.response || err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Sign up
        </Typography>
        <Box component="form" noValidate onSubmit={onSubmit} sx={{ mt: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                autoComplete="name"
                name="name"
                required
                fullWidth
                id="name"
                label="Full Name"
                autoFocus
                value={name}
                onChange={onChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                value={email}
                onChange={onChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="new-password"
                value={password}
                onChange={onChange}
              />
            </Grid>
          </Grid>
          {error && <Alert severity="error" sx={{ mt: 2, width: '100%' }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mt: 2, width: '100%' }}>{success}</Alert>}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Sign Up'}
          </Button>
          <Grid container justifyContent="flex-end">
            <Grid item>
              <MuiLink component={RouterLink} to="/login" variant="body2">
                Already have an account? Sign in
              </MuiLink>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Container>
  );
};

export default RegisterPage;