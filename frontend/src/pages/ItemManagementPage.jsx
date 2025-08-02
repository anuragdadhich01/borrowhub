import React, { useState, useEffect, useContext } from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardMedia,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Alert,
  CircularProgress,
  Menu,
  MenuItem,
  Fab,
  Stack,
  Divider
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  MoreVert,
  Visibility,
  VisibilityOff,
  AttachMoney,
  CalendarToday
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import AuthContext from '../context/AuthContext';

const ItemManagementPage = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editDialog, setEditDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuItemId, setMenuItemId] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    dailyRate: '',
    imageUrl: ''
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchUserItems();
  }, [isAuthenticated, navigate]);

  const fetchUserItems = async () => {
    try {
      const response = await axios.get('/api/my-items');
      setItems(response.data || []);
    } catch (err) {
      console.error('Failed to fetch user items:', err);
      setError('Failed to load your items');
    } finally {
      setLoading(false);
    }
  };

  const handleMenuOpen = (event, itemId) => {
    setAnchorEl(event.currentTarget);
    setMenuItemId(itemId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuItemId(null);
  };

  const handleEditClick = (item) => {
    setSelectedItem(item);
    setEditForm({
      name: item.name,
      description: item.description,
      dailyRate: item.dailyRate.toString(),
      imageUrl: item.imageUrl || ''
    });
    setEditDialog(true);
    handleMenuClose();
  };

  const handleDeleteClick = (item) => {
    setSelectedItem(item);
    setDeleteDialog(true);
    handleMenuClose();
  };

  const handleEditSubmit = async () => {
    try {
      const updatedData = {
        name: editForm.name,
        description: editForm.description,
        dailyRate: parseFloat(editForm.dailyRate),
        imageUrl: editForm.imageUrl
      };

      await axios.put(`/api/items/${selectedItem.id}`, updatedData);
      
      // Update local state
      setItems(items.map(item => 
        item.id === selectedItem.id 
          ? { ...item, ...updatedData }
          : item
      ));
      
      setEditDialog(false);
      setSelectedItem(null);
    } catch (err) {
      console.error('Failed to update item:', err);
      setError(err.response?.data?.error || 'Failed to update item');
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`/api/items/${selectedItem.id}`);
      
      // Remove from local state
      setItems(items.filter(item => item.id !== selectedItem.id));
      
      setDeleteDialog(false);
      setSelectedItem(null);
    } catch (err) {
      console.error('Failed to delete item:', err);
      setError(err.response?.data?.error || 'Failed to delete item');
    }
  };

  const handleToggleAvailability = async (item) => {
    try {
      const updatedData = { available: !item.available };
      await axios.put(`/api/items/${item.id}`, updatedData);
      
      // Update local state
      setItems(items.map(i => 
        i.id === item.id 
          ? { ...i, available: !item.available }
          : i
      ));
    } catch (err) {
      console.error('Failed to toggle availability:', err);
      setError('Failed to update item availability');
    }
    handleMenuClose();
  };

  const getItemStats = (item) => {
    // Mock stats - in real app this would come from backend
    return {
      totalBookings: Math.floor(Math.random() * 20),
      totalEarnings: Math.floor(Math.random() * 10000),
      averageRating: (4 + Math.random()).toFixed(1)
    };
  };

  if (!isAuthenticated) {
    return (
      <Container maxWidth="md">
        <Alert severity="warning" sx={{ mt: 4 }}>
          Please log in to manage your items.
        </Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
              My Items
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage your rental items and track their performance
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/add-item')}
            sx={{ borderRadius: 2, fontWeight: 600, px: 3 }}
          >
            Add New Item
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Items Grid */}
        {items.length === 0 ? (
          <Card sx={{ p: 8, textAlign: 'center', borderRadius: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
              No items listed yet
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              Start earning by listing your first item for rent
            </Typography>
            <Button
              variant="contained"
              size="large"
              startIcon={<Add />}
              onClick={() => navigate('/add-item')}
              sx={{ borderRadius: 2, fontWeight: 600, px: 4 }}
            >
              List Your First Item
            </Button>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {items.map((item) => {
              const stats = getItemStats(item);
              return (
                <Grid item xs={12} sm={6} lg={4} key={item.id}>
                  <Card sx={{ borderRadius: 3, height: '100%', position: 'relative' }}>
                    {/* Item Menu */}
                    <IconButton
                      sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1, backgroundColor: 'rgba(255,255,255,0.9)' }}
                      onClick={(e) => handleMenuOpen(e, item.id)}
                    >
                      <MoreVert />
                    </IconButton>

                    {/* Item Image */}
                    <CardMedia
                      component="img"
                      height="200"
                      image={item.imageUrl || `https://placehold.co/400x200/556cd6/white?text=${item.name.replace(/\s/g, '+')}`}
                      alt={item.name}
                      sx={{ objectFit: 'cover' }}
                    />

                    <CardContent sx={{ flexGrow: 1 }}>
                      {/* Item Status */}
                      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                        <Chip
                          label={item.available ? 'Available' : 'Unavailable'}
                          color={item.available ? 'success' : 'error'}
                          size="small"
                        />
                      </Stack>

                      {/* Item Details */}
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                        {item.name}
                      </Typography>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, height: '3em', overflow: 'hidden' }}>
                        {item.description}
                      </Typography>

                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <AttachMoney sx={{ color: 'primary.main', mr: 0.5 }} />
                        <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                          ₹{item.dailyRate}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                          per day
                        </Typography>
                      </Box>

                      <Divider sx={{ my: 2 }} />

                      {/* Item Stats */}
                      <Grid container spacing={2}>
                        <Grid item xs={4}>
                          <Typography variant="body2" color="text.secondary" align="center">
                            Bookings
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 600 }} align="center">
                            {stats.totalBookings}
                          </Typography>
                        </Grid>
                        <Grid item xs={4}>
                          <Typography variant="body2" color="text.secondary" align="center">
                            Earnings
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 600 }} align="center">
                            ₹{stats.totalEarnings}
                          </Typography>
                        </Grid>
                        <Grid item xs={4}>
                          <Typography variant="body2" color="text.secondary" align="center">
                            Rating
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 600 }} align="center">
                            {stats.averageRating}★
                          </Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}

        {/* Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={() => {
            const item = items.find(i => i.id === menuItemId);
            navigate(`/item/${menuItemId}`);
            handleMenuClose();
          }}>
            <Visibility sx={{ mr: 1 }} /> View Details
          </MenuItem>
          <MenuItem onClick={() => {
            const item = items.find(i => i.id === menuItemId);
            handleEditClick(item);
          }}>
            <Edit sx={{ mr: 1 }} /> Edit Item
          </MenuItem>
          <MenuItem onClick={() => {
            const item = items.find(i => i.id === menuItemId);
            handleToggleAvailability(item);
          }}>
            {items.find(i => i.id === menuItemId)?.available ? (
              <>
                <VisibilityOff sx={{ mr: 1 }} /> Mark Unavailable
              </>
            ) : (
              <>
                <Visibility sx={{ mr: 1 }} /> Mark Available
              </>
            )}
          </MenuItem>
          <Divider />
          <MenuItem 
            onClick={() => {
              const item = items.find(i => i.id === menuItemId);
              handleDeleteClick(item);
            }}
            sx={{ color: 'error.main' }}
          >
            <Delete sx={{ mr: 1 }} /> Delete Item
          </MenuItem>
        </Menu>

        {/* Edit Dialog */}
        <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Edit Item</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Item Name"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    multiline
                    rows={3}
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Daily Rate (₹)"
                    type="number"
                    value={editForm.dailyRate}
                    onChange={(e) => setEditForm({ ...editForm, dailyRate: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Image URL"
                    value={editForm.imageUrl}
                    onChange={(e) => setEditForm({ ...editForm, imageUrl: e.target.value })}
                  />
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialog(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleEditSubmit}>
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
          <DialogTitle>Delete Item</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete "{selectedItem?.name}"? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialog(false)}>Cancel</Button>
            <Button color="error" variant="contained" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Floating Action Button for Mobile */}
        <Fab
          color="primary"
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            display: { xs: 'flex', sm: 'none' }
          }}
          onClick={() => navigate('/add-item')}
        >
          <Add />
        </Fab>
      </Box>
    </Container>
  );
};

export default ItemManagementPage;