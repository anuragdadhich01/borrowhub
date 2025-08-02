import React from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Avatar,
  Stack,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Search,
  Message,
  Payment,
  LocalShipping,
  ThumbUp,
  Security,
  VerifiedUser,
  SupportAgent,
  ExpandMore
} from '@mui/icons-material';
import Footer from '../components/Footer';

const HowItWorksPage = () => {
  const renterSteps = [
    {
      label: 'Search & Discover',
      description: 'Browse through thousands of items across 25+ cities. Use filters to find exactly what you need.',
      icon: <Search />,
      details: ['Search by category, location, and price', 'View detailed photos and descriptions', 'Check availability and ratings']
    },
    {
      label: 'Book & Connect',
      description: 'Send a booking request to the owner. Chat to discuss details, pickup/delivery options.',
      icon: <Message />,
      details: ['Instant booking or request approval', 'Direct messaging with owners', 'Flexible pickup/delivery options']
    },
    {
      label: 'Pay Securely',
      description: 'Make secure payments through our platform. Your money is protected until you receive the item.',
      icon: <Payment />,
      details: ['Multiple payment options', 'Escrow protection', 'Transparent pricing with no hidden fees']
    },
    {
      label: 'Receive & Enjoy',
      description: 'Get the item delivered or pick it up. Use it for your rental period and return when done.',
      icon: <LocalShipping />,
      details: ['Doorstep delivery available', 'Quality assurance checks', 'Easy return process']
    },
    {
      label: 'Rate & Review',
      description: 'Share your experience and help build trust in our community through honest reviews.',
      icon: <ThumbUp />,
      details: ['Rate your experience', 'Leave helpful reviews', 'Build community trust']
    }
  ];

  const ownerSteps = [
    {
      label: 'List Your Item',
      description: 'Create attractive listings with photos and descriptions. Set your daily rates and availability.',
      icon: <Search />,
      details: ['Professional photo guidelines', 'Competitive pricing suggestions', 'Easy listing management']
    },
    {
      label: 'Receive Requests',
      description: 'Get booking requests from verified renters. Review profiles and approve suitable requests.',
      icon: <Message />,
      details: ['Verified renter profiles', 'Instant notifications', 'Flexible approval process']
    },
    {
      label: 'Secure Payment',
      description: 'Receive secure payments for your rentals. Payments are processed automatically.',
      icon: <Payment />,
      details: ['Automatic payment processing', 'Competitive commission rates', 'Quick payouts']
    },
    {
      label: 'Handover Item',
      description: 'Hand over your item to the renter. Our platform facilitates smooth handovers.',
      icon: <LocalShipping />,
      details: ['Flexible handover options', 'Item condition documentation', 'Insurance coverage']
    },
    {
      label: 'Earn & Grow',
      description: 'Earn money from items you rarely use. Build your reputation and grow your rental business.',
      icon: <ThumbUp />,
      details: ['Consistent passive income', 'Growing rental network', 'Business growth tools']
    }
  ];

  const features = [
    {
      title: 'Verified Users',
      description: 'All users go through identity verification for safe transactions.',
      icon: <VerifiedUser />
    },
    {
      title: 'Secure Payments',
      description: 'End-to-end encrypted payments with escrow protection.',
      icon: <Security />
    },
    {
      title: '24/7 Support',
      description: 'Round-the-clock customer support for any issues or queries.',
      icon: <SupportAgent />
    }
  ];

  const faqs = [
    {
      question: 'How do I know if an item is available?',
      answer: 'Each listing shows real-time availability. You can also check the calendar on item pages to see available dates.'
    },
    {
      question: 'What if the item gets damaged during my rental?',
      answer: 'All rentals are covered by our comprehensive insurance. Report any damage immediately and we\'ll handle the claims process.'
    },
    {
      question: 'How do payments work?',
      answer: 'Payments are held securely in escrow until you receive the item. Owners receive payment after successful item handover.'
    },
    {
      question: 'Can I cancel my booking?',
      answer: 'Yes, you can cancel bookings according to our cancellation policy. Cancellation fees may apply depending on timing.'
    },
    {
      question: 'How do I become a verified user?',
      answer: 'Complete your profile with ID verification, phone number confirmation, and email verification to become a verified user.'
    },
    {
      question: 'What happens if an owner doesn\'t show up?',
      answer: 'Our support team will immediately assist you in finding alternative solutions and processing refunds if needed.'
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
            How It Works
          </Typography>
          <Typography
            variant="h5"
            sx={{ color: 'text.secondary', mb: 4, maxWidth: '600px', mx: 'auto', lineHeight: 1.6 }}
          >
            Rent anything, anytime, anywhere. Here's how BorrowHub makes sharing simple and secure.
          </Typography>
        </Box>

        {/* For Renters Section */}
        <Box sx={{ mb: 10 }}>
          <Typography variant="h3" sx={{ fontWeight: 600, mb: 6, textAlign: 'center' }}>
            For Renters
          </Typography>
          <Grid container spacing={4}>
            {renterSteps.map((step, index) => (
              <Grid item xs={12} md={6} lg={4} key={index}>
                <Card
                  elevation={2}
                  sx={{
                    height: '100%',
                    borderRadius: 3,
                    position: 'relative',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0px 12px 32px rgba(0, 0, 0, 0.15)',
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Box
                      sx={{
                        position: 'absolute',
                        top: -20,
                        left: 24,
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        backgroundColor: 'primary.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 600
                      }}
                    >
                      {index + 1}
                    </Box>
                    <Box sx={{ mt: 2, mb: 3, color: 'primary.main', fontSize: '2rem' }}>
                      {step.icon}
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                      {step.label}
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6 }}>
                      {step.description}
                    </Typography>
                    <Stack spacing={1}>
                      {step.details.map((detail, detailIndex) => (
                        <Typography
                          key={detailIndex}
                          variant="body2"
                          sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center' }}
                        >
                          • {detail}
                        </Typography>
                      ))}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* For Owners Section */}
        <Box sx={{ mb: 10 }}>
          <Typography variant="h3" sx={{ fontWeight: 600, mb: 6, textAlign: 'center' }}>
            For Owners
          </Typography>
          <Grid container spacing={4}>
            {ownerSteps.map((step, index) => (
              <Grid item xs={12} md={6} lg={4} key={index}>
                <Card
                  elevation={2}
                  sx={{
                    height: '100%',
                    borderRadius: 3,
                    position: 'relative',
                    backgroundColor: 'grey.50',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0px 12px 32px rgba(0, 0, 0, 0.15)',
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Box
                      sx={{
                        position: 'absolute',
                        top: -20,
                        left: 24,
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        backgroundColor: 'success.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 600
                      }}
                    >
                      {index + 1}
                    </Box>
                    <Box sx={{ mt: 2, mb: 3, color: 'success.main', fontSize: '2rem' }}>
                      {step.icon}
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                      {step.label}
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6 }}>
                      {step.description}
                    </Typography>
                    <Stack spacing={1}>
                      {step.details.map((detail, detailIndex) => (
                        <Typography
                          key={detailIndex}
                          variant="body2"
                          sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center' }}
                        >
                          • {detail}
                        </Typography>
                      ))}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Key Features */}
        <Box sx={{ mb: 10 }}>
          <Typography variant="h3" sx={{ fontWeight: 600, mb: 6, textAlign: 'center' }}>
            Why Choose BorrowHub?
          </Typography>
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Paper
                  elevation={1}
                  sx={{
                    p: 4,
                    textAlign: 'center',
                    borderRadius: 3,
                    height: '100%',
                    '&:hover': {
                      boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.12)',
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  <Box sx={{ color: 'primary.main', mb: 3, fontSize: '3rem' }}>
                    {feature.icon}
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                    {feature.description}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* FAQ Section */}
        <Box sx={{ mb: 8 }}>
          <Typography variant="h3" sx={{ fontWeight: 600, mb: 6, textAlign: 'center' }}>
            Frequently Asked Questions
          </Typography>
          <Box sx={{ maxWidth: '800px', mx: 'auto' }}>
            {faqs.map((faq, index) => (
              <Accordion
                key={index}
                elevation={1}
                sx={{
                  mb: 2,
                  borderRadius: 2,
                  '&:before': { display: 'none' },
                  '&.Mui-expanded': {
                    boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.08)',
                  }
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMore />}
                  sx={{
                    borderRadius: 2,
                    '&.Mui-expanded': {
                      borderBottomLeftRadius: 0,
                      borderBottomRightRadius: 0,
                    }
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 500 }}>
                    {faq.question}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ pt: 0 }}>
                  <Typography variant="body1" sx={{ lineHeight: 1.6, color: 'text.secondary' }}>
                    {faq.answer}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        </Box>
      </Container>
      <Footer />
    </>
  );
};

export default HowItWorksPage;