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
  Chip,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
  Badge
} from '@mui/material';
import { 
  AccountCircle, 
  Add, 
  ExitToApp, 
  Search,
  FavoriteBorder,
  NotificationsNone,
  Message,
  AdminPanelSettings,
  Menu as MenuIcon,
  Home,
  Category as CategoryIcon,
  Help,
  Close
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMobileDrawerToggle = () => {
    setMobileDrawerOpen(!mobileDrawerOpen);
  };

  const handleLogout = () => {
    logout();
    handleProfileMenuClose();
    setMobileDrawerOpen(false);
    navigate('/');
  };

  const handleProfile = () => {
    handleProfileMenuClose();
    setMobileDrawerOpen(false);
    navigate('/profile');
  };

  const handleBookings = () => {
    handleProfileMenuClose();
    setMobileDrawerOpen(false);
    navigate('/bookings');
  };

  const handleMyItems = () => {
    handleProfileMenuClose();
    setMobileDrawerOpen(false);
    navigate('/my-items');
  };

  const handleNotifications = () => {
    console.log('Notifications clicked');
    setMobileDrawerOpen(false);
    navigate('/messages');
  };

  const handleSearch = () => {
    console.log('Search clicked');
    setMobileDrawerOpen(false);
    const searchInput = document.querySelector('input[placeholder*="Search"]');
    if (searchInput) {
      searchInput.focus();
    } else {
      window.scrollTo({ top: 300, behavior: 'smooth' });
    }
  };

  const handleCategories = () => {
    console.log('Categories clicked');
    setMobileDrawerOpen(false);
    if (window.location.pathname === '/') {
      const categoriesSection = document.querySelector('[data-testid="categories-section"]');
      if (categoriesSection) {
        categoriesSection.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 800, behavior: 'smooth' });
      }
    } else {
      navigate('/', { state: { scrollToCategories: true } });
    }
  };

  const handleHowItWorks = () => {
    setMobileDrawerOpen(false);
    navigate('/how-it-works');
  };

  const handleNavigate = (path) => {
    setMobileDrawerOpen(false);
    navigate(path);
  };

  const isMenuOpen = Boolean(anchorEl);

  // Mobile drawer content
  const mobileMenuItems = [
    { text: 'Home', icon: <Home />, action: () => handleNavigate('/') },
    { text: 'All Items', icon: <Search />, action: () => handleNavigate('/items') },
    { text: 'Categories', icon: <CategoryIcon />, action: handleCategories },
    { text: 'How it Works', icon: <Help />, action: handleHowItWorks },
  ];

  const mobileUserMenuItems = isAuthenticated ? [
    { text: 'Profile', icon: <AccountCircle />, action: () => handleNavigate('/profile') },
    { text: 'My Items', icon: <Add />, action: () => handleNavigate('/my-items') },
    { text: 'My Bookings', icon: <FavoriteBorder />, action: () => handleNavigate('/bookings') },
    { text: 'Messages', icon: <Message />, action: () => handleNavigate('/messages') },
    ...(user?.email === 'admin@borrowhub.com' ? [
      { text: 'Admin Panel', icon: <AdminPanelSettings />, action: () => handleNavigate('/admin') }
    ] : []),
    { text: 'Logout', icon: <ExitToApp />, action: handleLogout },
  ] : [
    { text: 'Sign In', icon: <AccountCircle />, action: () => handleNavigate('/login') },
    { text: 'Sign Up', icon: <Add />, action: () => handleNavigate('/register') },
  ];

  const mobileDrawer = (
    <Box sx={{ width: 280, height: '100%' }}>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        p: 2,
        borderBottom: '1px solid',
        borderColor: 'divider'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
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
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
            BorrowHub
          </Typography>
        </Box>
        <IconButton onClick={handleMobileDrawerToggle}>
          <Close />
        </IconButton>
      </Box>
      
      <List>
        {mobileMenuItems.map((item) => (
          <ListItem button key={item.text} onClick={item.action} sx={{ py: 1.5 }}>
            <ListItemIcon sx={{ color: 'text.secondary' }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
      
      <Divider sx={{ my: 1 }} />
      
      {isAuthenticated && (
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Signed in as
          </Typography>
          <Typography variant="body2" fontWeight={600}>
            {user?.email || 'User'}
          </Typography>
        </Box>
      )}
      
      <List>
        {mobileUserMenuItems.map((item) => (
          <ListItem 
            button 
            key={item.text} 
            onClick={item.action} 
            sx={{ 
              py: 1.5,
              ...(item.text === 'Admin Panel' && { color: 'primary.main' }),
              ...(item.text === 'Logout' && { color: 'error.main' })
            }}
          >
            <ListItemIcon sx={{ 
              color: item.text === 'Admin Panel' ? 'primary.main' : 
                     item.text === 'Logout' ? 'error.main' : 'text.secondary' 
            }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </Box>
  );

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
      <MenuItem onClick={handleMyItems} sx={{ py: 1.5 }}>
        <Add sx={{ mr: 2, color: 'text.secondary' }} />
        <Typography variant="body2">My Items</Typography>
      </MenuItem>
      <MenuItem onClick={handleBookings} sx={{ py: 1.5 }}>
        <FavoriteBorder sx={{ mr: 2, color: 'text.secondary' }} />
        <Typography variant="body2">My Bookings</Typography>
      </MenuItem>
      <MenuItem onClick={() => { handleProfileMenuClose(); navigate('/messages'); }} sx={{ py: 1.5 }}>
        <Message sx={{ mr: 2, color: 'text.secondary' }} />
        <Typography variant="body2">Messages</Typography>
      </MenuItem>
      {user?.email === 'admin@borrowhub.com' && (
        <>
          <Divider />
          <MenuItem onClick={() => { handleProfileMenuClose(); navigate('/admin'); }} sx={{ py: 1.5 }}>
            <AdminPanelSettings sx={{ mr: 2, color: 'primary.main' }} />
            <Typography variant="body2" color="primary.main">Admin Panel</Typography>
          </MenuItem>
        </>
      )}
      <Divider />
      <MenuItem onClick={handleLogout} sx={{ py: 1.5 }}>
        <ExitToApp sx={{ mr: 2, color: 'error.main' }} />
        <Typography variant="body2" color="error.main">Logout</Typography>
      </MenuItem>
    </Menu>
  );

  return (
    <>
      <AppBar position="static" elevation={0} sx={{ backgroundColor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Container maxWidth="xl">
          <Toolbar sx={{ py: { xs: 0.5, md: 1 }, px: { xs: 1, sm: 2 } }}>
            {/* Mobile Menu Button */}
            {isMobile && (
              <IconButton
                edge="start"
                color="inherit"
                aria-label="menu"
                onClick={handleMobileDrawerToggle}
                sx={{ mr: 2, color: 'text.primary' }}
              >
                <MenuIcon />
              </IconButton>
            )}

            {/* Logo and Brand */}
            <Box 
              component={RouterLink}
              to="/"
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                textDecoration: 'none',
                color: 'inherit',
                mr: { xs: 'auto', md: 4 }
              }}
            >
              <Box
                sx={{
                  width: { xs: 28, md: 32 },
                  height: { xs: 28, md: 32 },
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mr: { xs: 1, md: 2 },
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: { xs: '1rem', md: '1.2rem' }
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
                  fontSize: { xs: '1.2rem', md: '1.5rem' },
                  display: { xs: isMobile ? 'block' : 'none', md: 'block' }
                }}
              >
                BorrowHub
              </Typography>
            </Box>

            {/* Desktop Navigation Links */}
            {!isMobile && (
              <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Button 
                  color="inherit" 
                  component={RouterLink} 
                  to="/"
                  sx={{ 
                    color: 'text.primary',
                    fontWeight: 500,
                    px: 2,
                    '&:hover': { 
                      backgroundColor: 'rgba(99, 102, 241, 0.08)'
                    }
                  }}
                >
                  Home
                </Button>
                <Button 
                  color="inherit"
                  onClick={handleCategories}
                  sx={{ 
                    color: 'text.primary',
                    fontWeight: 500,
                    px: 2,
                    '&:hover': { 
                      backgroundColor: 'rgba(99, 102, 241, 0.08)'
                    }
                  }}
                >
                  Categories
                </Button>
                <Button 
                  color="inherit"
                  onClick={handleHowItWorks}
                  sx={{ 
                    color: 'text.primary',
                    fontWeight: 500,
                    px: 2,
                    '&:hover': { 
                      backgroundColor: 'rgba(99, 102, 241, 0.08)'
                    }
                  }}
                >
                  How it Works
                </Button>
              </Box>
            )}

            {/* Right side actions */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, md: 1 } }}>
              {/* Search Icon - Always visible */}
              <IconButton 
                color="inherit" 
                onClick={handleSearch}
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
                  {/* Notification Icon - Desktop only */}
                  {!isMobile && (
                    <IconButton 
                      color="inherit" 
                      onClick={handleNotifications}
                      sx={{ 
                        color: 'text.secondary',
                        '&:hover': { 
                          backgroundColor: 'rgba(99, 102, 241, 0.08)',
                          color: 'primary.main'
                        }
                      }}
                    >
                      <Badge badgeContent={0} color="error">
                        <NotificationsNone />
                      </Badge>
                    </IconButton>
                  )}

                  {/* Messages Icon - Desktop only */}
                  {!isMobile && (
                    <IconButton 
                      color="inherit"
                      component={RouterLink}
                      to="/messages"
                      sx={{ 
                        color: 'text.secondary',
                        '&:hover': { 
                          backgroundColor: 'rgba(99, 102, 241, 0.08)',
                          color: 'primary.main'
                        }
                      }}
                    >
                      <Message />
                    </IconButton>
                  )}

                  {/* List Item Button - Hidden on mobile */}
                  {!isMobile && (
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
                  )}

                  {/* Profile Avatar - Different sizes for mobile/desktop */}
                  {!isMobile && (
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
                  )}
                </>
              ) : (
                !isMobile && (
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
                )
              )}
            </Box>
          </Toolbar>
        </Container>
        {!isMobile && profileMenu}
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={mobileDrawerOpen}
        onClose={handleMobileDrawerToggle}
        sx={{
          '& .MuiDrawer-paper': {
            width: 280,
          }
        }}
      >
        {mobileDrawer}
      </Drawer>
    </>
  );
};

export default Navbar;