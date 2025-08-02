import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  Paper,
  Stack,
  Alert,
  Snackbar,
  Divider
} from '@mui/material';
import {
  Email,
  Phone,
  LocationOn,
  AccessTime,
  Send,
  SupportAgent,
  Business,
  Help
} from '@mui/icons-material';
import Footer from '../components/Footer';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    type: 'general'
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setShowSuccess(true);
      setIsSubmitting(false);
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
        type: 'general'
      });
    }, 1000);
  };

  const contactInfo = [
    {
      title: 'Email Support',
      value: 'support@borrowhub.com',
      description: 'Get help with bookings, payments, and account issues',
      icon: <Email />,
      color: 'primary.main'
    },
    {
      title: 'Phone Support',
      value: '+91 9999-888-777',
      description: 'Available Mon-Sat, 9 AM - 7 PM IST',
      icon: <Phone />,
      color: 'success.main'
    },
    {
      title: 'Office Location',
      value: 'Mumbai, Maharashtra',
      description: 'Serving 25+ cities across India',
      icon: <LocationOn />,
      color: 'warning.main'
    },
    {
      title: 'Response Time',
      value: '< 24 hours',
      description: 'We respond to all queries within 24 hours',
      icon: <AccessTime />,
      color: 'info.main'
    }
  ];

  const supportTypes = [
    {
      title: 'General Inquiry',
      description: 'Questions about BorrowHub platform and services',
      icon: <Help />,
      value: 'general'
    },
    {
      title: 'Technical Support',
      description: 'Issues with app, website, or technical problems',
      icon: <SupportAgent />,
      value: 'technical'
    },
    {
      title: 'Business Partnership',
      description: 'Collaboration, partnerships, and business inquiries',
      icon: <Business />,
      value: 'business'
    }
  ];

  return (
    <>
      <Container maxWidth="lg" sx={{ py: 8 }}>
        {/* Hero Section */}
        <Box textAlign="center" sx={{ mb: 8 }}>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 700,
              mb: 3,
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Contact Us
          </Typography>
          <Typography
            variant="h5"
            sx={{ color: 'text.secondary', mb: 4, maxWidth: '600px', mx: 'auto', lineHeight: 1.6 }}
          >
            We're here to help! Reach out to us with any questions, feedback, or support needs.
          </Typography>
        </Box>

        {/* Contact Information Cards */}
        <Grid container spacing={3} sx={{ mb: 8 }}>
          {contactInfo.map((info, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                elevation={2}
                sx={{
                  height: '100%',
                  borderRadius: 3,
                  textAlign: 'center',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.12)',
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ color: info.color, mb: 2, fontSize: '2.5rem' }}>
                    {info.icon}
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    {info.title}
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500, mb: 2, color: 'primary.main' }}>
                    {info.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
                    {info.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={6}>
          {/* Contact Form */}
          <Grid item xs={12} md={8}>
            <Paper elevation={2} sx={{ p: 6, borderRadius: 3 }}>
              <Typography variant="h4" sx={{ fontWeight: 600, mb: 4 }}>
                Send us a Message
              </Typography>
              
              {/* Support Type Selection */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  What can we help you with?
                </Typography>
                <Grid container spacing={2}>
                  {supportTypes.map((type, index) => (
                    <Grid item xs={12} sm={4} key={index}>
                      <Card
                        elevation={formData.type === type.value ? 3 : 1}
                        sx={{
                          cursor: 'pointer',
                          borderRadius: 2,
                          border: formData.type === type.value ? 2 : 0,
                          borderColor: 'primary.main',
                          '&:hover': {
                            elevation: 2,
                            transform: 'translateY(-2px)',
                          },
                          transition: 'all 0.2s ease'
                        }}
                        onClick={() => setFormData(prev => ({ ...prev, type: type.value }))}
                      >
                        <CardContent sx={{ p: 3, textAlign: 'center' }}>
                          <Box sx={{ color: 'primary.main', mb: 1 }}>
                            {type.icon}
                          </Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                            {type.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {type.description}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>

              <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email Address"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      multiline
                      rows={6}
                      variant="outlined"
                      placeholder="Please describe your inquiry or issue in detail..."
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      startIcon={<Send />}
                      disabled={isSubmitting}
                      sx={{
                        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                        px: 4,
                        py: 1.5,
                        borderRadius: 2,
                        '&:hover': {
                          background: 'linear-gradient(135deg, #4338ca 0%, #7c3aed 100%)',
                          transform: 'translateY(-2px)',
                        },
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {isSubmitting ? 'Sending...' : 'Send Message'}
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </Paper>
          </Grid>

          {/* Additional Information */}
          <Grid item xs={12} md={4}>
            <Stack spacing={4}>
              {/* FAQ Link */}
              <Paper elevation={1} sx={{ p: 4, borderRadius: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Quick Help
                </Typography>
                <Typography variant="body2" sx={{ mb: 3, lineHeight: 1.6 }}>
                  Looking for quick answers? Check our help center and FAQ section for common questions.
                </Typography>
                <Button
                  variant="outlined"
                  fullWidth
                  href="/help"
                  sx={{ borderRadius: 2 }}
                >
                  Visit Help Center
                </Button>
              </Paper>

              {/* Business Hours */}
              <Paper elevation={1} sx={{ p: 4, borderRadius: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  Business Hours
                </Typography>
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Monday - Friday</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>9 AM - 7 PM</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Saturday</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>10 AM - 6 PM</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Sunday</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>Closed</Typography>
                  </Box>
                  <Divider />
                  <Typography variant="caption" color="text.secondary">
                    All times are in IST (Indian Standard Time)
                  </Typography>
                </Stack>
              </Paper>

              {/* Emergency Contact */}
              <Paper elevation={1} sx={{ p: 4, borderRadius: 3, backgroundColor: 'error.50' }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'error.main' }}>
                  Emergency Support
                </Typography>
                <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.6 }}>
                  For urgent issues during active rentals, contact our emergency support line.
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'error.main' }}>
                  Emergency: +91 9999-111-222
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Available 24/7 for urgent rental issues
                </Typography>
              </Paper>
            </Stack>
          </Grid>
        </Grid>

        {/* Success Snackbar */}
        <Snackbar
          open={showSuccess}
          autoHideDuration={6000}
          onClose={() => setShowSuccess(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            onClose={() => setShowSuccess(false)}
            severity="success"
            variant="filled"
            sx={{ borderRadius: 2 }}
          >
            Thank you for your message! We'll get back to you within 24 hours.
          </Alert>
        </Snackbar>
      </Container>
      <Footer />
    </>
  );
};

export default ContactPage;