import React, { useState } from 'react';
import {
  Container,
  Box,
  Avatar,
  Typography,
  TextField,
  Button,
  Grid,
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

const AddItemPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    dailyRate: '',
    imageUrl: '',
  });

  const { name, description, dailyRate, imageUrl } = formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = (e) => {
    e.preventDefault();
    // We will add the logic to submit this to the backend next
    console.log('Add Item form submitted', formData);
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
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            List My Item
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default AddItemPage;
