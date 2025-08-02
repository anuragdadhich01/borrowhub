import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Stack,
  Chip,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import {
  Search,
  ExpandMore,
  Help,
  QuestionAnswer,
  Book,
  SupportAgent,
  Payment,
  Security,
  Storefront,
  LocalShipping,
  Star,
  Phone,
  Email,
  Chat
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import Footer from '../components/Footer';

const HelpCenterPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All Topics', icon: <Help />, count: 25 },
    { id: 'getting-started', name: 'Getting Started', icon: <Book />, count: 8 },
    { id: 'booking', name: 'Booking & Rentals', icon: <Storefront />, count: 6 },
    { id: 'payments', name: 'Payments & Fees', icon: <Payment />, count: 5 },
    { id: 'safety', name: 'Safety & Security', icon: <Security />, count: 4 },
    { id: 'delivery', name: 'Delivery & Pickup', icon: <LocalShipping />, count: 2 }
  ];

  const faqs = [
    {
      category: 'getting-started',
      question: 'How do I create an account on BorrowHub?',
      answer: 'Creating an account is simple! Click the "Sign Up" button in the top right corner, enter your email, create a password, and verify your email address. You can also sign up using your Google or Facebook account for faster registration.'
    },
    {
      category: 'getting-started',
      question: 'How do I verify my identity?',
      answer: 'For security, all users must verify their identity. Go to your profile settings, upload a clear photo of your government-issued ID (Aadhaar, Driver\'s License, or Passport), and take a selfie. Verification typically takes 24-48 hours.'
    },
    {
      category: 'getting-started',
      question: 'What can I rent on BorrowHub?',
      answer: 'You can rent a wide variety of items including cameras, electronics, tools, sports equipment, musical instruments, and more. Browse our categories to see what\'s available in your area. Items must be legal to own and in good working condition.'
    },
    {
      category: 'booking',
      question: 'How do I book an item?',
      answer: 'Find the item you want to rent, select your dates, and click "Book Now". You can message the owner to discuss details before confirming. Once approved, complete the payment to secure your booking.'
    },
    {
      category: 'booking',
      question: 'Can I modify or cancel my booking?',
      answer: 'Yes! You can modify dates or cancel bookings according to our cancellation policy. Free cancellation is available up to 24 hours before pickup. Cancellations made later may incur fees depending on the item\'s cancellation policy.'
    },
    {
      category: 'booking',
      question: 'What if the item is not as described?',
      answer: 'If the item doesn\'t match the description or photos, contact us immediately. We offer full refunds for significantly misrepresented items. Take photos as evidence and report the issue within 2 hours of pickup.'
    },
    {
      category: 'payments',
      question: 'How do payments work?',
      answer: 'We use secure escrow payments. Your money is held safely until you receive the item. Owners are paid after successful item handover. We accept credit/debit cards, UPI, net banking, and digital wallets.'
    },
    {
      category: 'payments',
      question: 'What fees does BorrowHub charge?',
      answer: 'Renters pay a 5% service fee on the rental amount. Owners pay a 3% fee on earnings. Payment processing fees may apply. All fees are clearly shown before you complete any transaction.'
    },
    {
      category: 'payments',
      question: 'When will I receive my refund?',
      answer: 'Refunds are processed immediately upon approval. It typically takes 3-7 business days for the amount to reflect in your account, depending on your bank or payment method.'
    },
    {
      category: 'safety',
      question: 'How does BorrowHub ensure safety?',
      answer: 'All users undergo identity verification. We provide comprehensive insurance coverage for all rentals. Our 24/7 support team monitors transactions and resolves disputes. We also have community guidelines and safety features built into our platform.'
    },
    {
      category: 'safety',
      question: 'What if an item gets damaged?',
      answer: 'All rentals are covered by our insurance policy. Report any damage immediately with photos. We handle the claims process and ensure fair resolution for both parties. Minor wear and tear is expected and covered.'
    },
    {
      category: 'safety',
      question: 'How do I report a safety concern?',
      answer: 'Report any safety concerns immediately through our app or website. Use the "Report" button on user profiles or listings, or contact our safety team directly at safety@borrowhub.com or +91 9999-111-222 for urgent issues.'
    },
    {
      category: 'delivery',
      question: 'How does delivery and pickup work?',
      answer: 'You can choose doorstep delivery or self-pickup when booking. For delivery, coordinate with the owner for convenient timing. Ensure someone is available to receive the item and inspect its condition upon delivery.'
    },
    {
      category: 'delivery',
      question: 'What if nobody is available for delivery?',
      answer: 'Coordinate with the owner to reschedule delivery. Some owners may offer secure drop-off options. If you miss multiple delivery attempts, additional fees may apply. Always communicate your availability clearly.'
    }
  ];

  const quickActions = [
    {
      title: 'Start a New Booking',
      description: 'Browse items and make your first rental',
      icon: <Storefront />,
      link: '/categories',
      color: 'primary'
    },
    {
      title: 'List Your Item',
      description: 'Earn money by renting out your items',
      icon: <LocalShipping />,
      link: '/add-item',
      color: 'success'
    },
    {
      title: 'Contact Support',
      description: 'Get help from our support team',
      icon: <SupportAgent />,
      link: '/contact',
      color: 'info'
    },
    {
      title: 'Safety Guidelines',
      description: 'Learn about staying safe on BorrowHub',
      icon: <Security />,
      link: '/safety',
      color: 'warning'
    }
  ];

  const contactOptions = [
    {
      title: 'Live Chat',
      description: 'Chat with our support team in real-time',
      icon: <Chat />,
      availability: 'Available 9 AM - 7 PM',
      action: 'Start Chat'
    },
    {
      title: 'Phone Support',
      description: 'Call us for immediate assistance',
      icon: <Phone />,
      availability: '+91 9999-888-777',
      action: 'Call Now'
    },
    {
      title: 'Email Support',
      description: 'Send us a detailed message',
      icon: <Email />,
      availability: 'Response within 24 hours',
      action: 'Send Email'
    }
  ];

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <>
      <Container maxWidth="lg" sx={{ py: 8 }}>
        {/* Header */}
        <Box textAlign="center" sx={{ mb: 8 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <QuestionAnswer sx={{ fontSize: '4rem', color: 'primary.main' }} />
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
            Help Center
          </Typography>
          <Typography
            variant="h5"
            sx={{ color: 'text.secondary', mb: 4, maxWidth: '600px', mx: 'auto', lineHeight: 1.6 }}
          >
            Find answers to common questions and get the help you need to make the most of BorrowHub.
          </Typography>

          {/* Search Bar */}
          <Box sx={{ maxWidth: '600px', mx: 'auto', mb: 6 }}>
            <TextField
              fullWidth
              placeholder="Search for help articles, FAQs, and guides..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  backgroundColor: 'white',
                  boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.05)',
                  fontSize: '1.1rem',
                  py: 1
                }
              }}
            />
          </Box>
        </Box>

        {/* Quick Actions */}
        <Box sx={{ mb: 8 }}>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 4, textAlign: 'center' }}>
            Quick Actions
          </Typography>
          <Grid container spacing={3}>
            {quickActions.map((action, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card
                  component={RouterLink}
                  to={action.link}
                  elevation={2}
                  sx={{
                    height: '100%',
                    textDecoration: 'none',
                    borderRadius: 3,
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.12)',
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  <CardContent sx={{ p: 4, textAlign: 'center' }}>
                    <Box sx={{ color: `${action.color}.main`, mb: 2, fontSize: '2.5rem' }}>
                      {action.icon}
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                      {action.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {action.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Grid container spacing={6}>
          {/* Categories Sidebar */}
          <Grid item xs={12} md={3}>
            <Paper elevation={1} sx={{ p: 3, borderRadius: 3, position: 'sticky', top: 24 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Help Topics
              </Typography>
              <List>
                {categories.map((category) => (
                  <ListItem
                    key={category.id}
                    button
                    selected={selectedCategory === category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    sx={{
                      borderRadius: 2,
                      mb: 1,
                      '&.Mui-selected': {
                        backgroundColor: 'primary.50',
                        '&:hover': {
                          backgroundColor: 'primary.100',
                        }
                      }
                    }}
                  >
                    <ListItemIcon sx={{ color: selectedCategory === category.id ? 'primary.main' : 'text.secondary' }}>
                      {category.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={category.name}
                      secondary={`${category.count} articles`}
                    />
                  </ListItem>
                ))}
              </List>

              <Divider sx={{ my: 3 }} />

              {/* Contact Support */}
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Still Need Help?
              </Typography>
              <Button
                component={RouterLink}
                to="/contact"
                variant="contained"
                fullWidth
                startIcon={<SupportAgent />}
                sx={{ borderRadius: 2, textTransform: 'none' }}
              >
                Contact Support
              </Button>
            </Paper>
          </Grid>

          {/* FAQ Content */}
          <Grid item xs={12} md={9}>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h4" sx={{ fontWeight: 600, mb: 2 }}>
                {selectedCategory === 'all' ? 'Frequently Asked Questions' : 
                 categories.find(c => c.id === selectedCategory)?.name}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {filteredFAQs.length} article{filteredFAQs.length !== 1 ? 's' : ''} found
              </Typography>
            </Box>

            {/* Category Chips */}
            {selectedCategory === 'all' && (
              <Box sx={{ mb: 4 }}>
                <Stack direction="row" flexWrap="wrap" gap={1}>
                  {categories.slice(1).map((category) => (
                    <Chip
                      key={category.id}
                      label={category.name}
                      onClick={() => setSelectedCategory(category.id)}
                      variant="outlined"
                      sx={{ borderRadius: 2 }}
                    />
                  ))}
                </Stack>
              </Box>
            )}

            {/* FAQ Accordions */}
            <Box>
              {filteredFAQs.map((faq, index) => (
                <Accordion
                  key={index}
                  elevation={1}
                  sx={{
                    mb: 2,
                    borderRadius: 3,
                    '&:before': { display: 'none' },
                    '&.Mui-expanded': {
                      boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.08)',
                    }
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMore />}
                    sx={{
                      borderRadius: 3,
                      px: 3,
                      py: 2,
                      '&.Mui-expanded': {
                        borderBottomLeftRadius: 0,
                        borderBottomRightRadius: 0,
                      }
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 500, pr: 2 }}>
                      {faq.question}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ px: 3, py: 2, pt: 0 }}>
                    <Typography variant="body1" sx={{ lineHeight: 1.7, color: 'text.secondary' }}>
                      {faq.answer}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              ))}

              {filteredFAQs.length === 0 && (
                <Box textAlign="center" sx={{ py: 8 }}>
                  <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                    No articles found
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                    Try adjusting your search terms or browse different categories.
                  </Typography>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCategory('all');
                    }}
                  >
                    Clear Filters
                  </Button>
                </Box>
              )}
            </Box>
          </Grid>
        </Grid>

        {/* Contact Support Section */}
        <Box sx={{ mt: 10, mb: 8 }}>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 4, textAlign: 'center' }}>
            Get Personal Support
          </Typography>
          <Grid container spacing={4}>
            {contactOptions.map((option, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card elevation={2} sx={{ height: '100%', borderRadius: 3, textAlign: 'center' }}>
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{ color: 'primary.main', mb: 3, fontSize: '3rem' }}>
                      {option.icon}
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                      {option.title}
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6 }}>
                      {option.description}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      {option.availability}
                    </Typography>
                    <Button
                      variant="outlined"
                      fullWidth
                      sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                    >
                      {option.action}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
      <Footer />
    </>
  );
};

export default HelpCenterPage;