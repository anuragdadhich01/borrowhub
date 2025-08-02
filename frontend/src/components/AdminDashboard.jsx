import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  IconButton,
  Menu,
  Tooltip
} from '@mui/material';
import {
  Dashboard,
  People,
  Inventory,
  BookOnline,
  TrendingUp,
  MoreVert,
  Visibility,
  Edit,
  Block,
  CheckCircle,
  Cancel,
  Analytics
} from '@mui/icons-material';
import axiosInstance from '../api/axios';

// Dashboard Stats Cards
const StatCard = ({ title, value, icon, color = 'primary' }) => (
  <Card>
    <CardContent>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography color="textSecondary" gutterBottom variant="h6">
            {title}
          </Typography>
          <Typography variant="h4" component="div">
            {value}
          </Typography>
        </Box>
        <Box
          sx={{
            backgroundColor: `${color}.main`,
            color: 'white',
            borderRadius: 2,
            p: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

// User Management Component
const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [statusDialog, setStatusDialog] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [reason, setReason] = useState('');
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');

  const fetchUsers = async () => {
    try {
      const response = await axiosInstance.get('/api/admin/users');
      setUsers(response.data || []);
    } catch (error) {
      setError('Failed to load users');
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleStatusUpdate = async () => {
    if (!selectedUser || !newStatus) return;

    setUpdating(true);
    try {
      await axiosInstance.put(`/api/admin/users/${selectedUser.id}/status`, {
        status: newStatus,
        reason: reason.trim()
      });
      
      setStatusDialog(false);
      setSelectedUser(null);
      setNewStatus('');
      setReason('');
      fetchUsers();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to update user status');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'suspended': return 'warning';
      case 'banned': return 'error';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        User Management
      </Typography>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Joined</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <Box>
                    <Typography variant="body2" fontWeight="bold">
                      {user.firstName && user.lastName 
                        ? `${user.firstName} ${user.lastName}`
                        : user.username
                      }
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      ID: {user.id}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Chip 
                    label={user.role} 
                    size="small" 
                    color={user.role === 'admin' ? 'primary' : 'default'}
                  />
                </TableCell>
                <TableCell>
                  <Chip 
                    label={user.status} 
                    size="small" 
                    color={getStatusColor(user.status)}
                  />
                </TableCell>
                <TableCell>
                  {new Date(user.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {user.role !== 'admin' && (
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => {
                        setSelectedUser(user);
                        setNewStatus(user.status);
                        setStatusDialog(true);
                      }}
                    >
                      Edit Status
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Status Update Dialog */}
      <Dialog open={statusDialog} onClose={() => setStatusDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Update User Status</DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                User: {selectedUser.firstName} {selectedUser.lastName} ({selectedUser.email})
              </Typography>
              
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  label="Status"
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="suspended">Suspended</MenuItem>
                  <MenuItem value="banned">Banned</MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                multiline
                rows={3}
                label="Reason (Optional)"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Provide a reason for this status change..."
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleStatusUpdate}
            disabled={updating || !newStatus}
          >
            {updating ? <CircularProgress size={20} /> : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// Item Management Component
const ItemManagement = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedItem, setSelectedItem] = useState(null);
  const [statusDialog, setStatusDialog] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [reason, setReason] = useState('');
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');

  const fetchItems = async () => {
    try {
      const params = filter !== 'all' ? `?status=${filter}` : '';
      const response = await axiosInstance.get(`/api/admin/items${params}`);
      setItems(response.data || []);
    } catch (error) {
      setError('Failed to load items');
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [filter]);

  const handleStatusUpdate = async () => {
    if (!selectedItem || !newStatus) return;

    setUpdating(true);
    try {
      await axiosInstance.put(`/api/admin/items/${selectedItem.id}/status`, {
        status: newStatus,
        reason: reason.trim()
      });
      
      setStatusDialog(false);
      setSelectedItem(null);
      setNewStatus('');
      setReason('');
      fetchItems();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to update item status');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <CheckCircle />;
      case 'pending': return <Analytics />;
      case 'rejected': return <Cancel />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6">
          Item Management
        </Typography>
        
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Filter</InputLabel>
          <Select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            label="Filter"
          >
            <MenuItem value="all">All Items</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="approved">Approved</MenuItem>
            <MenuItem value="rejected">Rejected</MenuItem>
          </Select>
        </FormControl>
      </Box>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Item</TableCell>
              <TableCell>Owner</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Daily Rate</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={2}>
                    <img 
                      src={item.imageUrl} 
                      alt={item.name}
                      style={{ width: 40, height: 40, borderRadius: 4, objectFit: 'cover' }}
                    />
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        {item.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ID: {item.id}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    Owner ID: {item.ownerId}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip label={item.category || 'Uncategorized'} size="small" />
                </TableCell>
                <TableCell>₹{item.dailyRate}</TableCell>
                <TableCell>
                  <Chip 
                    label={item.status} 
                    size="small" 
                    color={getStatusColor(item.status)}
                    icon={getStatusIcon(item.status)}
                  />
                </TableCell>
                <TableCell>
                  {new Date(item.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => {
                      setSelectedItem(item);
                      setNewStatus(item.status);
                      setStatusDialog(true);
                    }}
                  >
                    Update Status
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Status Update Dialog */}
      <Dialog open={statusDialog} onClose={() => setStatusDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Update Item Status</DialogTitle>
        <DialogContent>
          {selectedItem && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Item: {selectedItem.name} (ID: {selectedItem.id})
              </Typography>
              
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  label="Status"
                >
                  <MenuItem value="pending">Pending Review</MenuItem>
                  <MenuItem value="approved">Approved</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                multiline
                rows={3}
                label="Reason (Optional)"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Provide a reason for this status change..."
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleStatusUpdate}
            disabled={updating || !newStatus}
          >
            {updating ? <CircularProgress size={20} /> : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// Main Admin Dashboard Component
const AdminDashboard = () => {
  const [tabValue, setTabValue] = useState(0);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardStats = async () => {
    try {
      const response = await axiosInstance.get('/api/admin/dashboard');
      setStats(response.data);
    } catch (error) {
      setError('Failed to load dashboard stats');
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Admin Dashboard
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {/* Dashboard Stats */}
      {stats && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Users"
              value={stats.totalUsers}
              icon={<People />}
              color="primary"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Active Users"
              value={stats.activeUsers}
              icon={<People />}
              color="success"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Items"
              value={stats.totalItems}
              icon={<Inventory />}
              color="info"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Pending Items"
              value={stats.pendingItems}
              icon={<Inventory />}
              color="warning"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Bookings"
              value={stats.totalBookings}
              icon={<BookOnline />}
              color="secondary"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Active Bookings"
              value={stats.activeBookings}
              icon={<BookOnline />}
              color="success"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Revenue"
              value={`₹${stats.totalRevenue.toFixed(2)}`}
              icon={<TrendingUp />}
              color="success"
            />
          </Grid>
        </Grid>
      )}

      {/* Management Tabs */}
      <Paper sx={{ borderRadius: 2 }}>
        <Tabs value={tabValue} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="Users" icon={<People />} />
          <Tab label="Items" icon={<Inventory />} />
          <Tab label="Bookings" icon={<BookOnline />} />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {tabValue === 0 && <UserManagement />}
          {tabValue === 1 && <ItemManagement />}
          {tabValue === 2 && (
            <Typography>Booking management coming soon...</Typography>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default AdminDashboard;