// frontend/src/pages/AddItemPage.jsx

import React, { useState, useContext } from 'react';
import {
  Container,
  Box,
  Avatar,
  Typography,
  TextField,
  Button,
  Grid,
  CircularProgress,
  Alert,
  Paper,
  Divider,
  Stack,
  IconButton,
  Card,
  CardMedia,
  Chip
} from '@mui/material';
import {
  AddCircleOutline,
  CloudUpload,
  Delete,
  Image as ImageIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import AuthContext from '../context/AuthContext';

const AddItemPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    dailyRate: '',
    imageUrl: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const navigate = useNavigate();
  const { isAuthenticated } = useContext(AuthContext);
  
  const { name, description, dailyRate, imageUrl } = formData;

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleImageUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    setUploading(true);
    setError('');

    try {
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append('image', file);
        
        const response = await axios.post('/api/upload/image', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        
        return response.data;
      });

      const uploadResults = await Promise.all(uploadPromises);
      const newImages = uploadResults.map(result => ({
        id: result.imageId,
        url: result.imageUrl,
        name: result.name || 'Uploaded Image'
      }));

      setUploadedImages(prev => [...prev, ...newImages]);
      
      // Set the first uploaded image as the main image if none exists
      if (!imageUrl && newImages.length > 0) {
        setFormData(prev => ({ ...prev, imageUrl: newImages[0].url }));
      }
    } catch (err) {
      console.error('Image upload failed:', err);
      setError('Failed to upload image(s). Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (imageId) => {
    setUploadedImages(prev => prev.filter(img => img.id !== imageId));
    
    // If removed image was the main image, set a new one or clear
    const removedImage = uploadedImages.find(img => img.id === imageId);
    if (removedImage && formData.imageUrl === removedImage.url) {
      const remainingImages = uploadedImages.filter(img => img.id !== imageId);
      setFormData(prev => ({ 
        ...prev, 
        imageUrl: remainingImages.length > 0 ? remainingImages[0].url : '' 
      }));
    }
  };

  const setMainImage = (imageUrl) => {
    setFormData(prev => ({ ...prev, imageUrl }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Basic validation
    if (!name || !description || !dailyRate) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    if (parseFloat(dailyRate) <= 0) {
      setError('Daily rate must be greater than 0');
      setLoading(false);
      return;
    }

    try {
      const itemData = {
        ...formData,
        dailyRate: parseFloat(dailyRate)
      };
      
      await axios.post('/api/items', itemData);
      alert('Item listed successfully!');
      navigate('/my-items');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to list item. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="md">
      <Box
        sx={{
          marginTop: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: 'primary.main', width: 56, height: 56 }}>
          <AddCircleOutline fontSize="large" />
        </Avatar>
        <Typography component="h1" variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          List a New Item
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4, textAlign: 'center' }}>
          Share your items with the community and earn money
        </Typography>

        <Box component="form" noValidate onSubmit={onSubmit} sx={{ width: '100%' }}>
          <Grid container spacing={4}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Paper elevation={0} sx={{ p: 4, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  Basic Information
                </Typography>
                
                <Grid container spacing={3}>
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
                      placeholder="e.g., Canon EOS R5 Camera"
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
                      placeholder="Describe your item in detail. Include condition, specifications, and any additional notes..."
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      name="dailyRate"
                      label="Daily Rate (₹)"
                      type="number"
                      id="dailyRate"
                      value={dailyRate}
                      onChange={onChange}
                      placeholder="e.g., 500"
                      inputProps={{ min: 1 }}
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Image Upload */}
            <Grid item xs={12}>
              <Paper elevation={0} sx={{ p: 4, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  Images
                </Typography>
                
                {/* Upload Button */}
                <Box sx={{ mb: 3 }}>
                  <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="image-upload"
                    type="file"
                    multiple
                    onChange={handleImageUpload}
                  />
                  <label htmlFor="image-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={uploading ? <CircularProgress size={20} /> : <CloudUpload />}
                      disabled={uploading}
                      sx={{ borderRadius: 2, borderStyle: 'dashed', py: 2, px: 4 }}
                    >
                      {uploading ? 'Uploading...' : 'Upload Images'}
                    </Button>
                  </label>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Upload up to 5 images. First image will be the main photo.
                  </Typography>
                </Box>

                {/* Uploaded Images */}
                {uploadedImages.length > 0 && (
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    {uploadedImages.map((image, index) => (
                      <Grid item xs={6} sm={4} md={3} key={image.id}>
                        <Card sx={{ position: 'relative', borderRadius: 2 }}>
                          <CardMedia
                            component="img"
                            height="120"
                            image={image.url}
                            alt={`Upload ${index + 1}`}
                            sx={{ objectFit: 'cover' }}
                          />
                          {formData.imageUrl === image.url && (
                            <Chip
                              label="Main"
                              size="small"
                              color="primary"
                              sx={{ position: 'absolute', top: 8, left: 8 }}
                            />
                          )}
                          <IconButton
                            size="small"
                            onClick={() => removeImage(image.id)}
                            sx={{
                              position: 'absolute',
                              top: 8,
                              right: 8,
                              backgroundColor: 'rgba(255,255,255,0.9)',
                              '&:hover': { backgroundColor: 'rgba(255,255,255,1)' }
                            }}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                          {formData.imageUrl !== image.url && (
                            <Button
                              size="small"
                              onClick={() => setMainImage(image.url)}
                              sx={{
                                position: 'absolute',
                                bottom: 8,
                                left: 8,
                                right: 8,
                                backgroundColor: 'rgba(0,0,0,0.7)',
                                color: 'white',
                                '&:hover': { backgroundColor: 'rgba(0,0,0,0.9)' }
                              }}
                            >
                              Set as Main
                            </Button>
                          )}
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                )}

                {/* Manual URL Input (Fallback) */}
                <Divider sx={{ my: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    OR
                  </Typography>
                </Divider>
                
                <TextField
                  fullWidth
                  name="imageUrl"
                  label="Image URL (Optional)"
                  id="imageUrl"
                  value={imageUrl}
                  onChange={onChange}
                  placeholder="https://example.com/image.jpg"
                  helperText="You can paste an image URL as an alternative to uploading"
                />
              </Paper>
            </Grid>
          </Grid>

          {error && (
            <Alert severity="error" sx={{ mt: 3, width: '100%' }}>
              {error}
            </Alert>
          )}

          <Stack direction="row" spacing={2} sx={{ mt: 4, mb: 2 }}>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => navigate('/my-items')}
              disabled={loading}
              sx={{ borderRadius: 2, fontWeight: 600 }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading || uploading}
              sx={{ borderRadius: 2, fontWeight: 600 }}
            >
              {loading ? <CircularProgress size={24} /> : 'List My Item'}
            </Button>
          </Stack>
        </Box>
      </Box>
    </Container>
  );
};

export default AddItemPage;