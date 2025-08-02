import React from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Stack,
  Paper
} from '@mui/material';
import {
  SearchOff,
  Home,
  ArrowBack
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <>
      <Container maxWidth="md" sx={{ py: 12 }}>
        <Paper
          elevation={1}
          sx={{
            p: 8,
            textAlign: 'center',
            borderRadius: 4,
            backgroundColor: 'grey.50'
          }}
        >
          {/* 404 Icon */}
          <Box sx={{ mb: 4 }}>
            <SearchOff
              sx={{
                fontSize: '8rem',
                color: 'primary.main',
                opacity: 0.6
              }}
            />
          </Box>

          {/* 404 Text */}
          <Typography
            variant="h1"
            sx={{
              fontWeight: 700,
              fontSize: '4rem',
              mb: 2,
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            404
          </Typography>

          {/* Error Message */}
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 2 }}>
            Page Not Found
          </Typography>
          
          <Typography
            variant="h6"
            sx={{ color: 'text.secondary', mb: 6, maxWidth: '500px', mx: 'auto', lineHeight: 1.6 }}
          >
            Sorry, the page you're looking for doesn't exist. It might have been moved, deleted, or you entered the wrong URL.
          </Typography>

          {/* Action Buttons */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            justifyContent="center"
            sx={{ mb: 4 }}
          >
            <Button
              onClick={() => navigate(-1)}
              variant="outlined"
              startIcon={<ArrowBack />}
              size="large"
              sx={{
                borderRadius: 2,
                px: 4,
                py: 1.5,
                textTransform: 'none',
                fontWeight: 600
              }}
            >
              Go Back
            </Button>
            
            <Button
              component={RouterLink}
              to="/"
              variant="contained"
              startIcon={<Home />}
              size="large"
              sx={{
                borderRadius: 2,
                px: 4,
                py: 1.5,
                textTransform: 'none',
                fontWeight: 600,
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #4338ca 0%, #7c3aed 100%)',
                }
              }}
            >
              Go Home
            </Button>
          </Stack>

          {/* Helpful Links */}
          <Box sx={{ borderTop: 1, borderColor: 'divider', pt: 4 }}>
            <Typography variant="body1" sx={{ mb: 3, fontWeight: 500 }}>
              Here are some helpful links:
            </Typography>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={3}
              justifyContent="center"
            >
              <Button
                component={RouterLink}
                to="/categories"
                color="primary"
                sx={{ textTransform: 'none' }}
              >
                Browse Categories
              </Button>
              <Button
                component={RouterLink}
                to="/how-it-works"
                color="primary"
                sx={{ textTransform: 'none' }}
              >
                How It Works
              </Button>
              <Button
                component={RouterLink}
                to="/contact"
                color="primary"
                sx={{ textTransform: 'none' }}
              >
                Contact Support
              </Button>
              <Button
                component={RouterLink}
                to="/help"
                color="primary"
                sx={{ textTransform: 'none' }}
              >
                Help Center
              </Button>
            </Stack>
          </Box>
        </Paper>
      </Container>
      <Footer />
    </>
  );
};

export default NotFoundPage;