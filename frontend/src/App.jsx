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
              <Route path="/item/:id" element={
                <Container component="main" sx={{ mt: 4, mb: 4 }}>
                  <ItemDetailsPage />
                </Container>
              } />
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
            </Routes>
          </Box>
        </Box>
      </Router>
    </ErrorBoundary>
  );
}

export default App;