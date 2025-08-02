import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Avatar,
  Rating,
  Stack,
  Card,
  CardContent,
  Chip
} from '@mui/material';
import { FormatQuote, Verified } from '@mui/icons-material';

const TestimonialsSection = () => {
  const testimonials = [
    {
      id: 1,
      name: "Priya Sharma",
      role: "Wedding Photographer",
      location: "Mumbai",
      avatar: "P",
      rating: 5,
      content: "BorrowHub saved my wedding photography business! I was able to rent a Canon R5 for a fraction of the buying cost. The owner was super helpful and the camera was in perfect condition.",
      itemRented: "Canon EOS R5 Camera",
      verified: true
    },
    {
      id: 2,
      name: "Raj Patel",
      role: "Content Creator",
      location: "Delhi",
      avatar: "R",
      rating: 5,
      content: "Amazing platform! I needed a drone for my travel vlog and found exactly what I was looking for. The booking process was smooth and the owner even gave me some flying tips.",
      itemRented: "DJI Mavic Air 2",
      verified: true
    },
    {
      id: 3,
      name: "Sneha Reddy",
      role: "Freelance Designer",
      location: "Bangalore",
      avatar: "S",
      rating: 4,
      content: "I needed a MacBook Pro for a client project and BorrowHub was a lifesaver. Much more affordable than buying, and the laptop was exactly as described. Will definitely use again!",
      itemRented: "MacBook Pro 16-inch",
      verified: false
    },
    {
      id: 4,
      name: "Arjun Singh",
      role: "Adventure Enthusiast",
      location: "Goa",
      avatar: "A",
      rating: 5,
      content: "Rented a GoPro for my Goa trip and it was perfect! The camera quality was excellent and the waterproof housing worked great for underwater shots. Highly recommend!",
      itemRented: "GoPro Hero 11",
      verified: true
    },
    {
      id: 5,
      name: "Meera Gupta",
      role: "Event Organizer",
      location: "Pune",
      avatar: "M",
      rating: 5,
      content: "BorrowHub helped me organize a successful corporate event. I rented professional audio equipment and the sound quality was exceptional. The owners were very professional.",
      itemRented: "Professional Audio Setup",
      verified: true
    },
    {
      id: 6,
      name: "Vikram Malhotra",
      role: "Startup Founder",
      location: "Hyderabad",
      avatar: "V",
      rating: 4,
      content: "Great concept and execution! As a startup, we couldn't afford to buy expensive equipment. BorrowHub allowed us to access what we needed without breaking the bank.",
      itemRented: "Professional Projector",
      verified: false
    }
  ];

  const stats = [
    { label: "Happy Customers", value: "10,000+", color: "primary" },
    { label: "5-Star Reviews", value: "95%", color: "success" },
    { label: "Successful Rentals", value: "50,000+", color: "info" },
    { label: "Cities Covered", value: "25+", color: "warning" }
  ];

  return (
    <Box sx={{ py: 8, backgroundColor: 'grey.50' }}>
      <Container maxWidth="xl">
        <Stack spacing={6}>
          {/* Header */}
          <Box textAlign="center">
            <Chip
              label="TESTIMONIALS"
              sx={{
                backgroundColor: 'primary.main',
                color: 'white',
                fontWeight: 600,
                mb: 2
              }}
            />
            <Typography
              variant="h3"
              sx={{ fontWeight: 700, mb: 2 }}
            >
              What Our Customers Say
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ maxWidth: 600, mx: 'auto' }}
            >
              Join thousands of satisfied customers who trust BorrowHub for their rental needs
            </Typography>
          </Box>

          {/* Stats */}
          <Grid container spacing={3}>
            {stats.map((stat, index) => (
              <Grid item xs={6} md={3} key={index}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    textAlign: 'center',
                    backgroundColor: 'white',
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'divider',
                    height: '100%'
                  }}
                >
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 700,
                      color: `${stat.color}.main`,
                      mb: 1
                    }}
                  >
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {stat.label}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>

          {/* Testimonials Grid */}
          <Grid container spacing={4}>
            {testimonials.map((testimonial) => (
              <Grid item xs={12} md={6} lg={4} key={testimonial.id}>
                <Card
                  elevation={0}
                  sx={{
                    height: '100%',
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'divider',
                    backgroundColor: 'white',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0px 10px 15px rgba(0, 0, 0, 0.1), 0px 4px 6px rgba(0, 0, 0, 0.05)',
                    }
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Stack spacing={2}>
                      {/* Quote Icon */}
                      <Box>
                        <FormatQuote
                          sx={{
                            fontSize: '2rem',
                            color: 'primary.main',
                            opacity: 0.3
                          }}
                        />
                      </Box>

                      {/* Review Content */}
                      <Typography
                        variant="body1"
                        sx={{
                          lineHeight: 1.6,
                          fontStyle: 'italic',
                          color: 'text.primary'
                        }}
                      >
                        "{testimonial.content}"
                      </Typography>

                      {/* Rating */}
                      <Rating
                        value={testimonial.rating}
                        readOnly
                        size="small"
                        sx={{
                          '& .MuiRating-iconFilled': {
                            color: '#fbbf24',
                          }
                        }}
                      />

                      {/* Item Rented */}
                      <Chip
                        label={`Rented: ${testimonial.itemRented}`}
                        size="small"
                        variant="outlined"
                        sx={{
                          alignSelf: 'flex-start',
                          fontSize: '0.75rem',
                          borderColor: 'primary.main',
                          color: 'primary.main'
                        }}
                      />

                      {/* Customer Info */}
                      <Stack direction="row" alignItems="center" spacing={2} sx={{ mt: 'auto' }}>
                        <Avatar
                          sx={{
                            width: 48,
                            height: 48,
                            backgroundColor: 'primary.main',
                            color: 'white',
                            fontWeight: 600
                          }}
                        >
                          {testimonial.avatar}
                        </Avatar>
                        <Box sx={{ flexGrow: 1 }}>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {testimonial.name}
                            </Typography>
                            {testimonial.verified && (
                              <Verified sx={{ fontSize: '1rem', color: 'success.main' }} />
                            )}
                          </Stack>
                          <Typography variant="body2" color="text.secondary">
                            {testimonial.role}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                            📍 {testimonial.location}
                          </Typography>
                        </Box>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* CTA */}
          <Box textAlign="center" sx={{ pt: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
              Ready to Join Our Happy Customers?
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Start renting today and experience the convenience of BorrowHub
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  backgroundColor: 'success.main',
                  color: 'white',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                  }
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  🛡️ Safe & Secure
                </Typography>
                <Typography variant="body2">
                  All transactions protected
                </Typography>
              </Paper>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  backgroundColor: 'primary.main',
                  color: 'white',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                  }
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  🚀 Quick Setup
                </Typography>
                <Typography variant="body2">
                  List items in 5 minutes
                </Typography>
              </Paper>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  backgroundColor: 'warning.main',
                  color: 'white',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                  }
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  💰 Great Prices
                </Typography>
                <Typography variant="body2">
                  Save up to 80% vs buying
                </Typography>
              </Paper>
            </Stack>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
};

export default TestimonialsSection;