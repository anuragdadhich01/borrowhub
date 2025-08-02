// frontend/src/App.jsx

import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import AddItemPage from './pages/AddItemPage';
import ItemDetailsPage from './pages/ItemDetailsPage';
import PaymentPage from './pages/PaymentPage';
import ProfilePage from './pages/ProfilePage';
import BookingsPage from './pages/BookingsPage';
import ItemManagementPage from './pages/ItemManagementPage';
import MessagesPage from './pages/MessagesPage';
import AdminPage from './pages/AdminPage';
import AboutUsPage from './pages/AboutUsPage';
import HowItWorksPage from './pages/HowItWorksPage';
import CategoryPage from './pages/CategoryPage';
import AllItemsPage from './pages/AllItemsPage';
import TermsOfServicePage from './pages/TermsOfServicePage';
import PrivateRoute from './components/PrivateRoute';
import ErrorBoundary from './components/ErrorBoundary';
import { Box, Container, Typography } from '@mui/material';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <Navbar />
          <Box component="main" sx={{ flexGrow: 1 }}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              
              {/* Authentication Routes */}
              <Route path="/register" element={
                <Container component="main" sx={{ mt: 4, mb: 4 }}>
                  <RegisterPage />
                </Container>
              } />
              <Route path="/login" element={
                <Container component="main" sx={{ mt: 4, mb: 4 }}>
                  <LoginPage />
                </Container>
              } />

              {/* Public Item Routes */}
              <Route path="/items" element={<AllItemsPage />} />
              <Route path="/item/:id" element={
                <Container component="main" sx={{ mt: 4, mb: 4 }}>
                  <ItemDetailsPage />
                </Container>
              } />

              {/* Category Routes */}
              <Route path="/category/:category" element={<CategoryPage />} />

              {/* Company Pages */}
              <Route path="/about" element={<AboutUsPage />} />
              <Route path="/how-it-works" element={<HowItWorksPage />} />
              <Route path="/careers" element={
                <Container component="main" sx={{ mt: 4, mb: 4 }}>
                  <PlaceholderPage title="Careers" description="Join our team and help build the future of sharing economy" />
                </Container>
              } />
              <Route path="/press" element={
                <Container component="main" sx={{ mt: 4, mb: 4 }}>
                  <PlaceholderPage title="Press" description="Latest news and press releases about BorrowHub" />
                </Container>
              } />
              <Route path="/blog" element={
                <Container component="main" sx={{ mt: 4, mb: 4 }}>
                  <PlaceholderPage title="Blog" description="Tips, stories, and insights from the BorrowHub community" />
                </Container>
              } />

              {/* Support Pages */}
              <Route path="/help" element={
                <Container component="main" sx={{ mt: 4, mb: 4 }}>
                  <PlaceholderPage title="Help Center" description="Find answers to frequently asked questions" />
                </Container>
              } />
              <Route path="/safety" element={
                <Container component="main" sx={{ mt: 4, mb: 4 }}>
                  <PlaceholderPage title="Safety" description="Learn about our safety measures and best practices" />
                </Container>
              } />
              <Route path="/contact" element={
                <Container component="main" sx={{ mt: 4, mb: 4 }}>
                  <PlaceholderPage title="Contact Us" description="Get in touch with our support team" />
                </Container>
              } />
              <Route path="/trust" element={
                <Container component="main" sx={{ mt: 4, mb: 4 }}>
                  <PlaceholderPage title="Trust & Safety" description="How we keep our community safe and secure" />
                </Container>
              } />
              <Route path="/insurance" element={
                <Container component="main" sx={{ mt: 4, mb: 4 }}>
                  <PlaceholderPage title="Insurance" description="Protection and coverage for your rentals" />
                </Container>
              } />

              {/* Legal Pages */}
              <Route path="/terms" element={<TermsOfServicePage />} />
              <Route path="/privacy" element={
                <Container component="main" sx={{ mt: 4, mb: 4 }}>
                  <PlaceholderPage title="Privacy Policy" description="How we protect and use your personal information" />
                </Container>
              } />
              <Route path="/cookies" element={
                <Container component="main" sx={{ mt: 4, mb: 4 }}>
                  <PlaceholderPage title="Cookie Policy" description="Information about our use of cookies" />
                </Container>
              } />
              <Route path="/rental-agreement" element={
                <Container component="main" sx={{ mt: 4, mb: 4 }}>
                  <PlaceholderPage title="Rental Agreement" description="Standard terms for rental transactions" />
                </Container>
              } />
              <Route path="/disputes" element={
                <Container component="main" sx={{ mt: 4, mb: 4 }}>
                  <PlaceholderPage title="Dispute Resolution" description="How we handle disputes between users" />
                </Container>
              } />

              {/* Protected Routes */}
              <Route
                path="/add-item"
                element={
                  <PrivateRoute>
                    <Container component="main" sx={{ mt: 4, mb: 4 }}>
                      <AddItemPage />
                    </Container>
                  </PrivateRoute>
                }
              />
              <Route
                path="/pay/:bookingId"
                element={
                  <PrivateRoute>
                    <Container component="main" sx={{ mt: 4, mb: 4 }}>
                      <PaymentPage />
                    </Container>
                  </PrivateRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <PrivateRoute>
                    <Container component="main" sx={{ mt: 4, mb: 4 }}>
                      <ProfilePage />
                    </Container>
                  </PrivateRoute>
                }
              />
              <Route
                path="/my-items"
                element={
                  <PrivateRoute>
                    <Container component="main" sx={{ mt: 4, mb: 4 }}>
                      <ItemManagementPage />
                    </Container>
                  </PrivateRoute>
                }
              />
              <Route
                path="/bookings"
                element={
                  <PrivateRoute>
                    <Container component="main" sx={{ mt: 4, mb: 4 }}>
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
          </Box>
        </Box>
      </Router>
    </ErrorBoundary>
  );
}

// Simple placeholder component for pages not yet implemented
const PlaceholderPage = ({ title, description }) => (
  <Box sx={{ textAlign: 'center', py: 8 }}>
    <Typography variant="h2" sx={{ fontWeight: 700, mb: 3 }}>
      {title}
    </Typography>
    <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto', mb: 4 }}>
      {description}
    </Typography>
    <Typography variant="body1" color="text.secondary">
      This page is coming soon. Check back later for updates!
    </Typography>
  </Box>
);

export default App;