import React from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Avatar,
  Stack,
  Chip
} from '@mui/material';
import {
  People,
  Visibility,
  FavoriteOutlined,
  TrendingUp
} from '@mui/icons-material';

const AboutUsPage = () => {
  const teamMembers = [
    {
      name: "Anurag Dadhich",
      role: "Founder & CEO",
      avatar: "AD",
      description: "Passionate about creating sustainable sharing economy solutions."
    },
    {
      name: "Tech Team",
      role: "Development",
      avatar: "TT",
      description: "Building innovative rental marketplace technology."
    }
  ];

  const values = [
    {
      icon: <People />,
      title: "Community First",
      description: "Building connections between people through sharing"
    },
    {
      icon: <FavoriteOutlined />,
      title: "Trust & Safety",
      description: "Ensuring secure and reliable rental experiences"
    },
    {
      icon: <Visibility />,
      title: "Transparency",
      description: "Clear pricing and honest communication"
    },
    {
      icon: <TrendingUp />,
      title: "Innovation",
      description: "Continuously improving our platform"
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      {/* Hero Section */}
      <Box textAlign="center" sx={{ mb: 8 }}>
        <Typography variant="h2" sx={{ fontWeight: 700, mb: 3 }}>
          About BorrowHub
        </Typography>
        <Typography variant="h5" color="text.secondary" sx={{ maxWidth: 800, mx: 'auto', lineHeight: 1.6 }}>
          India's most trusted rental marketplace, connecting people through sharing. 
          We believe in making quality items accessible to everyone while promoting sustainable consumption.
        </Typography>
      </Box>

      {/* Mission Section */}
      <Paper elevation={0} sx={{ p: 6, mb: 8, backgroundColor: 'grey.50', borderRadius: 3 }}>
        <Typography variant="h3" sx={{ fontWeight: 700, mb: 3, textAlign: 'center' }}>
          Our Mission
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ textAlign: 'center', lineHeight: 1.8 }}>
          To create a world where access matters more than ownership. We're building a platform that 
          enables people to share resources, reduce waste, and build stronger communities through the 
          power of collaborative consumption.
        </Typography>
      </Paper>

      {/* Values Section */}
      <Box sx={{ mb: 8 }}>
        <Typography variant="h3" sx={{ fontWeight: 700, mb: 6, textAlign: 'center' }}>
          Our Values
        </Typography>
        <Grid container spacing={4}>
          {values.map((value, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  height: '100%',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 3,
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    borderColor: 'primary.main',
                    transform: 'translateY(-4px)',
                    boxShadow: '0px 10px 15px rgba(0, 0, 0, 0.1)',
                  }
                }}
              >
                <Box sx={{ color: 'primary.main', mb: 2 }}>
                  {value.icon}
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                  {value.title}
                </Typography>
                <Typography color="text.secondary">
                  {value.description}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Team Section */}
      <Box sx={{ mb: 8 }}>
        <Typography variant="h3" sx={{ fontWeight: 700, mb: 6, textAlign: 'center' }}>
          Meet Our Team
        </Typography>
        <Grid container spacing={4} justifyContent="center">
          {teamMembers.map((member, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  textAlign: 'center',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 3,
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    borderColor: 'primary.main',
                    transform: 'translateY(-4px)',
                    boxShadow: '0px 10px 15px rgba(0, 0, 0, 0.1)',
                  }
                }}
              >
                <Avatar 
                  sx={{ 
                    width: 80, 
                    height: 80, 
                    mx: 'auto', 
                    mb: 2,
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    fontSize: '2rem',
                    fontWeight: 'bold'
                  }}
                >
                  {member.avatar}
                </Avatar>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  {member.name}
                </Typography>
                <Chip 
                  label={member.role} 
                  variant="outlined" 
                  sx={{ mb: 2 }}
                />
                <Typography color="text.secondary">
                  {member.description}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Stats Section */}
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
        <Typography variant="h3" sx={{ fontWeight: 700, mb: 4 }}>
          Making an Impact
        </Typography>
        <Grid container spacing={4}>
          <Grid item xs={6} md={3}>
            <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
              10K+
            </Typography>
            <Typography variant="body1">
              Happy Users
            </Typography>
          </Grid>
          <Grid item xs={6} md={3}>
            <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
              50K+
            </Typography>
            <Typography variant="body1">
              Items Listed
            </Typography>
          </Grid>
          <Grid item xs={6} md={3}>
            <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
              25+
            </Typography>
            <Typography variant="body1">
              Cities
            </Typography>
          </Grid>
          <Grid item xs={6} md={3}>
            <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
              ₹1Cr+
            </Typography>
            <Typography variant="body1">
              Transactions
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default AboutUsPage;