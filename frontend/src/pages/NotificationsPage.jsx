import React from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  Chip,
  IconButton,
  Alert,
  Divider
} from '@mui/material';
import {
  Notifications,
  Circle,
  CheckCircle,
  Info,
  Warning,
  Schedule
} from '@mui/icons-material';

const NotificationsPage = () => {
  // Demo notifications data
  const notifications = [
    {
      id: 1,
      type: 'success',
      title: 'Booking Confirmed',
      message: 'Your booking for Canon EOS R5 has been confirmed by the owner.',
      time: '2 minutes ago',
      read: false
    },
    {
      id: 2,
      type: 'info',
      title: 'New Message',
      message: 'You have a new message from the owner regarding pickup instructions.',
      time: '1 hour ago',
      read: false
    },
    {
      id: 3,
      type: 'warning',
      title: 'Payment Reminder',
      message: 'Payment due for your upcoming booking. Complete payment to secure your booking.',
      time: '3 hours ago',
      read: true
    },
    {
      id: 4,
      type: 'info',
      title: 'Item Available',
      message: 'MacBook Pro M2 that you wishlisted is now available for rent.',
      time: '1 day ago',
      read: true
    },
    {
      id: 5,
      type: 'success',
      title: 'Return Completed',
      message: 'You have successfully returned Sony A7 III. Thank you for using BorrowHub!',
      time: '2 days ago',
      read: true
    }
  ];

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle sx={{ color: 'success.main' }} />;
      case 'warning':
        return <Warning sx={{ color: 'warning.main' }} />;
      case 'info':
        return <Info sx={{ color: 'info.main' }} />;
      default:
        return <Circle sx={{ color: 'grey.400' }} />;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        {/* Demo Mode Alert */}
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Demo Mode:</strong> These are sample notifications to demonstrate the notifications feature.
          </Typography>
        </Alert>

        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
            <Notifications sx={{ fontSize: '2rem', color: 'primary.main' }} />
            <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
              Notifications
            </Typography>
            {unreadCount > 0 && (
              <Chip 
                label={`${unreadCount} unread`} 
                color="primary" 
                size="small"
                sx={{ fontWeight: 600 }}
              />
            )}
          </Stack>
          <Typography variant="body1" color="text.secondary">
            Stay updated with your bookings, messages, and account activity
          </Typography>
        </Box>

        {/* Notifications List */}
        <Stack spacing={2}>
          {notifications.map((notification) => (
            <Card 
              key={notification.id}
              sx={{ 
                transition: 'all 0.2s ease',
                backgroundColor: notification.read ? 'background.paper' : 'action.hover',
                borderLeft: notification.read ? '4px solid transparent' : '4px solid',
                borderLeftColor: notification.read ? 'transparent' : 'primary.main',
                '&:hover': {
                  transform: 'translateY(-1px)',
                  boxShadow: 2
                }
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" spacing={2} alignItems="flex-start">
                  <Box sx={{ mt: 0.5 }}>
                    {getIcon(notification.type)}
                  </Box>
                  <Box sx={{ flexGrow: 1 }}>
                    <Stack direction="row" alignItems="flex-start" justifyContent="space-between" sx={{ mb: 1 }}>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontWeight: notification.read ? 500 : 700,
                          fontSize: '1.1rem'
                        }}
                      >
                        {notification.title}
                      </Typography>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography variant="caption" color="text.secondary">
                          <Schedule sx={{ fontSize: '0.875rem', mr: 0.5, verticalAlign: 'middle' }} />
                          {notification.time}
                        </Typography>
                        {!notification.read && (
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              backgroundColor: 'primary.main'
                            }}
                          />
                        )}
                      </Stack>
                    </Stack>
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ lineHeight: 1.5 }}
                    >
                      {notification.message}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>

        {/* Empty State for when there are no notifications */}
        {notifications.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Notifications sx={{ fontSize: '4rem', color: 'grey.300', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
              No notifications yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              You'll see updates about your bookings and messages here
            </Typography>
          </Box>
        )}

        <Divider sx={{ my: 4 }} />

        {/* Notification Settings Info */}
        <Box sx={{ textAlign: 'center', p: 3, backgroundColor: 'background.paper', borderRadius: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Want to customize your notification preferences? 
            Visit your <strong>Profile Settings</strong> to manage email and push notifications.
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default NotificationsPage;