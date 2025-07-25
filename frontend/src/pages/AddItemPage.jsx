// frontend/src/pages/AddItemPage.jsx

import React, { useState } from 'react';
import {
  Container,
  Box,
  Avatar,
  Typography,
  TextField,
  Button,
  Grid,
  CircularProgress,
  Alert
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AddItemPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    dailyRate: '',
    imageUrl: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  // frontend/src/pages/AddItemPage.jsx

  // REPLACE THIS LINE
  const API_ENDPOINT = 'https://4kqty37vn5.execute-api.us-east-1.amazonaws.com/prod/items';
  const { name, description, dailyRate, imageUrl } = formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const itemData = {
        ...formData,
        dailyRate: parseFloat(dailyRate) // Convert rate to a number
      };
      await axios.post(API_ENDPOINT, itemData);
      alert('Item listed successfully!');
      navigate('/');
    } catch (err) {
      setError('Failed to list item. Please try again.');
      console.error(err);
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
        <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
          <AddCircleOutlineIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          List a New Item
        </Typography>
        <Box component="form" noValidate onSubmit={onSubmit} sx={{ mt: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                name="name"
                required
                fullWidth
                id="name"
                label="Item Name"
                autoFocus
                value={name}
                onChange={onChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="description"
                label="Item Description"
                name="description"
                multiline
                rows={4}
                value={description}
                onChange={onChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                name="dailyRate"
                label="Daily Rate (₹)"
                type="number"
                id="dailyRate"
                value={dailyRate}
                onChange={onChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                name="imageUrl"
                label="Image URL"
                id="imageUrl"
                value={imageUrl}
                onChange={onChange}
              />
            </Grid>
          </Grid>
          {error && <Alert severity="error" sx={{ mt: 2, width: '100%' }}>{error}</Alert>}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'List My Item'}
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default AddItemPage;