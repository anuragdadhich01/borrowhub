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
import PrivateRoute from './components/PrivateRoute';
import { Container } from '@mui/material';

function App() {
  return (
    <Router>
      <Navbar />
      <Container component="main" sx={{ mt: 4, mb: 4 }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/item/:id" element={<ItemDetailsPage />} />
          <Route
            path="/add-item"
            element={
              <PrivateRoute>
                <AddItemPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/pay/:bookingId"
            element={
              <PrivateRoute>
                <PaymentPage />
              </PrivateRoute>
            }
          />
        </Routes>
      </Container>
    </Router>
  );
}

export default App;