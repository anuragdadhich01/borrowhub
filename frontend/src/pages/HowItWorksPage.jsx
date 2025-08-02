import React from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Stack,
  Button,
  Avatar,
  Stepper,
  Step,
  StepLabel,
  StepContent
} from '@mui/material';
import {
  Search,
  BookmarkBorder,
  Payment,
  Star,
  Security,
  Support
} from '@mui/icons-material';

const HowItWorksPage = () => {
  const steps = [
    {
      title: "Search & Discover",
      description: "Browse thousands of items or search for exactly what you need",
      icon: <Search />,
      details: "Use our powerful search and filter options to find items by category, location, price range, and availability."
    },
    {
      title: "Book & Reserve",
      description: "Select your dates and book the item instantly",
      icon: <BookmarkBorder />,
      details: "Choose your rental period, review the terms, and make a booking. Get instant confirmation from the owner."
    },
    {
      title: "Pay Securely",
      description: "Complete payment through our secure platform",
      icon: <Payment />,
      details: "Pay safely using our integrated payment system. Your money is protected until the rental is complete."
    },
    {
      title: "Enjoy & Return",
      description: "Use the item and return it as scheduled",
      icon: <Star />,
      details: "Enjoy your rental! Return the item on time and in good condition. Rate your experience to help the community."
    }
  ];

  const features = [
    {
      icon: <Security />,
      title: "Secure Payments",
      description: "All transactions are protected with bank-level security"
    },
    {
      icon: <Support />,
      title: "24/7 Support",
      description: "Our customer support team is always here to help"
    },
    {
      icon: <Star />,
      title: "Quality Guarantee",
      description: "All items are verified and quality-checked by owners"
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      {/* Hero Section */}
      <Box textAlign="center" sx={{ mb: 8 }}>
        <Typography variant="h2" sx={{ fontWeight: 700, mb: 3 }}>
          How BorrowHub Works
        </Typography>
        <Typography variant="h5" color="text.secondary" sx={{ maxWidth: 800, mx: 'auto', lineHeight: 1.6 }}>
          Renting items on BorrowHub is simple, secure, and convenient. 
          Follow these easy steps to start your rental journey.
        </Typography>
      </Box>

      {/* Steps Section */}
      <Box sx={{ mb: 8 }}>
        <Typography variant="h3" sx={{ fontWeight: 700, mb: 6, textAlign: 'center' }}>
          Simple 4-Step Process
        </Typography>
        
        <Grid container spacing={4}>
          {steps.map((step, index) => (
            <Grid item xs={12} md={6} lg={3} key={index}>
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  height: '100%',
                  textAlign: 'center',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 3,
                  position: 'relative',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    borderColor: 'primary.main',
                    transform: 'translateY(-4px)',
                    boxShadow: '0px 10px 15px rgba(0, 0, 0, 0.1)',
                  }
                }}
              >
                {/* Step number */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: -15,
                    left: 20,
                    backgroundColor: 'primary.main',
                    color: 'white',
                    borderRadius: '50%',
                    width: 30,
                    height: 30,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: '0.875rem'
                  }}
                >
                  {index + 1}
                </Box>

                <Box sx={{ color: 'primary.main', mb: 3, mt: 2 }}>
                  {step.icon}
                </Box>
                
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  {step.title}
                </Typography>
                
                <Typography color="text.secondary" sx={{ mb: 3 }}>
                  {step.description}
                </Typography>
                
                <Typography variant="body2" color="text.secondary">
                  {step.details}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Features Section */}
      <Box sx={{ mb: 8 }}>
        <Typography variant="h3" sx={{ fontWeight: 700, mb: 6, textAlign: 'center' }}>
          Why Choose BorrowHub?
        </Typography>
        
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  textAlign: 'center',
                  backgroundColor: 'grey.50',
                  borderRadius: 3,
                  height: '100%'
                }}
              >
                <Box sx={{ color: 'primary.main', mb: 2 }}>
                  {feature.icon}
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  {feature.title}
                </Typography>
                <Typography color="text.secondary">
                  {feature.description}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* CTA Section */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 6, 
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
          color: 'white',
          borderRadius: 3,
          textAlign: 'center'
        }}
      >
        <Typography variant="h3" sx={{ fontWeight: 700, mb: 3 }}>
          Ready to Start Renting?
        </Typography>
        <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
          Join thousands of users who are already saving money and reducing waste
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
          <Button
            variant="contained"
            size="large"
            href="/register"
            sx={{
              backgroundColor: 'white',
              color: 'primary.main',
              fontWeight: 600,
              px: 4,
              py: 1.5,
              '&:hover': {
                backgroundColor: 'grey.100',
              }
            }}
          >
            Sign Up Now
          </Button>
          <Button
            variant="outlined"
            size="large"
            href="/"
            sx={{
              borderColor: 'white',
              color: 'white',
              fontWeight: 600,
              px: 4,
              py: 1.5,
              '&:hover': {
                borderColor: 'white',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              }
            }}
          >
            Browse Items
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
};

export default HowItWorksPage;