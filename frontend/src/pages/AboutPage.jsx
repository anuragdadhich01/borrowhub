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
  Chip,
  Paper
} from '@mui/material';
import {
  Groups,
  TrendingUp,
  Security,
  EmojiObjects,
  Star,
  LocationOn
} from '@mui/icons-material';
import Footer from '../components/Footer';

const AboutPage = () => {
  const stats = [
    { label: 'Active Users', value: '50K+', icon: <Groups /> },
    { label: 'Items Listed', value: '100K+', icon: <TrendingUp /> },
    { label: 'Cities Covered', value: '25+', icon: <LocationOn /> },
    { label: 'Transactions', value: '500K+', icon: <Star /> }
  ];

  const values = [
    {
      title: 'Trust & Safety',
      description: 'We ensure every transaction is secure with verified users and comprehensive insurance coverage.',
      icon: <Security />
    },
    {
      title: 'Innovation',
      description: 'Leading the sharing economy revolution with cutting-edge technology and user-centric design.',
      icon: <EmojiObjects />
    },
    {
      title: 'Community',
      description: 'Building a sustainable community where sharing resources benefits everyone.',
      icon: <Groups />
    }
  ];

  const team = [
    {
      name: 'Anurag Dadhich',
      role: 'Founder & CEO',
      description: 'Passionate about creating sustainable solutions for the sharing economy.',
      avatar: 'A'
    },
    {
      name: 'Tech Team',
      role: 'Engineering',
      description: 'Building robust platforms that connect renters and owners seamlessly.',
      avatar: 'T'
    },
    {
      name: 'Operations Team',
      role: 'Operations',
      description: 'Ensuring smooth operations and excellent customer experience.',
      avatar: 'O'
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
            About BorrowHub
          </Typography>
          <Typography
            variant="h5"
            sx={{ color: 'text.secondary', mb: 4, maxWidth: '600px', mx: 'auto', lineHeight: 1.6 }}
          >
            India's most trusted rental marketplace, connecting people who need things with people who have them.
          </Typography>
        </Box>

        {/* Stats Section */}
        <Grid container spacing={3} sx={{ mb: 8 }}>
          {stats.map((stat, index) => (
            <Grid item xs={6} md={3} key={index}>
              <Paper
                elevation={2}
                sx={{
                  p: 3,
                  textAlign: 'center',
                  borderRadius: 2,
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.12)',
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                <Box sx={{ color: 'primary.main', mb: 2 }}>
                  {stat.icon}
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                  {stat.value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {stat.label}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Mission Section */}
        <Box sx={{ mb: 8 }}>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 4, textAlign: 'center' }}>
            Our Mission
          </Typography>
          <Paper elevation={1} sx={{ p: 6, borderRadius: 3, backgroundColor: 'grey.50' }}>
            <Typography
              variant="h6"
              sx={{ textAlign: 'center', lineHeight: 1.8, color: 'text.primary' }}
            >
              To democratize access to products and services by creating a trusted platform where 
              anyone can rent what they need, when they need it. We believe in the power of sharing 
              to reduce waste, save money, and build stronger communities across India.
            </Typography>
          </Paper>
        </Box>

        {/* Values Section */}
        <Box sx={{ mb: 8 }}>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 4, textAlign: 'center' }}>
            Our Values
          </Typography>
          <Grid container spacing={4}>
            {values.map((value, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card
                  elevation={2}
                  sx={{
                    height: '100%',
                    borderRadius: 2,
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.12)',
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  <CardContent sx={{ p: 4, textAlign: 'center' }}>
                    <Box sx={{ color: 'primary.main', mb: 3, fontSize: '3rem' }}>
                      {value.icon}
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                      {value.title}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                      {value.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Team Section */}
        <Box sx={{ mb: 8 }}>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 4, textAlign: 'center' }}>
            Our Team
          </Typography>
          <Grid container spacing={4}>
            {team.map((member, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card elevation={2} sx={{ borderRadius: 2, textAlign: 'center' }}>
                  <CardContent sx={{ p: 4 }}>
                    <Avatar
                      sx={{
                        width: 80,
                        height: 80,
                        mx: 'auto',
                        mb: 3,
                        backgroundColor: 'primary.main',
                        fontSize: '2rem',
                        fontWeight: 600
                      }}
                    >
                      {member.avatar}
                    </Avatar>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                      {member.name}
                    </Typography>
                    <Chip
                      label={member.role}
                      color="primary"
                      variant="outlined"
                      sx={{ mb: 2 }}
                    />
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                      {member.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Story Section */}
        <Box sx={{ mb: 8 }}>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 4, textAlign: 'center' }}>
            Our Story
          </Typography>
          <Paper elevation={1} sx={{ p: 6, borderRadius: 3 }}>
            <Typography variant="body1" sx={{ lineHeight: 1.8, mb: 3 }}>
              BorrowHub was founded with a simple yet powerful idea: why buy when you can borrow? 
              In a world where storage space is limited and most items are used infrequently, 
              we saw an opportunity to create a platform that would benefit both renters and owners.
            </Typography>
            <Typography variant="body1" sx={{ lineHeight: 1.8, mb: 3 }}>
              Starting from Mumbai, we've expanded to 25+ cities across India, facilitating over 
              500,000 successful transactions. Our platform has helped thousands of users save money 
              while promoting sustainable consumption patterns.
            </Typography>
            <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
              Today, BorrowHub is more than just a rental platform - we're building a community 
              of conscious consumers who believe in the power of sharing to create a better, 
              more sustainable future.
            </Typography>
          </Paper>
        </Box>
      </Container>
      <Footer />
    </>
  );
};

export default AboutPage;