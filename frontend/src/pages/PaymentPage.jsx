import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Alert,
  CircularProgress,
  Divider,
  Grid,
} from '@mui/material';
import axios from '../api/axios';
import AuthContext from '../context/AuthContext';

const PaymentPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useContext(AuthContext);
  
  const [booking, setBooking] = useState(null);
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchBookingDetails = async () => {
      try {
        // Get booking details from location state if available
        const stateBookingId = location.state?.bookingId || bookingId;
        
        // For now, we'll create a mock booking since we need to fetch it
        // In a real app, you'd fetch the booking from the backend
        const mockBooking = {
          id: stateBookingId,
          itemId: '1', // This would come from the actual booking
          startDate: new Date().toISOString(),
          endDate: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString(),
          totalPrice: 50, // This would come from the actual booking
          status: 'pending'
        };
        
        setBooking(mockBooking);
        
        // Fetch item details
        const itemRes = await axios.get(`/api/items/${mockBooking.itemId}`);
        setItem(itemRes.data);
        
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch booking details:', err);
        setError('Failed to load booking details');
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [bookingId, location.state, isAuthenticated, navigate]);

  const handlePayment = async () => {
    setProcessing(true);
    setError('');
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update booking status to confirmed
      await axios.put(`/api/bookings/${booking.id}`, {
        status: 'confirmed'
      });
      
      alert('Payment successful! Your booking has been confirmed.');
      navigate('/'); // Redirect to home or bookings page
    } catch (err) {
      console.error('Payment failed:', err);
      setError('Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleCancel = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error && !booking) {
    return (
      <Container maxWidth="sm">
        <Alert severity="error" sx={{ mt: 4 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Payment
        </Typography>
        
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Booking Summary
            </Typography>
            
            {item && (
              <>
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={4}>
                    <img 
                      src={item.imageUrl || `https://placehold.co/150x100/556cd6/white?text=${item.name.replace(/\s/g, '+')}`}
                      alt={item.name}
                      style={{ width: '100%', borderRadius: '4px' }}
                    />
                  </Grid>
                  <Grid item xs={8}>
                    <Typography variant="h6">{item.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.description}
                    </Typography>
                  </Grid>
                </Grid>
                
                <Divider sx={{ my: 2 }} />
              </>
            )}
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="body1">
                <strong>Booking ID:</strong> {booking?.id}
              </Typography>
              <Typography variant="body1">
                <strong>Start Date:</strong> {new Date(booking?.startDate).toLocaleDateString()}
              </Typography>
              <Typography variant="body1">
                <strong>End Date:</strong> {new Date(booking?.endDate).toLocaleDateString()}
              </Typography>
              <Typography variant="body1">
                <strong>Duration:</strong> 1 day
              </Typography>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6">
                <strong>Total Amount: ₹{booking?.totalPrice}</strong>
              </Typography>
            </Box>
            
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            
            <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
              <Button
                variant="outlined"
                fullWidth
                onClick={handleCancel}
                disabled={processing}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                fullWidth
                onClick={handlePayment}
                disabled={processing}
              >
                {processing ? <CircularProgress size={24} /> : 'Pay Now'}
              </Button>
            </Box>
          </CardContent>
        </Card>
        
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2 }}>
          This is a demo payment page. No actual payment will be processed.
        </Typography>
      </Box>
    </Container>
  );
};

export default PaymentPage;