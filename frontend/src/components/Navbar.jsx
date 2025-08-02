// frontend/src/components/Navbar.jsx

import React, { useContext, useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box, 
  IconButton, 
  Menu, 
  MenuItem, 
  Avatar,
  Divider
} from '@mui/material';
import { AccountCircle, Add, ExitToApp } from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleProfileMenuClose();
    navigate('/');
  };

  const handleProfile = () => {
    handleProfileMenuClose();
    // Navigate to profile page when implemented
    navigate('/profile');
  };

  const handleBookings = () => {
    handleProfileMenuClose();
    navigate('/bookings');
  };

  const isMenuOpen = Boolean(anchorEl);

  const profileMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      keepMounted
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      open={isMenuOpen}
      onClose={handleProfileMenuClose}
    >
      <MenuItem disabled>
        <Typography variant="body2" color="text.secondary">
          {user?.email || 'User'}
        </Typography>
      </MenuItem>
      <Divider />
      <MenuItem onClick={handleProfile}>
        <AccountCircle sx={{ mr: 1 }} />
        Profile
      </MenuItem>
      <MenuItem onClick={handleBookings}>
        My Bookings
      </MenuItem>
      <Divider />
      <MenuItem onClick={handleLogout}>
        <ExitToApp sx={{ mr: 1 }} />
        Logout
      </MenuItem>
    </Menu>
  );

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
              <Button 
                color="inherit" 
                component={RouterLink} 
                to="/add-item"
                startIcon={<Add />}
              >
                List an Item
              </Button>
              <IconButton
                edge="end"
                aria-label="account of current user"
                aria-controls="profile-menu"
                aria-haspopup="true"
                onClick={handleProfileMenuOpen}
                color="inherit"
                sx={{ ml: 1 }}
              >
                <Avatar 
                  sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}
                >
                  {user?.firstName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </Avatar>
              </IconButton>
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
      {profileMenu}
    </AppBar>
  );
};

export default Navbar;