import React from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Paper,
  Stack,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Button,
  Divider
} from '@mui/material';
import {
  Security,
  VerifiedUser,
  Shield,
  Warning,
  CheckCircle,
  Report,
  LocalPolice,
  Phone,
  Email,
  Camera,
  Lock,
  Groups
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import Footer from '../components/Footer';

const SafetyPage = () => {
  const safetyFeatures = [
    {
      title: 'Identity Verification',
      description: 'All users undergo mandatory identity verification with government-issued IDs.',
      icon: <VerifiedUser />,
      color: 'primary'
    },
    {
      title: 'Secure Payments',
      description: 'All payments are processed securely through encrypted channels with escrow protection.',
      icon: <Lock />,
      color: 'success'
    },
    {
      title: 'Insurance Coverage',
      description: 'Comprehensive insurance covers all rentals against damage, theft, and accidents.',
      icon: <Shield />,
      color: 'info'
    },
    {
      title: '24/7 Support',
      description: 'Round-the-clock customer support and emergency assistance for urgent situations.',
      icon: <Phone />,
      color: 'warning'
    }
  ];

  const renterSafetyTips = [
    {
      category: 'Before Booking',
      tips: [
        'Check the owner\'s profile, ratings, and reviews carefully',
        'Verify item photos match the description and look authentic',
        'Read the rental terms and conditions thoroughly',
        'Confirm pickup/delivery location is safe and convenient',
        'Ask questions about item condition and usage instructions'
      ]
    },
    {
      category: 'During Pickup',
      tips: [
        'Meet in well-lit, public places when possible',
        'Bring a friend or inform someone about your whereabouts',
        'Inspect the item thoroughly before taking possession',
        'Take photos/videos of the item condition as evidence',
        'Test electronic items to ensure they work properly',
        'Report any discrepancies immediately through the app'
      ]
    },
    {
      category: 'During Rental',
      tips: [
        'Use items only as intended and described',
        'Store items securely to prevent theft or damage',
        'Report any issues or accidents immediately',
        'Keep rental receipt and documentation safe',
        'Don\'t lend the item to others without owner permission'
      ]
    },
    {
      category: 'Return Process',
      tips: [
        'Clean and return items in the condition received',
        'Meet at the agreed location and time',
        'Document the return with photos if needed',
        'Get confirmation from the owner about item condition',
        'Leave honest reviews to help the community'
      ]
    }
  ];

  const ownerSafetyTips = [
    {
      category: 'Listing Items',
      tips: [
        'Take clear, honest photos showing item condition',
        'Write detailed, accurate descriptions',
        'Set fair prices based on item value and condition',
        'Specify usage restrictions and care instructions',
        'Don\'t list prohibited or dangerous items'
      ]
    },
    {
      category: 'Screening Renters',
      tips: [
        'Check renter profiles, reviews, and verification status',
        'Communicate through the platform messaging system',
        'Ask relevant questions about intended use',
        'Trust your instincts - decline suspicious requests',
        'Require security deposits for high-value items'
      ]
    },
    {
      category: 'Handover Process',
      tips: [
        'Meet in safe, convenient locations',
        'Demonstrate item usage and safety features',
        'Document item condition with photos/videos',
        'Provide care instructions and emergency contacts',
        'Confirm renter understands usage requirements'
      ]
    },
    {
      category: 'During Rental',
      tips: [
        'Stay accessible for questions or emergencies',
        'Monitor rental progress through regular check-ins',
        'Respond promptly to renter communications',
        'Report any issues to BorrowHub immediately',
        'Maintain insurance documentation'
      ]
    }
  ];

  const prohibitedItems = [
    'Weapons, firearms, or dangerous objects',
    'Illegal drugs or controlled substances',
    'Stolen or counterfeit goods',
    'Live animals or pets',
    'Perishable food items',
    'Hazardous chemicals or materials',
    'Adult content or services',
    'Personal hygiene items',
    'Medical devices requiring prescription',
    'Items with safety recalls'
  ];

  const emergencyContacts = [
    {
      type: 'Safety Emergency',
      number: '+91 9999-111-222',
      description: 'For immediate safety concerns or threats',
      available: '24/7'
    },
    {
      type: 'Technical Support',
      number: '+91 9999-888-777',
      description: 'For app issues or technical problems',
      available: '9 AM - 7 PM'
    },
    {
      type: 'General Support',
      email: 'support@borrowhub.com',
      description: 'For general inquiries and assistance',
      available: 'Response within 24 hours'
    }
  ];

  return (
    <>
      <Container maxWidth="lg" sx={{ py: 8 }}>
        {/* Header */}
        <Box textAlign="center" sx={{ mb: 8 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <Security sx={{ fontSize: '4rem', color: 'primary.main' }} />
          </Box>
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
            Safety Guidelines
          </Typography>
          <Typography
            variant="h5"
            sx={{ color: 'text.secondary', mb: 4, maxWidth: '600px', mx: 'auto', lineHeight: 1.6 }}
          >
            Your safety is our top priority. Learn how to stay safe while renting and lending on BorrowHub.
          </Typography>
        </Box>

        {/* Safety Features */}
        <Box sx={{ mb: 10 }}>
          <Typography variant="h3" sx={{ fontWeight: 600, mb: 6, textAlign: 'center' }}>
            How We Keep You Safe
          </Typography>
          <Grid container spacing={4}>
            {safetyFeatures.map((feature, index) => (
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
                    <Box sx={{ color: `${feature.color}.main`, mb: 3, fontSize: '3rem' }}>
                      {feature.icon}
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Safety Alert */}
        <Alert 
          severity="warning" 
          icon={<Warning />}
          sx={{ mb: 8, borderRadius: 3, p: 3 }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            Safety First!
          </Typography>
          <Typography variant="body1">
            Always prioritize your personal safety. If something feels wrong or unsafe, 
            trust your instincts and contact our safety team immediately. Report any 
            suspicious behavior or safety concerns through our platform.
          </Typography>
        </Alert>

        {/* Safety Tips for Renters */}
        <Box sx={{ mb: 10 }}>
          <Typography variant="h3" sx={{ fontWeight: 600, mb: 6, textAlign: 'center' }}>
            Safety Tips for Renters
          </Typography>
          <Grid container spacing={4}>
            {renterSafetyTips.map((section, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Paper elevation={2} sx={{ p: 4, borderRadius: 3, height: '100%' }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: 'primary.main' }}>
                    {section.category}
                  </Typography>
                  <List dense>
                    {section.tips.map((tip, tipIndex) => (
                      <ListItem key={tipIndex} sx={{ px: 0 }}>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <CheckCircle sx={{ color: 'success.main', fontSize: '1.2rem' }} />
                        </ListItemIcon>
                        <ListItemText 
                          primary={tip}
                          primaryTypographyProps={{ variant: 'body2', lineHeight: 1.6 }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Safety Tips for Owners */}
        <Box sx={{ mb: 10 }}>
          <Typography variant="h3" sx={{ fontWeight: 600, mb: 6, textAlign: 'center' }}>
            Safety Tips for Owners
          </Typography>
          <Grid container spacing={4}>
            {ownerSafetyTips.map((section, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Paper elevation={2} sx={{ p: 4, borderRadius: 3, height: '100%' }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: 'success.main' }}>
                    {section.category}
                  </Typography>
                  <List dense>
                    {section.tips.map((tip, tipIndex) => (
                      <ListItem key={tipIndex} sx={{ px: 0 }}>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <CheckCircle sx={{ color: 'success.main', fontSize: '1.2rem' }} />
                        </ListItemIcon>
                        <ListItemText 
                          primary={tip}
                          primaryTypographyProps={{ variant: 'body2', lineHeight: 1.6 }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Prohibited Items */}
        <Box sx={{ mb: 10 }}>
          <Typography variant="h3" sx={{ fontWeight: 600, mb: 4, textAlign: 'center' }}>
            Prohibited Items
          </Typography>
          <Paper elevation={1} sx={{ p: 4, borderRadius: 3, backgroundColor: 'error.50' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Warning sx={{ color: 'error.main', mr: 2, fontSize: '2rem' }} />
              <Typography variant="h6" sx={{ fontWeight: 600, color: 'error.main' }}>
                Items NOT allowed on BorrowHub
              </Typography>
            </Box>
            <Grid container spacing={2}>
              {prohibitedItems.map((item, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Chip
                    label={item}
                    color="error"
                    variant="outlined"
                    sx={{ width: '100%', justifyContent: 'flex-start', p: 2, height: 'auto' }}
                  />
                </Grid>
              ))}
            </Grid>
            <Typography variant="body2" sx={{ mt: 3, color: 'text.secondary' }}>
              Listing prohibited items will result in immediate account suspension. 
              When in doubt, contact our support team before listing.
            </Typography>
          </Paper>
        </Box>

        {/* Reporting Safety Issues */}
        <Box sx={{ mb: 10 }}>
          <Typography variant="h3" sx={{ fontWeight: 600, mb: 6, textAlign: 'center' }}>
            Report Safety Concerns
          </Typography>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 4, borderRadius: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Report sx={{ color: 'error.main', mr: 2, fontSize: '2rem' }} />
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    How to Report
                  </Typography>
                </Box>
                <List>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      <CheckCircle sx={{ color: 'primary.main' }} />
                    </ListItemIcon>
                    <ListItemText primary="Use the 'Report' button on any user profile or listing" />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      <CheckCircle sx={{ color: 'primary.main' }} />
                    </ListItemIcon>
                    <ListItemText primary="Contact our safety team directly via phone or email" />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      <CheckCircle sx={{ color: 'primary.main' }} />
                    </ListItemIcon>
                    <ListItemText primary="Provide detailed information and evidence if available" />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      <CheckCircle sx={{ color: 'primary.main' }} />
                    </ListItemIcon>
                    <ListItemText primary="Our team will investigate and take appropriate action" />
                  </ListItem>
                </List>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 4, borderRadius: 3, textAlign: 'center' }}>
                <LocalPolice sx={{ color: 'primary.main', fontSize: '4rem', mb: 3 }} />
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Law Enforcement Cooperation
                </Typography>
                <Typography variant="body1" sx={{ lineHeight: 1.6, mb: 3 }}>
                  We work closely with local law enforcement agencies to ensure user safety 
                  and investigate serious incidents. All reports are taken seriously and 
                  handled with appropriate urgency.
                </Typography>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<Report />}
                  sx={{ borderRadius: 2 }}
                >
                  Report Safety Issue
                </Button>
              </Paper>
            </Grid>
          </Grid>
        </Box>

        {/* Emergency Contacts */}
        <Box sx={{ mb: 8 }}>
          <Typography variant="h3" sx={{ fontWeight: 600, mb: 6, textAlign: 'center' }}>
            Emergency Contacts
          </Typography>
          <Grid container spacing={4}>
            {emergencyContacts.map((contact, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card 
                  elevation={2} 
                  sx={{ 
                    height: '100%', 
                    borderRadius: 3, 
                    textAlign: 'center',
                    backgroundColor: index === 0 ? 'error.50' : 'background.paper'
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{ 
                      color: index === 0 ? 'error.main' : 'primary.main', 
                      mb: 3, 
                      fontSize: '3rem' 
                    }}>
                      {contact.number ? <Phone /> : <Email />}
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                      {contact.type}
                    </Typography>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        color: index === 0 ? 'error.main' : 'primary.main', 
                        fontWeight: 700, 
                        mb: 2 
                      }}
                    >
                      {contact.number || contact.email}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.6 }}>
                      {contact.description}
                    </Typography>
                    <Chip
                      label={contact.available}
                      color={index === 0 ? 'error' : 'primary'}
                      variant="outlined"
                      size="small"
                    />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Community Guidelines */}
        <Paper elevation={1} sx={{ p: 6, borderRadius: 3, backgroundColor: 'primary.50' }}>
          <Box textAlign="center">
            <Groups sx={{ color: 'primary.main', fontSize: '4rem', mb: 3 }} />
            <Typography variant="h4" sx={{ fontWeight: 600, mb: 3 }}>
              Building a Safe Community Together
            </Typography>
            <Typography variant="body1" sx={{ lineHeight: 1.7, mb: 4, maxWidth: '800px', mx: 'auto' }}>
              Safety is a shared responsibility. By following these guidelines, communicating openly, 
              and looking out for each other, we can create a trusted community where everyone feels 
              secure while renting and lending.
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
              <Button
                component={RouterLink}
                to="/trust"
                variant="contained"
                size="large"
                sx={{ borderRadius: 2, px: 4 }}
              >
                Trust & Safety Policies
              </Button>
              <Button
                component={RouterLink}
                to="/contact"
                variant="outlined"
                size="large"
                sx={{ borderRadius: 2, px: 4 }}
              >
                Contact Safety Team
              </Button>
            </Stack>
          </Box>
        </Paper>
      </Container>
      <Footer />
    </>
  );
};

export default SafetyPage;