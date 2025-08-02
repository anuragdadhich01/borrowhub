// frontend/src/App.jsx

import React, { Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import ErrorBoundary from './components/ErrorBoundary';
import { Box, Container, Typography, CircularProgress } from '@mui/material';

// Lazy load components for better performance
const HomePage = React.lazy(() => import('./pages/HomePage'));
const RegisterPage = React.lazy(() => import('./pages/RegisterPage'));
const LoginPage = React.lazy(() => import('./pages/LoginPage'));
const AddItemPage = React.lazy(() => import('./pages/AddItemPage'));
const ItemDetailsPage = React.lazy(() => import('./pages/ItemDetailsPage'));
const PaymentPage = React.lazy(() => import('./pages/PaymentPage'));
const ProfilePage = React.lazy(() => import('./pages/ProfilePage'));
const BookingsPage = React.lazy(() => import('./pages/BookingsPage'));
const ItemManagementPage = React.lazy(() => import('./pages/ItemManagementPage'));
const MessagesPage = React.lazy(() => import('./pages/MessagesPage'));
const AdminPage = React.lazy(() => import('./pages/AdminPage'));
const AboutUsPage = React.lazy(() => import('./pages/AboutUsPage'));
const HowItWorksPage = React.lazy(() => import('./pages/HowItWorksPage'));
const CategoryPage = React.lazy(() => import('./pages/CategoryPage'));
const AllItemsPage = React.lazy(() => import('./pages/AllItemsPage'));
const TermsOfServicePage = React.lazy(() => import('./pages/TermsOfServicePage'));

// Loading fallback component
const PageLoader = () => (
  <Box 
    sx={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '50vh',
      flexDirection: 'column',
      gap: 2
    }}
  >
    <CircularProgress size={40} />
    <Typography variant="body2" color="text.secondary">
      Loading...
    </Typography>
  </Box>
);

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Box sx={{ 
          minHeight: '100vh', 
          display: 'flex', 
          flexDirection: 'column',
          backgroundColor: 'background.default'
        }}>
          <Navbar />
          <Box component="main" sx={{ 
            flexGrow: 1,
            pt: { xs: 0, sm: 0 }, // Remove top padding on mobile since navbar is smaller
          }}>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                
                {/* Authentication Routes */}
                <Route path="/register" element={
                  <Container 
                    component="main" 
                    maxWidth="sm"
                    sx={{ 
                      mt: { xs: 2, sm: 4 }, 
                      mb: { xs: 2, sm: 4 },
                      px: { xs: 2, sm: 3 }
                    }}
                  >
                    <RegisterPage />
                  </Container>
                } />
                <Route path="/login" element={
                  <Container 
                    component="main" 
                    maxWidth="sm"
                    sx={{ 
                      mt: { xs: 2, sm: 4 }, 
                      mb: { xs: 2, sm: 4 },
                      px: { xs: 2, sm: 3 }
                    }}
                  >
                    <LoginPage />
                  </Container>
                } />

                {/* Public Item Routes */}
                <Route path="/items" element={<AllItemsPage />} />
                <Route path="/item/:id" element={
                  <Container 
                    component="main" 
                    sx={{ 
                      mt: { xs: 2, sm: 4 }, 
                      mb: { xs: 2, sm: 4 },
                      px: { xs: 2, sm: 3 }
                    }}
                  >
                    <ItemDetailsPage />
                  </Container>
                } />

                {/* Category Routes */}
                <Route path="/category/:category" element={<CategoryPage />} />

                {/* Company Pages */}
                <Route path="/about" element={<AboutUsPage />} />
                <Route path="/how-it-works" element={<HowItWorksPage />} />
                <Route path="/careers" element={
                  <Container 
                    component="main" 
                    sx={{ 
                      mt: { xs: 2, sm: 4 }, 
                      mb: { xs: 2, sm: 4 },
                      px: { xs: 2, sm: 3 }
                    }}
                  >
                    <PlaceholderPage title="Careers" description="Join our team and help build the future of sharing economy" />
                  </Container>
                } />
                <Route path="/press" element={
                  <Container 
                    component="main" 
                    sx={{ 
                      mt: { xs: 2, sm: 4 }, 
                      mb: { xs: 2, sm: 4 },
                      px: { xs: 2, sm: 3 }
                    }}
                  >
                    <PlaceholderPage title="Press" description="Latest news and press releases about BorrowHub" />
                  </Container>
                } />
                <Route path="/blog" element={
                  <Container 
                    component="main" 
                    sx={{ 
                      mt: { xs: 2, sm: 4 }, 
                      mb: { xs: 2, sm: 4 },
                      px: { xs: 2, sm: 3 }
                    }}
                  >
                    <PlaceholderPage title="Blog" description="Tips, stories, and insights from the BorrowHub community" />
                  </Container>
                } />

                {/* Support Pages */}
                <Route path="/help" element={
                  <Container 
                    component="main" 
                    sx={{ 
                      mt: { xs: 2, sm: 4 }, 
                      mb: { xs: 2, sm: 4 },
                      px: { xs: 2, sm: 3 }
                    }}
                  >
                    <PlaceholderPage title="Help Center" description="Find answers to frequently asked questions" />
                  </Container>
                } />
                <Route path="/safety" element={
                  <Container 
                    component="main" 
                    sx={{ 
                      mt: { xs: 2, sm: 4 }, 
                      mb: { xs: 2, sm: 4 },
                      px: { xs: 2, sm: 3 }
                    }}
                  >
                    <PlaceholderPage title="Safety" description="Learn about our safety measures and best practices" />
                  </Container>
                } />
                <Route path="/contact" element={
                  <Container 
                    component="main" 
                    sx={{ 
                      mt: { xs: 2, sm: 4 }, 
                      mb: { xs: 2, sm: 4 },
                      px: { xs: 2, sm: 3 }
                    }}
                  >
                    <PlaceholderPage title="Contact Us" description="Get in touch with our support team" />
                  </Container>
                } />
                <Route path="/trust" element={
                  <Container 
                    component="main" 
                    sx={{ 
                      mt: { xs: 2, sm: 4 }, 
                      mb: { xs: 2, sm: 4 },
                      px: { xs: 2, sm: 3 }
                    }}
                  >
                    <PlaceholderPage title="Trust & Safety" description="How we keep our community safe and secure" />
                  </Container>
                } />
                <Route path="/insurance" element={
                  <Container 
                    component="main" 
                    sx={{ 
                      mt: { xs: 2, sm: 4 }, 
                      mb: { xs: 2, sm: 4 },
                      px: { xs: 2, sm: 3 }
                    }}
                  >
                    <PlaceholderPage title="Insurance" description="Protection and coverage for your rentals" />
                  </Container>
                } />

                {/* Legal Pages */}
                <Route path="/terms" element={<TermsOfServicePage />} />
                <Route path="/privacy" element={
                  <Container 
                    component="main" 
                    sx={{ 
                      mt: { xs: 2, sm: 4 }, 
                      mb: { xs: 2, sm: 4 },
                      px: { xs: 2, sm: 3 }
                    }}
                  >
                    <PlaceholderPage title="Privacy Policy" description="How we protect and use your personal information" />
                  </Container>
                } />
                <Route path="/cookies" element={
                  <Container 
                    component="main" 
                    sx={{ 
                      mt: { xs: 2, sm: 4 }, 
                      mb: { xs: 2, sm: 4 },
                      px: { xs: 2, sm: 3 }
                    }}
                  >
                    <PlaceholderPage title="Cookie Policy" description="Information about our use of cookies" />
                  </Container>
                } />
                <Route path="/rental-agreement" element={
                  <Container 
                    component="main" 
                    sx={{ 
                      mt: { xs: 2, sm: 4 }, 
                      mb: { xs: 2, sm: 4 },
                      px: { xs: 2, sm: 3 }
                    }}
                  >
                    <PlaceholderPage title="Rental Agreement" description="Standard terms for rental transactions" />
                  </Container>
                } />
                <Route path="/disputes" element={
                  <Container 
                    component="main" 
                    sx={{ 
                      mt: { xs: 2, sm: 4 }, 
                      mb: { xs: 2, sm: 4 },
                      px: { xs: 2, sm: 3 }
                    }}
                  >
                    <PlaceholderPage title="Dispute Resolution" description="How we handle disputes between users" />
                  </Container>
                } />

                {/* Protected Routes */}
                <Route
                  path="/add-item"
                  element={
                    <PrivateRoute>
                      <Container 
                        component="main" 
                        sx={{ 
                          mt: { xs: 2, sm: 4 }, 
                          mb: { xs: 2, sm: 4 },
                          px: { xs: 2, sm: 3 }
                        }}
                      >
                        <AddItemPage />
                      </Container>
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/pay/:bookingId"
                  element={
                    <PrivateRoute>
                      <Container 
                        component="main" 
                        sx={{ 
                          mt: { xs: 2, sm: 4 }, 
                          mb: { xs: 2, sm: 4 },
                          px: { xs: 2, sm: 3 }
                        }}
                      >
                        <PaymentPage />
                      </Container>
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <PrivateRoute>
                      <Container 
                        component="main" 
                        sx={{ 
                          mt: { xs: 2, sm: 4 }, 
                          mb: { xs: 2, sm: 4 },
                          px: { xs: 2, sm: 3 }
                        }}
                      >
                        <ProfilePage />
                      </Container>
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/my-items"
                  element={
                    <PrivateRoute>
                      <Container 
                        component="main" 
                        sx={{ 
                          mt: { xs: 2, sm: 4 }, 
                          mb: { xs: 2, sm: 4 },
                          px: { xs: 2, sm: 3 }
                        }}
                      >
                        <ItemManagementPage />
                      </Container>
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/bookings"
                  element={
                    <PrivateRoute>
                      <Container 
                        component="main" 
                        sx={{ 
                          mt: { xs: 2, sm: 4 }, 
                          mb: { xs: 2, sm: 4 },
                          px: { xs: 2, sm: 3 }
                        }}
                      >
                        <BookingsPage />
                      </Container>
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/messages"
                  element={
                    <PrivateRoute>
                      <MessagesPage />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <PrivateRoute>
                      <AdminPage />
                    </PrivateRoute>
                  }
                />
              </Routes>
            </Suspense>
          </Box>
        </Box>
      </Router>
    </ErrorBoundary>
  );
}

// Simple placeholder component for pages not yet implemented
const PlaceholderPage = ({ title, description }) => (
  <Box sx={{ 
    textAlign: 'center', 
    py: { xs: 4, md: 8 },
    px: { xs: 2, sm: 0 }
  }}>
    <Typography 
      variant="h2" 
      sx={{ 
        fontWeight: 700, 
        mb: 3,
        fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }
      }}
    >
      {title}
    </Typography>
    <Typography 
      variant="h6" 
      color="text.secondary" 
      sx={{ 
        maxWidth: 600, 
        mx: 'auto', 
        mb: 4,
        fontSize: { xs: '1rem', sm: '1.25rem' },
        px: { xs: 2, sm: 0 }
      }}
    >
      {description}
    </Typography>
    <Typography variant="body1" color="text.secondary">
      This page is coming soon. Check back later for updates!
    </Typography>
  </Box>
);

export default App;