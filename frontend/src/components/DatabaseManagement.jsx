import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  LinearProgress,
  Chip,
  Alert,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  Storage,
  Speed,
  CheckCircle,
  Error,
  Warning,
  Cable,
  Refresh
} from '@mui/icons-material';
import axiosInstance from '../api/axios';

const DatabaseManagement = () => {
  const [dbStatus, setDbStatus] = useState(null);
  const [dbMetrics, setDbMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchDatabaseInfo = async () => {
    try {
      setError('');
      const [statusResponse, metricsResponse] = await Promise.all([
        axiosInstance.get('/api/admin/database/status'),
        axiosInstance.get('/api/admin/database/metrics').catch(() => ({ data: null }))
      ]);
      
      setDbStatus(statusResponse.data);
      setDbMetrics(metricsResponse.data);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to fetch database information');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDatabaseInfo();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDatabaseInfo();
  };

  const getStatusIcon = (connected) => {
    return connected ? (
      <CheckCircle color="success" />
    ) : (
      <Error color="error" />
    );
  };

  const getStatusColor = (connected) => {
    return connected ? 'success' : 'error';
  };

  if (loading) {
    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Database Management
        </Typography>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6">
          Database Management
        </Typography>
        <Button
          startIcon={<Refresh />}
          onClick={handleRefresh}
          disabled={refreshing}
          variant="outlined"
          size="small"
        >
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Database Status */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Storage sx={{ mr: 1 }} />
                <Typography variant="h6">
                  Database Status
                </Typography>
              </Box>
              
              {dbStatus && (
                <Box>
                  <Box display="flex" alignItems="center" mb={2}>
                    {getStatusIcon(dbStatus.connected)}
                    <Chip
                      label={dbStatus.connected ? 'Connected' : 'Disconnected'}
                      color={getStatusColor(dbStatus.connected)}
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  </Box>
                  
                  <List dense>
                    <ListItem>
                      <ListItemIcon><Cable /></ListItemIcon>
                      <ListItemText
                        primary="Database Type"
                        secondary={dbStatus.type || 'Unknown'}
                      />
                    </ListItem>
                    
                    {dbStatus.host && (
                      <ListItem>
                        <ListItemIcon><Storage /></ListItemIcon>
                        <ListItemText
                          primary="Host"
                          secondary={`${dbStatus.host}:${dbStatus.port}`}
                        />
                      </ListItem>
                    )}
                    
                    {dbStatus.database && (
                      <ListItem>
                        <ListItemIcon><Storage /></ListItemIcon>
                        <ListItemText
                          primary="Database Name"
                          secondary={dbStatus.database}
                        />
                      </ListItem>
                    )}
                    
                    {dbStatus.error && (
                      <ListItem>
                        <ListItemIcon><Error color="error" /></ListItemIcon>
                        <ListItemText
                          primary="Error"
                          secondary={dbStatus.error}
                        />
                      </ListItem>
                    )}
                  </List>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Database Metrics */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Speed sx={{ mr: 1 }} />
                <Typography variant="h6">
                  Performance Metrics
                </Typography>
              </Box>
              
              {dbMetrics ? (
                <Box>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Connection Pool
                  </Typography>
                  
                  <List dense>
                    <ListItem>
                      <ListItemText
                        primary="Max Open Connections"
                        secondary={dbMetrics.connection_pool?.max_open || 'N/A'}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Max Idle Connections"
                        secondary={dbMetrics.connection_pool?.max_idle || 'N/A'}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Active Connections"
                        secondary={dbMetrics.connection_pool?.active || 'Unknown'}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Idle Connections"
                        secondary={dbMetrics.connection_pool?.idle || 'Unknown'}
                      />
                    </ListItem>
                  </List>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Performance
                  </Typography>
                  
                  <List dense>
                    <ListItem>
                      <ListItemText
                        primary="Queries per Second"
                        secondary={dbMetrics.performance?.queries_per_second || 'Unknown'}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Average Query Time"
                        secondary={dbMetrics.performance?.avg_query_time || 'Unknown'}
                      />
                    </ListItem>
                  </List>
                </Box>
              ) : (
                <Alert severity="info">
                  Metrics not available for this database type
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Database Actions */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Database Actions
              </Typography>
              
              <Box display="flex" gap={2} flexWrap="wrap">
                <Button
                  variant="outlined"
                  startIcon={<Storage />}
                  disabled
                >
                  Backup Database
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Refresh />}
                  disabled
                >
                  Restore Database
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Speed />}
                  disabled
                >
                  Optimize Tables
                </Button>
                <Button
                  variant="outlined"
                  color="warning"
                  startIcon={<Warning />}
                  disabled
                >
                  Run Maintenance
                </Button>
              </Box>
              
              <Alert severity="info" sx={{ mt: 2 }}>
                Database backup and maintenance features are coming soon.
              </Alert>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DatabaseManagement;