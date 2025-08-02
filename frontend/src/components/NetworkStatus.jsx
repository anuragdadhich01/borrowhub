import React, { useState, useEffect } from 'react';
import { Alert, Snackbar, Button, Box } from '@mui/material';
import { Wifi, WifiOff, Refresh } from '@mui/icons-material';
import { checkNetworkStatus } from '../api/axios';

const NetworkStatus = ({ onRetry }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [apiAvailable, setApiAvailable] = useState(true);
  const [showAlert, setShowAlert] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowAlert(false);
      checkAPI();
    };

    const handleOffline = () => {
      setIsOnline(false);
      setApiAvailable(false);
      setShowAlert(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    checkAPI();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const checkAPI = async () => {
    if (isChecking) return;
    
    setIsChecking(true);
    try {
      const status = await checkNetworkStatus();
      setIsOnline(status.online);
      setApiAvailable(status.apiAvailable);
      
      if (!status.online || !status.apiAvailable) {
        setShowAlert(true);
      } else {
        setShowAlert(false);
      }
    } catch (error) {
      console.warn('Network status check failed:', error);
      setApiAvailable(false);
      setShowAlert(true);
    } finally {
      setIsChecking(false);
    }
  };

  const handleRetry = () => {
    checkAPI();
    if (onRetry) {
      onRetry();
    }
  };

  const handleClose = () => {
    setShowAlert(false);
  };

  const getAlertMessage = () => {
    if (!isOnline) {
      return 'You are offline. Please check your internet connection.';
    }
    if (!apiAvailable) {
      return 'Unable to connect to our servers. Some features may not work properly.';
    }
    return '';
  };

  const getAlertSeverity = () => {
    if (!isOnline) {
      return 'error';
    }
    if (!apiAvailable) {
      return 'warning';
    }
    return 'info';
  };

  return (
    <Snackbar
      open={showAlert}
      onClose={handleClose}
      autoHideDuration={isOnline && apiAvailable ? 3000 : null}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Alert
        severity={getAlertSeverity()}
        onClose={handleClose}
        icon={isOnline ? <Wifi /> : <WifiOff />}
        action={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button
              color="inherit"
              size="small"
              onClick={handleRetry}
              disabled={isChecking}
              startIcon={<Refresh />}
            >
              {isChecking ? 'Checking...' : 'Retry'}
            </Button>
          </Box>
        }
      >
        {getAlertMessage()}
      </Alert>
    </Snackbar>
  );
};

export default NetworkStatus;