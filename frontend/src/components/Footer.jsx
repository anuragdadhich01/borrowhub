import React from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  Stack,
  IconButton,
  Divider,
  Chip
} from '@mui/material';
import {
  Facebook,
  Twitter,
  Instagram,
  LinkedIn,
  YouTube,
  Email,
  Phone,
  LocationOn,
  Apple,
  Android
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';

const Footer = () => {
  const footerLinks = {
    company: [
      { label: 'About Us', href: '/about' },
      { label: 'How it Works', href: '/how-it-works' },
      { label: 'Careers', href: '/careers' },
      { label: 'Press', href: '/press' },
      { label: 'Blog', href: '/blog' }
    ],
    support: [
      { label: 'Help Center', href: '/help' },
      { label: 'Safety', href: '/safety' },
      { label: 'Contact Us', href: '/contact' },
      { label: 'Trust & Safety', href: '/trust' },
      { label: 'Insurance', href: '/insurance' }
    ],
    legal: [
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Cookie Policy', href: '/cookies' },
      { label: 'Rental Agreement', href: '/rental-agreement' },
      { label: 'Dispute Resolution', href: '/disputes' }
    ],
    categories: [
      { label: 'Cameras & Photography', href: '/category/cameras' },
      { label: 'Electronics', href: '/category/electronics' },
      { label: 'Tools & Equipment', href: '/category/tools' },
      { label: 'Sports & Outdoor', href: '/category/sports' },
      { label: 'Music & Audio', href: '/category/music' }
    ]
  };

  const socialLinks = [
    { icon: <Facebook />, href: 'https://facebook.com/borrowhub', label: 'Facebook' },
    { icon: <Twitter />, href: 'https://twitter.com/borrowhub', label: 'Twitter' },
    { icon: <Instagram />, href: 'https://instagram.com/borrowhub', label: 'Instagram' },
    { icon: <LinkedIn />, href: 'https://linkedin.com/company/borrowhub', label: 'LinkedIn' },
    { icon: <YouTube />, href: 'https://youtube.com/borrowhub', label: 'YouTube' }
  ];

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: 'grey.900',
        color: 'white',
        pt: 6,
        pb: 3
      }}
    >
      <Container maxWidth="xl">
        <Grid container spacing={4}>
          {/* Company Info */}
          <Grid item xs={12} md={4}>
            <Stack spacing={3}>
              {/* Logo */}
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 2,
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '1.5rem'
                  }}
                >
                  B
                </Box>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  BorrowHub
                </Typography>
              </Box>

              {/* Description */}
              <Typography variant="body1" sx={{ color: 'grey.300', lineHeight: 1.6 }}>
                India's most trusted rental marketplace. Rent anything, anytime, anywhere. 
                Join thousands of users who save money by renting instead of buying.
              </Typography>

              {/* Contact Info */}
              <Stack spacing={1}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Email sx={{ fontSize: '1.2rem', color: 'primary.light' }} />
                  <Typography variant="body2" sx={{ color: 'grey.300' }}>
                    support@borrowhub.com
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Phone sx={{ fontSize: '1.2rem', color: 'primary.light' }} />
                  <Typography variant="body2" sx={{ color: 'grey.300' }}>
                    +91 9999-888-777
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocationOn sx={{ fontSize: '1.2rem', color: 'primary.light' }} />
                  <Typography variant="body2" sx={{ color: 'grey.300' }}>
                    Mumbai, Delhi, Bangalore & 25+ cities
                  </Typography>
                </Box>
              </Stack>

              {/* Social Links */}
              <Stack direction="row" spacing={1}>
                {socialLinks.map((social, index) => (
                  <IconButton
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      color: 'grey.400',
                      '&:hover': {
                        color: 'primary.light',
                        transform: 'translateY(-2px)',
                      }
                    }}
                  >
                    {social.icon}
                  </IconButton>
                ))}
              </Stack>
            </Stack>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={12} md={8}>
            <Grid container spacing={4}>
              {/* Company */}
              <Grid item xs={6} md={3}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Company
                </Typography>
                <Stack spacing={1}>
                  {footerLinks.company.map((link, index) => (
                    <Link
                      key={index}
                      component={RouterLink}
                      to={link.href}
                      sx={{
                        color: 'grey.300',
                        textDecoration: 'none',
                        fontSize: '0.875rem',
                        '&:hover': {
                          color: 'primary.light',
                        }
                      }}
                    >
                      {link.label}
                    </Link>
                  ))}
                </Stack>
              </Grid>

              {/* Support */}
              <Grid item xs={6} md={3}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Support
                </Typography>
                <Stack spacing={1}>
                  {footerLinks.support.map((link, index) => (
                    <Link
                      key={index}
                      component={RouterLink}
                      to={link.href}
                      sx={{
                        color: 'grey.300',
                        textDecoration: 'none',
                        fontSize: '0.875rem',
                        '&:hover': {
                          color: 'primary.light',
                        }
                      }}
                    >
                      {link.label}
                    </Link>
                  ))}
                </Stack>
              </Grid>

              {/* Legal */}
              <Grid item xs={6} md={3}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Legal
                </Typography>
                <Stack spacing={1}>
                  {footerLinks.legal.map((link, index) => (
                    <Link
                      key={index}
                      component={RouterLink}
                      to={link.href}
                      sx={{
                        color: 'grey.300',
                        textDecoration: 'none',
                        fontSize: '0.875rem',
                        '&:hover': {
                          color: 'primary.light',
                        }
                      }}
                    >
                      {link.label}
                    </Link>
                  ))}
                </Stack>
              </Grid>

              {/* Categories */}
              <Grid item xs={6} md={3}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Categories
                </Typography>
                <Stack spacing={1}>
                  {footerLinks.categories.map((link, index) => (
                    <Link
                      key={index}
                      component={RouterLink}
                      to={link.href}
                      sx={{
                        color: 'grey.300',
                        textDecoration: 'none',
                        fontSize: '0.875rem',
                        '&:hover': {
                          color: 'primary.light',
                        }
                      }}
                    >
                      {link.label}
                    </Link>
                  ))}
                </Stack>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        {/* App Download Section */}
        <Box sx={{ mt: 6, mb: 4 }}>
          <Divider sx={{ borderColor: 'grey.700', mb: 4 }} />
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                Download Our Mobile App
              </Typography>
              <Typography variant="body2" sx={{ color: 'grey.300', mb: 3 }}>
                Get the BorrowHub app for the best rental experience on the go
              </Typography>
              <Stack direction="row" spacing={2}>
                <Chip
                  icon={<Apple />}
                  label="App Store"
                  clickable
                  sx={{
                    backgroundColor: 'grey.800',
                    color: 'white',
                    fontWeight: 500,
                    px: 2,
                    '&:hover': {
                      backgroundColor: 'grey.700',
                    }
                  }}
                />
                <Chip
                  icon={<Android />}
                  label="Google Play"
                  clickable
                  sx={{
                    backgroundColor: 'grey.800',
                    color: 'white',
                    fontWeight: 500,
                    px: 2,
                    '&:hover': {
                      backgroundColor: 'grey.700',
                    }
                  }}
                />
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Stack direction="row" spacing={3} justifyContent={{ xs: 'center', md: 'flex-end' }}>
                <Box textAlign="center">
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.light' }}>
                    4.8
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'grey.300' }}>
                    App Rating
                  </Typography>
                </Box>
                <Box textAlign="center">
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.light' }}>
                    100K+
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'grey.300' }}>
                    Downloads
                  </Typography>
                </Box>
                <Box textAlign="center">
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'warning.light' }}>
                    25+
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'grey.300' }}>
                    Cities
                  </Typography>
                </Box>
              </Stack>
            </Grid>
          </Grid>
        </Box>

        {/* Bottom Section */}
        <Divider sx={{ borderColor: 'grey.700', mb: 3 }} />
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="body2" sx={{ color: 'grey.400' }}>
              © 2024 BorrowHub Technologies Pvt. Ltd. All rights reserved.
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Stack
              direction="row"
              spacing={3}
              justifyContent={{ xs: 'center', md: 'flex-end' }}
              flexWrap="wrap"
            >
              <Typography variant="body2" sx={{ color: 'grey.400' }}>
                🇮🇳 Made in India
              </Typography>
              <Typography variant="body2" sx={{ color: 'grey.400' }}>
                🔒 SSL Secured
              </Typography>
              <Typography variant="body2" sx={{ color: 'grey.400' }}>
                🛡️ Trusted Platform
              </Typography>
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Footer;