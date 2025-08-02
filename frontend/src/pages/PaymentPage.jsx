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
  Chip,
  Stack,
  Paper
} from '@mui/material';
import {
  Payment,
  Security,
  CheckCircle,
  CreditCard
} from '@mui/icons-material';
import axios from '../api/axios';
import AuthContext from '../context/AuthContext';

// Load Razorpay script
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

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
  const [paymentOrder, setPaymentOrder] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Check if we have booking data from navigation state
    if (location.state?.booking && location.state?.item) {
      setBooking(location.state.booking);
      setItem(location.state.item);
      setLoading(false);
    } else {
      // Fallback: fetch booking details (would need a backend endpoint)
      fetchBookingDetails();
    }

    // Load Razorpay script
    loadRazorpayScript();
  }, [bookingId, location.state, isAuthenticated, navigate]);

  const fetchBookingDetails = async () => {
    try {
      // For now, create mock data since we don't have a get single booking endpoint
      const mockBooking = {
        id: bookingId,
        itemId: '1',
        startDate: new Date().toISOString(),
        endDate: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString(),
        totalPrice: 50,
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

  const handlePayment = async () => {
    setProcessing(true);
    setError('');
    
    try {
      // Step 1: Create payment order
      const orderResponse = await axios.post('/api/payments/create-order', {
        bookingId: booking.id
      });
      
      const orderData = orderResponse.data;
      setPaymentOrder(orderData);

      // Step 2: Initialize Razorpay
      const options = {
        key: orderData.key, // Razorpay key from backend
        amount: orderData.amount, // Amount in paise
        currency: orderData.currency,
        name: orderData.name,
        description: orderData.description,
        order_id: orderData.orderId,
        handler: async function (response) {
          // Step 3: Verify payment
          try {
            const verifyResponse = await axios.post('/api/payments/verify', {
              paymentId: orderData.paymentId,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature,
              status: 'success'
            });

            if (verifyResponse.data.status === 'success') {
              // Payment successful
              alert('Payment successful! Your booking has been confirmed.');
              navigate('/bookings');
            } else {
              throw new Error('Payment verification failed');
            }
          } catch (verifyError) {
            console.error('Payment verification failed:', verifyError);
            setError('Payment verification failed. Please contact support.');
          } finally {
            setProcessing(false);
          }
        },
        prefill: {
          name: "Customer Name", // You can get this from user context
          email: "customer@example.com",
          contact: "9999999999"
        },
        theme: {
          color: "#1976d2"
        },
        modal: {
          ondismiss: function() {
            setProcessing(false);
            setError('Payment was cancelled');
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
      
    } catch (err) {
      console.error('Payment failed:', err);
      setError(err.response?.data?.error || 'Payment failed. Please try again.');
      setProcessing(false);
    }
  };

  // Fallback demo payment for when Razorpay is not available
  const handleDemoPayment = async () => {
    setProcessing(true);
    setError('');
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update booking status to confirmed
      await axios.put(`/api/bookings/${booking.id}`, {
        status: 'confirmed'
      });
      
      alert('Demo payment successful! Your booking has been confirmed.');
      navigate('/bookings');
    } catch (err) {
      console.error('Demo payment failed:', err);
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

  const duration = booking ? Math.ceil((new Date(booking.endDate) - new Date(booking.startDate)) / (1000 * 60 * 60 * 24)) : 1;

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ fontWeight: 700, mb: 4 }}>
          Complete Payment
        </Typography>
        
        {/* Payment Security Info */}
        <Paper sx={{ p: 3, mb: 3, backgroundColor: 'primary.light', color: 'primary.contrastText', borderRadius: 2 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Security />
            <Box>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                Secure Payment
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Your payment is protected with bank-level security
              </Typography>
            </Box>
          </Stack>
        </Paper>
        
        <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
              <Payment sx={{ mr: 1, verticalAlign: 'middle' }} />
              Booking Summary
            </Typography>
            
            {item && (
              <>
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={4}>
                    <img 
                      src={item.imageUrl || `https://placehold.co/150x100/556cd6/white?text=${item.name.replace(/\s/g, '+')}`}
                      alt={item.name}
                      style={{ 
                        width: '100%', 
                        borderRadius: '8px',
                        objectFit: 'cover',
                        height: '80px'
                      }}
                    />
                  </Grid>
                  <Grid item xs={8}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {item.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.description}
                    </Typography>
                    <Chip 
                      label={`₹${item.dailyRate}/day`} 
                      size="small" 
                      color="primary" 
                      sx={{ mt: 1 }}
                    />
                  </Grid>
                </Grid>
                
                <Divider sx={{ my: 3 }} />
              </>
            )}
            
            <Stack spacing={2} sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body1">Booking ID:</Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  #{booking?.id}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body1">Start Date:</Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {new Date(booking?.startDate).toLocaleDateString()}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body1">End Date:</Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {new Date(booking?.endDate).toLocaleDateString()}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body1">Duration:</Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {duration} day{duration > 1 ? 's' : ''}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body1">Daily Rate:</Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  ₹{item?.dailyRate || 50}
                </Typography>
              </Box>
            </Stack>
            
            <Divider sx={{ my: 3 }} />
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Total Amount:
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>
                ₹{booking?.totalPrice}
              </Typography>
            </Box>
            
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}
            
            {/* Payment Methods */}
            <Stack spacing={2} sx={{ mb: 3 }}>
              <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                Payment Methods:
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip label="💳 Credit Card" variant="outlined" />
                <Chip label="💳 Debit Card" variant="outlined" />
                <Chip label="📱 UPI" variant="outlined" />
                <Chip label="🏦 Net Banking" variant="outlined" />
                <Chip label="📱 Wallet" variant="outlined" />
              </Box>
            </Stack>
            
            <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
              <Button
                variant="outlined"
                fullWidth
                onClick={handleCancel}
                disabled={processing}
                sx={{ borderRadius: 2, fontWeight: 600 }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                fullWidth
                onClick={window.Razorpay ? handlePayment : handleDemoPayment}
                disabled={processing}
                startIcon={processing ? <CircularProgress size={20} /> : <CreditCard />}
                sx={{ borderRadius: 2, fontWeight: 600 }}
              >
                {processing ? 'Processing...' : `Pay ₹${booking?.totalPrice}`}
              </Button>
            </Box>
          </CardContent>
        </Card>
        
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 3 }}>
          {window.Razorpay ? (
            <>🔒 Payments are secured by Razorpay</>
          ) : (
            <>⚠️ Demo mode - No actual payment will be processed</>
          )}
        </Typography>
      </Box>
    </Container>
  );
};

export default PaymentPage;