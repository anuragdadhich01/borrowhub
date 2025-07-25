// frontend/src/components/Navbar.jsx

import React, { useContext } from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const Navbar = () => {
  const { isAuthenticated, dispatch } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
    navigate('/'); // Go to home page after logout
  };

  return (
    <AppBar position="static" sx={{ backgroundColor: '#ffffff', color: '#333' }}>
      <Toolbar>
        <Typography
          variant="h6"
          component={RouterLink}
          to="/"
          sx={{ flexGrow: 1, textDecoration: 'none', color: 'inherit', fontWeight: 'bold' }}
        >
          BorrowHub
        </Typography>

        <Box>
          <Button color="inherit" component={RouterLink} to="/">Home</Button>
          {isAuthenticated ? (
            <>
              <Button color="inherit" component={RouterLink} to="/add-item">List an Item</Button>
              <Button color="inherit" onClick={handleLogout}>Logout</Button>
            </>
          ) : (
            <>
              <Button color="inherit" component={RouterLink} to="/login">Login</Button>
              <Button
                variant="contained"
                component={RouterLink}
                to="/register"
                sx={{ ml: 1 }}
              >
                Sign Up
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;