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
import AboutPage from './pages/AboutPage';
import HowItWorksPage from './pages/HowItWorksPage';
import ContactPage from './pages/ContactPage';
import CategoriesPage from './pages/CategoriesPage';
import CategoryDetailPage from './pages/CategoryDetailPage';
import NotFoundPage from './pages/NotFoundPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import HelpCenterPage from './pages/HelpCenterPage';
import SafetyPage from './pages/SafetyPage';
import PrivateRoute from './components/PrivateRoute';
import ErrorBoundary from './components/ErrorBoundary';
import { Box, Container } from '@mui/material';

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

              {/* Public Pages */}
              <Route path="/about" element={<AboutPage />} />
              <Route path="/how-it-works" element={<HowItWorksPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/categories" element={<CategoriesPage />} />
              <Route path="/category/:category" element={<CategoryDetailPage />} />
              
              {/* Support Pages */}
              <Route path="/help" element={<HelpCenterPage />} />
              <Route path="/safety" element={<SafetyPage />} />
              
              {/* Legal Pages */}
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />

              {/* Item Routes */}
              <Route path="/item/:id" element={
                <Container component="main" sx={{ mt: 4, mb: 4 }}>
                  <ItemDetailsPage />
                </Container>
              } />

              {/* Private Routes */}
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
                path="/bookings"
                element={
                  <PrivateRoute>
                    <Container component="main" sx={{ mt: 4, mb: 4 }}>
                      <BookingsPage />
                    </Container>
                  </PrivateRoute>
                }
              />

              {/* 404 Route - Must be last */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Box>
        </Box>
      </Router>
    </ErrorBoundary>
  );
}

export default App;