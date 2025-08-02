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
  Divider,
  Container,
  Chip
} from '@mui/material';
import { 
  AccountCircle, 
  Add, 
  ExitToApp, 
  Search,
  FavoriteBorder,
  NotificationsNone 
} from '@mui/icons-material';
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
      PaperProps={{
        sx: {
          borderRadius: 2,
          mt: 1,
          minWidth: 200,
          boxShadow: '0px 10px 15px rgba(0, 0, 0, 0.1), 0px 4px 6px rgba(0, 0, 0, 0.05)',
        }
      }}
    >
      <MenuItem disabled>
        <Box sx={{ py: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Signed in as
          </Typography>
          <Typography variant="body2" fontWeight={600}>
            {user?.email || 'User'}
          </Typography>
        </Box>
      </MenuItem>
      <Divider />
      <MenuItem onClick={handleProfile} sx={{ py: 1.5 }}>
        <AccountCircle sx={{ mr: 2, color: 'text.secondary' }} />
        <Typography variant="body2">Profile</Typography>
      </MenuItem>
      <MenuItem onClick={handleBookings} sx={{ py: 1.5 }}>
        <FavoriteBorder sx={{ mr: 2, color: 'text.secondary' }} />
        <Typography variant="body2">My Bookings</Typography>
      </MenuItem>
      <Divider />
      <MenuItem onClick={handleLogout} sx={{ py: 1.5 }}>
        <ExitToApp sx={{ mr: 2, color: 'error.main' }} />
        <Typography variant="body2" color="error.main">Logout</Typography>
      </MenuItem>
    </Menu>
  );

  return (
    <AppBar position="static" elevation={0}>
      <Container maxWidth="xl">
        <Toolbar sx={{ py: 1 }}>
          {/* Logo and Brand */}
          <Box 
            component={RouterLink}
            to="/"
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              textDecoration: 'none',
              color: 'inherit',
              mr: 4
            }}
          >
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: 2,
                color: 'white',
                fontWeight: 'bold',
                fontSize: '1.2rem'
              }}
            >
              B
            </Box>
            <Typography
              variant="h6"
              sx={{ 
                fontWeight: 700,
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: '1.5rem'
              }}
            >
              BorrowHub
            </Typography>
          </Box>

          {/* Navigation Links */}
          <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button 
              color="inherit" 
              component={RouterLink} 
              to="/"
              sx={{ 
                color: 'text.primary',
                fontWeight: 500,
                '&:hover': { 
                  backgroundColor: 'rgba(99, 102, 241, 0.08)'
                }
              }}
            >
              Home
            </Button>
            <Button 
              color="inherit"
              component={RouterLink}
              to="/categories"
              sx={{ 
                color: 'text.primary',
                fontWeight: 500,
                '&:hover': { 
                  backgroundColor: 'rgba(99, 102, 241, 0.08)'
                }
              }}
            >
              Categories
            </Button>
            <Button 
              color="inherit"
              component={RouterLink}
              to="/how-it-works"
              sx={{ 
                color: 'text.primary',
                fontWeight: 500,
                '&:hover': { 
                  backgroundColor: 'rgba(99, 102, 241, 0.08)'
                }
              }}
            >
              How it Works
            </Button>
          </Box>

          {/* Right side actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Search Icon */}
            <IconButton 
              color="inherit" 
              sx={{ 
                color: 'text.secondary',
                '&:hover': { 
                  backgroundColor: 'rgba(99, 102, 241, 0.08)',
                  color: 'primary.main'
                }
              }}
            >
              <Search />
            </IconButton>

            {isAuthenticated ? (
              <>
                {/* Notification Icon */}
                <IconButton 
                  color="inherit" 
                  sx={{ 
                    color: 'text.secondary',
                    '&:hover': { 
                      backgroundColor: 'rgba(99, 102, 241, 0.08)',
                      color: 'primary.main'
                    }
                  }}
                >
                  <NotificationsNone />
                </IconButton>

                {/* List Item Button */}
                <Button 
                  component={RouterLink} 
                  to="/add-item"
                  startIcon={<Add />}
                  sx={{
                    ml: 1,
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    color: 'white',
                    fontWeight: 600,
                    px: 3,
                    py: 1,
                    borderRadius: 2,
                    textTransform: 'none',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #4338ca 0%, #7c3aed 100%)',
                      transform: 'translateY(-1px)',
                      boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.07), 0px 2px 4px rgba(0, 0, 0, 0.06)',
                    },
                  }}
                >
                  List Item
                </Button>

                {/* Profile Avatar */}
                <IconButton
                  edge="end"
                  aria-label="account of current user"
                  aria-controls="profile-menu"
                  aria-haspopup="true"
                  onClick={handleProfileMenuOpen}
                  sx={{ ml: 1 }}
                >
                  <Avatar 
                    sx={{ 
                      width: 36, 
                      height: 36, 
                      background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                      fontWeight: 600
                    }}
                  >
                    {user?.firstName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                  </Avatar>
                </IconButton>
              </>
            ) : (
              <>
                <Button 
                  color="inherit" 
                  component={RouterLink} 
                  to="/login"
                  sx={{ 
                    color: 'text.primary',
                    fontWeight: 500,
                    '&:hover': { 
                      backgroundColor: 'rgba(99, 102, 241, 0.08)'
                    }
                  }}
                >
                  Sign In
                </Button>
                <Button
                  variant="contained"
                  component={RouterLink}
                  to="/register"
                  sx={{ 
                    ml: 1,
                    fontWeight: 600,
                    px: 3,
                    py: 1,
                    borderRadius: 2,
                    textTransform: 'none'
                  }}
                >
                  Sign Up
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </Container>
      {profileMenu}
    </AppBar>
  );
};

export default Navbar;