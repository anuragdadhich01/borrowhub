import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  Chip,
  Divider,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  TrendingUp,
  Star,
  AttachMoney,
  ShoppingBag,
  Inventory,
  Analytics,
  Assessment,
  CalendarToday,
  LocationOn,
  ThumbUp,
  Visibility,
  Info
} from '@mui/icons-material';
import axiosInstance from '../api/axios';

// Stat Card Component
const StatCard = ({ title, value, subtitle, icon, color = 'primary', trend = null }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
        <Box flex={1}>
          <Typography color="text.secondary" variant="body2" gutterBottom>
            {title}
          </Typography>
          <Typography variant="h4" component="div" fontWeight="bold">
            {value}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {subtitle}
            </Typography>
          )}
          {trend && (
            <Box display="flex" alignItems="center" mt={1}>
              <TrendingUp 
                sx={{ 
                  fontSize: 16, 
                  color: trend > 0 ? 'success.main' : 'error.main',
                  transform: trend < 0 ? 'rotate(180deg)' : 'none'
                }} 
              />
              <Typography 
                variant="caption" 
                color={trend > 0 ? 'success.main' : 'error.main'}
                sx={{ ml: 0.5 }}
              >
                {Math.abs(trend)}% vs last month
              </Typography>
            </Box>
          )}
        </Box>
        <Box
          sx={{
            backgroundColor: `${color}.main`,
            color: 'white',
            borderRadius: 2,
            p: 1.5,
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

// User Analytics Dashboard Component
const UserAnalyticsDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userStats, setUserStats] = useState(null);
  const [bookingHistory, setBookingHistory] = useState([]);
  const [userItems, setUserItems] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Fetch user profile with stats
      const profileResponse = await axiosInstance.get('/api/profile');
      const userProfile = profileResponse.data;
      
      // Fetch user's bookings
      const bookingsResponse = await axiosInstance.get('/api/bookings');
      const bookings = bookingsResponse.data || [];
      
      // Fetch user's items
      const itemsResponse = await axiosInstance.get('/api/my-items');
      const items = itemsResponse.data || [];
      
      // Calculate user statistics
      const totalSpent = bookings
        .filter(b => b.status === 'completed')
        .reduce((sum, b) => sum + (b.totalPrice || 0), 0);
      
      const totalEarned = bookings
        .filter(b => b.status === 'completed' && items.some(item => item.id === b.itemId))
        .reduce((sum, b) => sum + (b.totalPrice || 0), 0);
      
      const activeBookings = bookings.filter(b => b.status === 'confirmed').length;
      const completedBookings = bookings.filter(b => b.status === 'completed').length;
      
      const stats = {
        itemsListed: items.length,
        totalBookings: bookings.length,
        activeBookings,
        completedBookings,
        totalSpent,
        totalEarned,
        averageRating: 4.7, // Mock data - would come from ratings
        profileCompletion: calculateProfileCompletion(userProfile.user),
        joinDate: userProfile.user.createdAt,
        ...userProfile.stats
      };
      
      setUserStats(stats);
      setBookingHistory(bookings.slice(0, 5)); // Recent 5 bookings
      setUserItems(items.slice(0, 3)); // Top 3 items
      
      // Mock recent activity
      setRecentActivity([
        { type: 'booking', action: 'Booked Camera DSLR', date: new Date(Date.now() - 86400000), amount: 50 },
        { type: 'listing', action: 'Listed Mountain Bike', date: new Date(Date.now() - 172800000) },
        { type: 'review', action: 'Received 5-star review', date: new Date(Date.now() - 259200000) },
        { type: 'payment', action: 'Received payment', date: new Date(Date.now() - 345600000), amount: 75 }
      ]);
      
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const calculateProfileCompletion = (user) => {
    const fields = ['firstName', 'lastName', 'phone', 'address', 'email'];
    const completed = fields.filter(field => user[field] && user[field].trim()).length;
    return Math.round((completed / fields.length) * 100);
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'booking': return <ShoppingBag />;
      case 'listing': return <Inventory />;
      case 'review': return <Star />;
      case 'payment': return <AttachMoney />;
      default: return <Analytics />;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'booking': return 'primary';
      case 'listing': return 'success';
      case 'review': return 'warning';
      case 'payment': return 'info';
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

  if (error) {
    return <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>;
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom fontWeight="bold">
        Your Analytics
      </Typography>
      
      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Items Listed"
            value={userStats?.itemsListed || 0}
            subtitle="Your active listings"
            icon={<Inventory />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Bookings"
            value={userStats?.totalBookings || 0}
            subtitle={`${userStats?.activeBookings || 0} active`}
            icon={<ShoppingBag />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Earned"
            value={`₹${userStats?.totalEarned?.toFixed(2) || '0.00'}`}
            subtitle="From your listings"
            icon={<AttachMoney />}
            color="info"
            trend={12}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Average Rating"
            value={userStats?.averageRating || '0.0'}
            subtitle="From customer reviews"
            icon={<Star />}
            color="warning"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Profile Completion */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Profile Completion
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box sx={{ width: '100%', mr: 1 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={userStats?.profileCompletion || 0} 
                    sx={{ height: 8, borderRadius: 5 }}
                  />
                </Box>
                <Box sx={{ minWidth: 35 }}>
                  <Typography variant="body2" color="text.secondary">
                    {userStats?.profileCompletion || 0}%
                  </Typography>
                </Box>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Complete your profile to increase trust and bookings
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Activity
              </Typography>
              <List dense>
                {recentActivity.map((activity, index) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <Avatar 
                      sx={{ 
                        mr: 2, 
                        bgcolor: `${getActivityColor(activity.type)}.main`,
                        width: 32,
                        height: 32
                      }}
                    >
                      {getActivityIcon(activity.type)}
                    </Avatar>
                    <ListItemText
                      primary={activity.action}
                      secondary={`${activity.date.toLocaleDateString()} ${
                        activity.amount ? `• ₹${activity.amount}` : ''
                      }`}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Top Performing Items */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Your Top Items
              </Typography>
              {userItems.length === 0 ? (
                <Typography color="text.secondary">
                  No items listed yet
                </Typography>
              ) : (
                <List dense>
                  {userItems.map((item, index) => (
                    <ListItem key={item.id} sx={{ px: 0 }}>
                      <Avatar 
                        src={item.imageUrl} 
                        sx={{ mr: 2, width: 40, height: 40 }}
                      />
                      <ListItemText
                        primary={item.name}
                        secondary={`₹${item.dailyRate}/day • ${item.available ? 'Available' : 'Unavailable'}`}
                      />
                      <Chip 
                        label={item.status} 
                        size="small" 
                        color={item.status === 'approved' ? 'success' : 'warning'}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Booking History Summary */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Bookings
              </Typography>
              {bookingHistory.length === 0 ? (
                <Typography color="text.secondary">
                  No bookings yet
                </Typography>
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Amount</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {bookingHistory.map((booking) => (
                        <TableRow key={booking.id}>
                          <TableCell>
                            {new Date(booking.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>₹{booking.totalPrice}</TableCell>
                          <TableCell>
                            <Chip 
                              label={booking.status} 
                              size="small"
                              color={
                                booking.status === 'completed' ? 'success' :
                                booking.status === 'confirmed' ? 'info' :
                                booking.status === 'pending' ? 'warning' : 'default'
                              }
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Stats */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Insights
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Box textAlign="center" p={2}>
                    <Typography variant="h4" color="primary.main" fontWeight="bold">
                      {userStats?.totalSpent?.toFixed(0) || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Spent (₹)
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box textAlign="center" p={2}>
                    <Typography variant="h4" color="success.main" fontWeight="bold">
                      {userStats?.completedBookings || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Completed Bookings
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box textAlign="center" p={2}>
                    <Typography variant="h4" color="info.main" fontWeight="bold">
                      {userStats?.joinDate ? 
                        Math.floor((new Date() - new Date(userStats.joinDate)) / (1000 * 60 * 60 * 24)) 
                        : 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Days Active
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box textAlign="center" p={2}>
                    <Typography variant="h4" color="warning.main" fontWeight="bold">
                      5
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Reviews Given
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default UserAnalyticsDashboard;