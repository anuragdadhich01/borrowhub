import React, { useState, useEffect } from 'react';
import {
  Snackbar,
  Alert,
  AlertTitle,
  Box,
  Typography,
  Slide,
  IconButton,
  Stack,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Close,
  Email,
  CheckCircle,
  Error,
  Warning,
  Info
} from '@mui/icons-material';

// Notification types
const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
  EMAIL: 'email'
};

// Notification context for managing global notifications
export const NotificationContext = React.createContext();

// Notification provider component
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Add notification
  const addNotification = (notification) => {
    const id = Date.now() + Math.random();
    const newNotification = {
      id,
      ...notification,
      timestamp: new Date(),
    };
    
    setNotifications(prev => [...prev, newNotification]);

    // Auto remove after duration (default 6 seconds)
    const duration = notification.duration || 6000;
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }

    return id;
  };

  // Remove notification
  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  // Clear all notifications
  const clearAll = () => {
    setNotifications([]);
  };

  // Email notification helpers
  const notifyEmailSent = (type, recipient) => {
    const emailMessages = {
      welcome: `Welcome email sent to ${recipient}`,
      booking_confirmation: `Booking confirmation sent to ${recipient}`,
      payment_receipt: `Payment receipt sent to ${recipient}`,
      booking_reminder: `Booking reminder sent to ${recipient}`,
      item_available: `Item availability alert sent to ${recipient}`,
      password_reset: `Password reset email sent to ${recipient}`,
    };

    addNotification({
      type: NOTIFICATION_TYPES.EMAIL,
      title: 'Email Sent',
      message: emailMessages[type] || `Email sent to ${recipient}`,
      icon: <Email />,
      duration: 4000,
    });
  };

  const contextValue = {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
    notifyEmailSent,
    // Convenience methods for different types
    success: (message, title) => addNotification({ 
      type: NOTIFICATION_TYPES.SUCCESS, 
      message, 
      title 
    }),
    error: (message, title) => addNotification({ 
      type: NOTIFICATION_TYPES.ERROR, 
      message, 
      title,
      duration: 8000 // Errors stay longer
    }),
    warning: (message, title) => addNotification({ 
      type: NOTIFICATION_TYPES.WARNING, 
      message, 
      title 
    }),
    info: (message, title) => addNotification({ 
      type: NOTIFICATION_TYPES.INFO, 
      message, 
      title 
    }),
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      <NotificationContainer notifications={notifications} onRemove={removeNotification} />
    </NotificationContext.Provider>
  );
};

// Individual notification component
const NotificationItem = ({ notification, onRemove }) => {
  const { id, type, title, message, icon, actions } = notification;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const getIcon = () => {
    if (icon) return icon;
    
    switch (type) {
      case NOTIFICATION_TYPES.SUCCESS:
        return <CheckCircle />;
      case NOTIFICATION_TYPES.ERROR:
        return <Error />;
      case NOTIFICATION_TYPES.WARNING:
        return <Warning />;
      case NOTIFICATION_TYPES.EMAIL:
        return <Email />;
      default:
        return <Info />;
    }
  };

  return (
    <Alert
      severity={type === NOTIFICATION_TYPES.EMAIL ? 'info' : type}
      icon={getIcon()}
      action={
        <IconButton
          aria-label="close"
          color="inherit"
          size="small"
          onClick={() => onRemove(id)}
        >
          <Close fontSize="inherit" />
        </IconButton>
      }
      sx={{
        mb: 1,
        borderRadius: 2,
        boxShadow: theme.shadows[4],
        backdropFilter: 'blur(10px)',
        '& .MuiAlert-message': {
          width: '100%',
        },
        maxWidth: isMobile ? '100%' : '400px',
        minWidth: isMobile ? '280px' : '350px',
      }}
    >
      {title && (
        <AlertTitle sx={{ fontWeight: 600, mb: 0.5 }}>
          {title}
        </AlertTitle>
      )}
      <Typography variant="body2" sx={{ mb: actions ? 1 : 0 }}>
        {message}
      </Typography>
      {actions && (
        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
          {actions}
        </Stack>
      )}
    </Alert>
  );
};

// Notification container
const NotificationContainer = ({ notifications, onRemove }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  if (notifications.length === 0) {
    return null;
  }

  return (
    <Box
      sx={{
        position: 'fixed',
        top: isMobile ? 16 : 24,
        right: isMobile ? 16 : 24,
        zIndex: theme.zIndex.snackbar + 1,
        pointerEvents: 'none',
        maxWidth: isMobile ? 'calc(100vw - 32px)' : '400px',
      }}
    >
      <Stack spacing={1}>
        {notifications.map((notification) => (
          <Slide
            key={notification.id}
            direction="left"
            in={true}
            mountOnEnter
            unmountOnExit
          >
            <Box sx={{ pointerEvents: 'auto' }}>
              <NotificationItem
                notification={notification}
                onRemove={onRemove}
              />
            </Box>
          </Slide>
        ))}
      </Stack>
    </Box>
  );
};

// Hook to use notifications
export const useNotification = () => {
  const context = React.useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

// Email notification service simulation
export class EmailService {
  static async sendWelcomeEmail(user) {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const emailData = {
      to: user.email,
      subject: 'Welcome to BorrowHub!',
      template: 'welcome',
      data: {
        firstName: user.firstName || user.username,
        loginUrl: `${window.location.origin}/login`,
      }
    };

    console.log('Sending welcome email:', emailData);
    return { success: true, emailId: 'email_' + Date.now() };
  }

  static async sendBookingConfirmation(booking, user, item) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const emailData = {
      to: user.email,
      subject: 'Booking Confirmation - BorrowHub',
      template: 'booking_confirmation',
      data: {
        firstName: user.firstName || user.username,
        itemName: item.name,
        startDate: booking.startDate,
        endDate: booking.endDate,
        totalPrice: booking.totalPrice,
        bookingId: booking.id,
      }
    };

    console.log('Sending booking confirmation:', emailData);
    return { success: true, emailId: 'email_' + Date.now() };
  }

  static async sendPaymentReceipt(payment, booking, user, item) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const emailData = {
      to: user.email,
      subject: 'Payment Receipt - BorrowHub',
      template: 'payment_receipt',
      data: {
        firstName: user.firstName || user.username,
        itemName: item.name,
        amount: payment.amount,
        paymentId: payment.id,
        bookingId: booking.id,
        paymentDate: new Date().toLocaleDateString(),
      }
    };

    console.log('Sending payment receipt:', emailData);
    return { success: true, emailId: 'email_' + Date.now() };
  }

  static async sendBookingReminder(booking, user, item) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const emailData = {
      to: user.email,
      subject: 'Booking Reminder - BorrowHub',
      template: 'booking_reminder',
      data: {
        firstName: user.firstName || user.username,
        itemName: item.name,
        startDate: booking.startDate,
        pickupInstructions: item.pickupInstructions || 'Contact owner for pickup details',
      }
    };

    console.log('Sending booking reminder:', emailData);
    return { success: true, emailId: 'email_' + Date.now() };
  }

  static async sendItemAvailabilityAlert(user, item) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const emailData = {
      to: user.email,
      subject: 'Item Now Available - BorrowHub',
      template: 'item_available',
      data: {
        firstName: user.firstName || user.username,
        itemName: item.name,
        itemUrl: `${window.location.origin}/item/${item.id}`,
      }
    };

    console.log('Sending item availability alert:', emailData);
    return { success: true, emailId: 'email_' + Date.now() };
  }
}

export default {
  NotificationProvider,
  useNotification,
  EmailService,
  NOTIFICATION_TYPES
};