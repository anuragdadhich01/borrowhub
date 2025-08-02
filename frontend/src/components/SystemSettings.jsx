import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Settings,
  Edit,
  Save,
  Cancel,
  Add,
  ExpandMore,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';
import axiosInstance from '../api/axios';

const SystemSettings = () => {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editDialog, setEditDialog] = useState(false);
  const [currentSetting, setCurrentSetting] = useState(null);
  const [formData, setFormData] = useState({
    key: '',
    value: '',
    type: 'string',
    description: '',
    category: 'general',
    isPublic: false
  });

  const fetchSettings = async () => {
    try {
      const response = await axiosInstance.get('/api/admin/settings');
      setSettings(response.data || []);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to fetch system settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleEdit = (setting) => {
    setCurrentSetting(setting);
    setFormData({
      key: setting.key,
      value: setting.value,
      type: setting.type,
      description: setting.description,
      category: setting.category,
      isPublic: setting.isPublic
    });
    setEditDialog(true);
  };

  const handleSave = async () => {
    try {
      await axiosInstance.put(`/api/admin/settings/${formData.key}`, {
        value: formData.value,
        type: formData.type,
        description: formData.description,
        category: formData.category,
        isPublic: formData.isPublic
      });
      
      setEditDialog(false);
      fetchSettings();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to update setting');
    }
  };

  const handleCancel = () => {
    setEditDialog(false);
    setCurrentSetting(null);
    setFormData({
      key: '',
      value: '',
      type: 'string',
      description: '',
      category: 'general',
      isPublic: false
    });
  };

  const getValueByType = (value, type) => {
    switch (type) {
      case 'bool':
        return value === 'true' ? 'Yes' : 'No';
      case 'int':
      case 'float':
        return value;
      case 'json':
        try {
          return JSON.stringify(JSON.parse(value), null, 2);
        } catch {
          return value;
        }
      default:
        return value;
    }
  };

  const renderValueInput = () => {
    switch (formData.type) {
      case 'bool':
        return (
          <FormControlLabel
            control={
              <Switch
                checked={formData.value === 'true'}
                onChange={(e) => setFormData({
                  ...formData,
                  value: e.target.checked.toString()
                })}
              />
            }
            label="Enabled"
          />
        );
      case 'int':
        return (
          <TextField
            fullWidth
            label="Value"
            type="number"
            value={formData.value}
            onChange={(e) => setFormData({ ...formData, value: e.target.value })}
          />
        );
      case 'float':
        return (
          <TextField
            fullWidth
            label="Value"
            type="number"
            step="0.01"
            value={formData.value}
            onChange={(e) => setFormData({ ...formData, value: e.target.value })}
          />
        );
      case 'json':
        return (
          <TextField
            fullWidth
            label="Value (JSON)"
            multiline
            rows={4}
            value={formData.value}
            onChange={(e) => setFormData({ ...formData, value: e.target.value })}
          />
        );
      default:
        return (
          <TextField
            fullWidth
            label="Value"
            value={formData.value}
            onChange={(e) => setFormData({ ...formData, value: e.target.value })}
          />
        );
    }
  };

  const groupedSettings = settings.reduce((acc, setting) => {
    if (!acc[setting.category]) {
      acc[setting.category] = [];
    }
    acc[setting.category].push(setting);
    return acc;
  }, {});

  if (loading) {
    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          System Settings
        </Typography>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6">
          System Settings
        </Typography>
        <Button
          startIcon={<Add />}
          variant="contained"
          onClick={() => setEditDialog(true)}
          disabled
        >
          Add Setting
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {Object.entries(groupedSettings).map(([category, categorySettings]) => (
          <Grid item xs={12} key={category}>
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="h6" sx={{ textTransform: 'capitalize' }}>
                  {category} Settings ({categorySettings.length})
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Key</TableCell>
                        <TableCell>Value</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Visibility</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {categorySettings.map((setting) => (
                        <TableRow key={setting.key}>
                          <TableCell>
                            <Typography variant="body2" fontWeight="bold">
                              {setting.key}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {getValueByType(setting.value, setting.type)}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip label={setting.type} size="small" />
                          </TableCell>
                          <TableCell>
                            {setting.isPublic ? (
                              <Chip
                                icon={<Visibility />}
                                label="Public"
                                color="success"
                                size="small"
                              />
                            ) : (
                              <Chip
                                icon={<VisibilityOff />}
                                label="Private"
                                color="default"
                                size="small"
                              />
                            )}
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="textSecondary">
                              {setting.description || 'No description'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <IconButton
                              size="small"
                              onClick={() => handleEdit(setting)}
                            >
                              <Edit />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </AccordionDetails>
            </Accordion>
          </Grid>
        ))}
      </Grid>

      {/* Edit Setting Dialog */}
      <Dialog open={editDialog} onClose={handleCancel} maxWidth="sm" fullWidth>
        <DialogTitle>
          {currentSetting ? 'Edit Setting' : 'Add New Setting'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Key"
              value={formData.key}
              onChange={(e) => setFormData({ ...formData, key: e.target.value })}
              disabled={!!currentSetting}
              sx={{ mb: 2 }}
            />
            
            <TextField
              fullWidth
              select
              label="Type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              SelectProps={{ native: true }}
              sx={{ mb: 2 }}
            >
              <option value="string">String</option>
              <option value="int">Integer</option>
              <option value="float">Float</option>
              <option value="bool">Boolean</option>
              <option value="json">JSON</option>
            </TextField>
            
            <Box sx={{ mb: 2 }}>
              {renderValueInput()}
            </Box>
            
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              sx={{ mb: 2 }}
            />
            
            <TextField
              fullWidth
              label="Category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              sx={{ mb: 2 }}
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isPublic}
                  onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                />
              }
              label="Public Setting (accessible by frontend)"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel} startIcon={<Cancel />}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            startIcon={<Save />}
            variant="contained"
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SystemSettings;