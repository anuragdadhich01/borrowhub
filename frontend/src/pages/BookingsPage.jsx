import React, { useState, useEffect, useContext } from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Alert,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { CalendarToday, AttachMoney } from '@mui/icons-material';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const BookingsPage = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    const fetchBookings = async () => {
      try {
        const response = await axios.get('/api/bookings');
        setBookings(response.data || []);
      } catch (err) {
        console.error('Failed to fetch bookings:', err);
        setError('Failed to load bookings');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [isAuthenticated]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'completed':
        return 'info';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedBooking(null);
  };

  const handleCancelBooking = async (bookingId) => {
    try {
      await axios.put(`/api/bookings/${bookingId}`, { status: 'cancelled' });
      // Refresh bookings
      const response = await axios.get('/api/bookings');
      setBookings(response.data || []);
      setDialogOpen(false);
    } catch (err) {
      console.error('Failed to cancel booking:', err);
    }
  };

  if (!isAuthenticated) {
    return (
      <Container maxWidth="md">
        <Alert severity="warning" sx={{ mt: 4 }}>
          Please log in to view your bookings.
        </Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container maxWidth="md">
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          My Bookings
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {bookings.length === 0 ? (
          <Alert severity="info" sx={{ mt: 3 }}>
            You haven't made any bookings yet. Browse available items to make your first booking!
          </Alert>
        ) : (
          <Grid container spacing={3} sx={{ mt: 1 }}>
            {bookings.map((booking) => (
              <Grid item xs={12} key={booking.id}>
                <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'between', alignItems: 'flex-start' }}>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" gutterBottom>
                          Booking #{booking.id}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <CalendarToday sx={{ mr: 1, fontSize: 16 }} />
                          <Typography variant="body2" color="text.secondary">
                            {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <AttachMoney sx={{ mr: 1, fontSize: 16 }} />
                          <Typography variant="body2" color="text.secondary">
                            ₹{booking.totalPrice}
                          </Typography>
                        </Box>
                        
                        <Chip 
                          label={booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          color={getStatusColor(booking.status)}
                          size="small"
                        />
                      </Box>
                      
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleViewDetails(booking)}
                      >
                        View Details
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Booking Details Dialog */}
        <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>Booking Details</DialogTitle>
          <DialogContent>
            {selectedBooking && (
              <Box>
                <Typography variant="body1" gutterBottom>
                  <strong>Booking ID:</strong> {selectedBooking.id}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Item ID:</strong> {selectedBooking.itemId}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Start Date:</strong> {new Date(selectedBooking.startDate).toLocaleDateString()}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>End Date:</strong> {new Date(selectedBooking.endDate).toLocaleDateString()}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Total Price:</strong> ₹{selectedBooking.totalPrice}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Status:</strong> 
                  <Chip 
                    label={selectedBooking.status.charAt(0).toUpperCase() + selectedBooking.status.slice(1)}
                    color={getStatusColor(selectedBooking.status)}
                    size="small"
                    sx={{ ml: 1 }}
                  />
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Created:</strong> {new Date(selectedBooking.createdAt).toLocaleString()}
                </Typography>
                {selectedBooking.updatedAt && (
                  <Typography variant="body1" gutterBottom>
                    <strong>Last Updated:</strong> {new Date(selectedBooking.updatedAt).toLocaleString()}
                  </Typography>
                )}
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            {selectedBooking?.status === 'pending' && (
              <Button
                color="error"
                onClick={() => handleCancelBooking(selectedBooking.id)}
              >
                Cancel Booking
              </Button>
            )}
            <Button onClick={handleCloseDialog}>Close</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default BookingsPage;