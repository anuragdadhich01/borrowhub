import React, { useState, useContext, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Avatar,
  Tabs,
  Tab,
  Paper
} from '@mui/material';
import { Edit, Save, Cancel, Person, Analytics } from '@mui/icons-material';
import AuthContext from '../context/AuthContext';
import axios from '../api/axios';
import UserAnalyticsDashboard from '../components/UserAnalyticsDashboard';

const ProfilePage = () => {
  const { user, isAuthenticated } = useContext(AuthContext);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    username: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        username: user.username || '',
      });
    }
  }, [user]);

  const handleEdit = () => {
    setEditing(true);
    setError('');
    setSuccess('');
  };

  const handleCancel = () => {
    setEditing(false);
    setError('');
    setSuccess('');
    // Reset form data to original user data
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        username: user.username || '',
      });
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      await axios.put('/api/profile', formData);
      setSuccess('Profile updated successfully!');
      setEditing(false);
      // Here you would typically refresh the user data in the context
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <Container maxWidth="sm">
        <Alert severity="warning" sx={{ mt: 4 }}>
          Please log in to view your profile.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          My Profile
        </Typography>

        {/* Tabs */}
        <Paper sx={{ borderRadius: 2, mb: 3 }}>
          <Tabs 
            value={tabValue} 
            onChange={(e, newValue) => setTabValue(newValue)}
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label="Profile Information" icon={<Person />} />
            <Tab label="Analytics & Insights" icon={<Analytics />} />
          </Tabs>
        </Paper>

        {/* Tab Content */}
        {tabValue === 0 && (
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar 
                  sx={{ width: 80, height: 80, bgcolor: 'primary.main', mr: 2 }}
                >
                  {formData.firstName?.charAt(0) || formData.email?.charAt(0) || 'U'}
                </Avatar>
                <Box>
                  <Typography variant="h5">
                    {formData.firstName} {formData.lastName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formData.email}
                  </Typography>
                </Box>
              </Box>

              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              {success && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  {success}
                </Alert>
              )}

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="firstName"
                  label="First Name"
                  fullWidth
                  value={formData.firstName}
                  onChange={handleChange}
                  disabled={!editing}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="lastName"
                  label="Last Name"
                  fullWidth
                  value={formData.lastName}
                  onChange={handleChange}
                  disabled={!editing}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="email"
                  label="Email"
                  fullWidth
                  value={formData.email}
                  disabled={true} // Email should not be editable
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="username"
                  label="Username"
                  fullWidth
                  value={formData.username}
                  onChange={handleChange}
                  disabled={!editing}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="phone"
                  label="Phone Number"
                  fullWidth
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={!editing}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="address"
                  label="Address"
                  fullWidth
                  multiline
                  rows={2}
                  value={formData.address}
                  onChange={handleChange}
                  disabled={!editing}
                  margin="normal"
                />
              </Grid>
            </Grid>

            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              {!editing ? (
                <Button
                  variant="contained"
                  startIcon={<Edit />}
                  onClick={handleEdit}
                >
                  Edit Profile
                </Button>
              ) : (
                <>
                  <Button
                    variant="contained"
                    startIcon={<Save />}
                    onClick={handleSave}
                    disabled={loading}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Save Changes'}
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Cancel />}
                    onClick={handleCancel}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                </>
              )}
            </Box>
          </CardContent>
        </Card>
        )}

        {/* Analytics Tab */}
        {tabValue === 1 && (
          <UserAnalyticsDashboard />
        )}

      </Box>
    </Container>
  );
};

export default ProfilePage;