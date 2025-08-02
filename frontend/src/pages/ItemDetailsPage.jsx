import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Divider,
  Stack,
  Container,
  Paper,
  Snackbar,
  Tabs,
  Tab
} from '@mui/material';
import {
  CalendarToday,
  AttachMoney,
  Star,
  Verified,
  LocationOn,
  AccessTime,
  Person,
  Info
} from '@mui/icons-material';
import axios from '../api/axios';
import AuthContext from '../context/AuthContext';
import BookingCalendar from '../components/BookingCalendar';

const ItemDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useContext(AuthContext);
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookingDialog, setBookingDialog] = useState(false);
  const [selectedDates, setSelectedDates] = useState(null);
  const [totalPrice, setTotalPrice] = useState(0);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', type: 'success' });
  const [tabValue, setTabValue] = useState(0);

  const handleDateRangeSelect = (dateRange) => {
    setSelectedDates(dateRange);
    if (dateRange && item) {
      const days = Math.ceil((new Date(dateRange.endDate) - new Date(dateRange.startDate)) / (1000 * 60 * 60 * 24));
      setTotalPrice(days * item.dailyRate);
    } else {
      setTotalPrice(0);
    }
  };

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const res = await axios.get(`/api/items/${id}`);
        setItem(res.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError('Failed to load item details');
        setLoading(false);
      }
    };

    fetchItem();
  }, [id]);

  const handleBookNow = () => {
    if (!isAuthenticated) {
      setNotification({
        open: true,
        message: 'You must be logged in to book an item.',
        type: 'warning'
      });
      setTimeout(() => navigate('/login'), 2000);
      return;
    }
    setBookingDialog(true);
  };

  const handleBookingConfirm = async () => {
    if (!selectedDates) {
      setNotification({
        open: true,
        message: 'Please select rental dates using the calendar.',
        type: 'error'
      });
      return;
    }

    const bookingDetails = {
      itemId: item.id,
      startDate: selectedDates.startDate.toISOString(),
      endDate: selectedDates.endDate.toISOString(),
      totalPrice: totalPrice,
    };

    setBookingLoading(true);
    try {
      const res = await axios.post('/api/bookings', bookingDetails);
      const bookingId = res.data.id;
      
      setNotification({
        open: true,
        message: 'Booking created successfully! Redirecting to payment...',
        type: 'success'
      });
      
      setBookingDialog(false);
      setTimeout(() => {
        navigate(`/pay/${bookingId}`, { 
          state: { 
            bookingId,
            booking: res.data,
            item: item
          }
        });
      }, 1500);
    } catch (err) {
      console.error('Failed to create booking', err);
      setNotification({
        open: true,
        message: err.response?.data?.error || 'Failed to create booking. Please try again.',
        type: 'error'
      });
    } finally {
      setBookingLoading(false);
    }
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error" sx={{ mt: 4 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  if (!item) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="warning" sx={{ mt: 4 }}>
          Item not found.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={4}>
        {/* Item Image */}
        <Grid item xs={12} md={6}>
          <Card elevation={0} sx={{ borderRadius: 3 }}>
            <CardMedia
              component="img"
              height="400"
              image={item.imageUrl || 'https://placehold.co/600x400/556cd6/white?text=No+Image'}
              alt={item.name}
              sx={{ objectFit: 'cover' }}
            />
          </Card>
        </Grid>

        {/* Item Details */}
        <Grid item xs={12} md={6}>
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ mb: 3 }}>
              <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                <Chip
                  label={item.available ? 'Available' : 'Not Available'}
                  color={item.available ? 'success' : 'error'}
                  size="small"
                />
                <Chip
                  icon={<Verified />}
                  label="Verified Owner"
                  color="primary"
                  variant="outlined"
                  size="small"
                />
              </Stack>
              
              <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 2 }}>
                {item.name}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AttachMoney sx={{ color: 'primary.main', mr: 1 }} />
                <Typography variant="h5" sx={{ fontWeight: 600, color: 'primary.main' }}>
                  ₹{item.dailyRate}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ ml: 1 }}>
                  per day
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Star sx={{ color: 'orange', mr: 1 }} />
                <Typography variant="body1" sx={{ mr: 1 }}>
                  4.8
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  (24 reviews)
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Description
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                {item.description}
              </Typography>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Details
              </Typography>
              <Stack spacing={1}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <LocationOn sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    Available in Mumbai, Delhi
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <AccessTime sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    Instant booking available
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Person sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    Hosted by verified owner
                  </Typography>
                </Box>
              </Stack>
            </Box>

            <Box sx={{ mt: 'auto' }}>
              <Button
                variant="contained"
                size="large"
                fullWidth
                onClick={handleBookNow}
                disabled={!item.available}
                sx={{
                  py: 2,
                  borderRadius: 2,
                  fontWeight: 600,
                  fontSize: '1.1rem',
                  textTransform: 'none'
                }}
              >
                {item.available ? 'Book Now' : 'Not Available'}
              </Button>
            </Box>
          </Box>
        </Grid>
      </Grid>

      {/* Booking Dialog */}
      <Dialog
        open={bookingDialog}
        onClose={() => setBookingDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Book {item.name}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ mb: 3 }}>
              <Tab label="Select Dates" icon={<CalendarToday />} />
              <Tab label="Summary" icon={<Info />} disabled={!selectedDates} />
            </Tabs>

            {tabValue === 0 && (
              <BookingCalendar
                itemId={item.id}
                onDateRangeSelect={handleDateRangeSelect}
                selectedStartDate={selectedDates?.startDate}
                selectedEndDate={selectedDates?.endDate}
              />
            )}

            {tabValue === 1 && selectedDates && (
              <Paper elevation={0} sx={{ p: 3, backgroundColor: 'grey.50', borderRadius: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Booking Summary
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Item:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{item.name}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Daily Rate:</Typography>
                  <Typography variant="body2">₹{item.dailyRate}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Start Date:</Typography>
                  <Typography variant="body2">{new Date(selectedDates.startDate).toLocaleDateString()}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">End Date:</Typography>
                  <Typography variant="body2">{new Date(selectedDates.endDate).toLocaleDateString()}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">
                    Duration: {Math.ceil((new Date(selectedDates.endDate) - new Date(selectedDates.startDate)) / (1000 * 60 * 60 * 24))} day(s)
                  </Typography>
                </Box>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Total Amount:
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                    ₹{totalPrice}
                  </Typography>
                </Box>
              </Paper>
            )}

            {selectedDates && (
              <Alert severity="info" sx={{ mt: 2 }}>
                You'll be redirected to payment after confirming this booking.
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={() => setBookingDialog(false)}
            disabled={bookingLoading}
          >
            Cancel
          </Button>
          {tabValue === 0 && selectedDates && (
            <Button
              variant="outlined"
              onClick={() => setTabValue(1)}
              sx={{ px: 4 }}
            >
              Review Booking
            </Button>
          )}
          {tabValue === 1 && (
            <Button
              variant="contained"
              onClick={handleBookingConfirm}
              disabled={bookingLoading || !selectedDates}
              sx={{ px: 4 }}
            >
              {bookingLoading ? <CircularProgress size={24} /> : 'Confirm Booking'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.type}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ItemDetailsPage;