import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Chip,
  Alert,
  CircularProgress,
  Stack,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  CalendarToday,
  CheckCircle,
  Cancel,
  Info
} from '@mui/icons-material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import axios from '../api/axios';

const BookingCalendar = ({ itemId, onDateRangeSelect, selectedStartDate, selectedEndDate }) => {
  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState(selectedStartDate ? dayjs(selectedStartDate) : null);
  const [endDate, setEndDate] = useState(selectedEndDate ? dayjs(selectedEndDate) : null);
  const [selectingStartDate, setSelectingStartDate] = useState(true);

  useEffect(() => {
    if (itemId) {
      fetchAvailability();
    }
  }, [itemId, currentMonth]);

  const fetchAvailability = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`/api/items/${itemId}/availability`, {
        params: {
          month: currentMonth.month() + 1,
          year: currentMonth.year()
        }
      });
      setAvailability(response.data || []);
    } catch (err) {
      console.error('Failed to fetch availability:', err);
      setError('Failed to load availability calendar');
      // Generate mock availability for demo
      generateMockAvailability();
    } finally {
      setLoading(false);
    }
  };

  const generateMockAvailability = () => {
    const daysInMonth = currentMonth.daysInMonth();
    const mockData = [];
    
    for (let i = 1; i <= daysInMonth; i++) {
      const date = currentMonth.date(i);
      const isWeekend = date.day() === 0 || date.day() === 6;
      const random = Math.random();
      
      mockData.push({
        date: date.format('YYYY-MM-DD'),
        available: date.isAfter(dayjs().subtract(1, 'day')) && (isWeekend ? random > 0.3 : random > 0.1),
        price: 50 + Math.floor(random * 100)
      });
    }
    setAvailability(mockData);
  };

  const handleDateClick = (date) => {
    const clickedDate = dayjs(date);
    
    if (clickedDate.isBefore(dayjs(), 'day')) {
      return; // Can't select past dates
    }

    const dayAvailability = availability.find(a => a.date === date);
    if (!dayAvailability || !dayAvailability.available) {
      return; // Can't select unavailable dates
    }

    if (selectingStartDate || !startDate) {
      setStartDate(clickedDate);
      setEndDate(null);
      setSelectingStartDate(false);
    } else {
      if (clickedDate.isBefore(startDate)) {
        // If clicked date is before start date, make it the new start date
        setStartDate(clickedDate);
        setEndDate(null);
      } else {
        setEndDate(clickedDate);
        setSelectingStartDate(true);
        
        // Notify parent component
        if (onDateRangeSelect) {
          onDateRangeSelect({
            startDate: startDate.toDate(),
            endDate: clickedDate.toDate()
          });
        }
      }
    }
  };

  const isDateInRange = (date) => {
    if (!startDate || !endDate) return false;
    const day = dayjs(date);
    return day.isAfter(startDate.subtract(1, 'day')) && day.isBefore(endDate.add(1, 'day'));
  };

  const isDateStart = (date) => {
    return startDate && dayjs(date).isSame(startDate, 'day');
  };

  const isDateEnd = (date) => {
    return endDate && dayjs(date).isSame(endDate, 'day');
  };

  const getDateStatus = (date) => {
    const dayAvailability = availability.find(a => a.date === date);
    const day = dayjs(date);
    
    if (day.isBefore(dayjs(), 'day')) {
      return 'past';
    }
    
    if (!dayAvailability || !dayAvailability.available) {
      return 'unavailable';
    }
    
    if (isDateStart(date)) {
      return 'start';
    }
    
    if (isDateEnd(date)) {
      return 'end';
    }
    
    if (isDateInRange(date)) {
      return 'selected';
    }
    
    return 'available';
  };

  const getDateColor = (status) => {
    switch (status) {
      case 'past':
        return '#f5f5f5';
      case 'unavailable':
        return '#ffebee';
      case 'start':
      case 'end':
        return '#1976d2';
      case 'selected':
        return '#e3f2fd';
      case 'available':
        return '#e8f5e8';
      default:
        return '#fff';
    }
  };

  const getDateTextColor = (status) => {
    switch (status) {
      case 'past':
        return '#bdbdbd';
      case 'unavailable':
        return '#f44336';
      case 'start':
      case 'end':
        return '#fff';
      case 'selected':
        return '#1976d2';
      case 'available':
        return '#2e7d32';
      default:
        return '#000';
    }
  };

  const calculateTotalPrice = () => {
    if (!startDate || !endDate) return 0;
    const days = endDate.diff(startDate, 'day');
    // Use the first available day's price as base price
    const basePrice = availability.find(a => a.available)?.price || 50;
    return days * basePrice;
  };

  const clearSelection = () => {
    setStartDate(null);
    setEndDate(null);
    setSelectingStartDate(true);
    if (onDateRangeSelect) {
      onDateRangeSelect(null);
    }
  };

  const navigateMonth = (direction) => {
    setCurrentMonth(prev => prev.add(direction, 'month'));
  };

  const renderCalendarGrid = () => {
    const startOfMonth = currentMonth.startOf('month');
    const endOfMonth = currentMonth.endOf('month');
    const startOfWeek = startOfMonth.startOf('week');
    const endOfWeek = endOfMonth.endOf('week');

    const days = [];
    let current = startOfWeek;

    while (current.isBefore(endOfWeek.add(1, 'day'))) {
      days.push(current);
      current = current.add(1, 'day');
    }

    const weeks = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }

    return (
      <Box>
        {/* Calendar Header */}
        <Grid container sx={{ mb: 1 }}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <Grid item xs key={day}>
              <Typography
                variant="body2"
                align="center"
                sx={{ fontWeight: 600, color: 'text.secondary', py: 1 }}
              >
                {day}
              </Typography>
            </Grid>
          ))}
        </Grid>

        {/* Calendar Body */}
        {weeks.map((week, weekIndex) => (
          <Grid container key={weekIndex} sx={{ mb: 0.5 }}>
            {week.map((day) => {
              const dateStr = day.format('YYYY-MM-DD');
              const status = getDateStatus(dateStr);
              const isCurrentMonth = day.month() === currentMonth.month();
              const isToday = day.isSame(dayjs(), 'day');

              return (
                <Grid item xs key={day.format('YYYY-MM-DD')}>
                  <Tooltip
                    title={
                      status === 'past' ? 'Past date' :
                      status === 'unavailable' ? 'Not available' :
                      status === 'available' ? 'Click to select' :
                      'Selected'
                    }
                  >
                    <Box
                      onClick={() => handleDateClick(dateStr)}
                      sx={{
                        height: 40,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        m: 0.5,
                        borderRadius: 1,
                        backgroundColor: getDateColor(status),
                        color: getDateTextColor(status),
                        cursor: status === 'available' ? 'pointer' : 'default',
                        border: isToday ? '2px solid #1976d2' : 'none',
                        opacity: isCurrentMonth ? 1 : 0.3,
                        fontWeight: isToday ? 700 : status === 'start' || status === 'end' ? 600 : 400,
                        '&:hover': status === 'available' ? {
                          backgroundColor: '#c8e6c9',
                          transform: 'scale(1.1)'
                        } : {}
                      }}
                    >
                      {day.date()}
                    </Box>
                  </Tooltip>
                </Grid>
              );
            })}
          </Grid>
        ))}
      </Box>
    );
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <Box sx={{ p: 3 }}>
          {/* Calendar Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Select Rental Dates
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton onClick={() => navigateMonth(-1)} size="small">
                <ChevronLeft />
              </IconButton>
              <Typography variant="h6" sx={{ minWidth: 150, textAlign: 'center' }}>
                {currentMonth.format('MMMM YYYY')}
              </Typography>
              <IconButton onClick={() => navigateMonth(1)} size="small">
                <ChevronRight />
              </IconButton>
            </Box>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert severity="warning" sx={{ mb: 2 }} icon={<Info />}>
              {error}. Showing demo availability.
            </Alert>
          )}

          {/* Loading */}
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress size={40} />
            </Box>
          )}

          {/* Calendar Grid */}
          {!loading && renderCalendarGrid()}

          {/* Legend */}
          <Box sx={{ mt: 3 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
              Legend:
            </Typography>
            <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
              <Chip
                size="small"
                label="Available"
                sx={{ backgroundColor: '#e8f5e8', color: '#2e7d32' }}
              />
              <Chip
                size="small"
                label="Unavailable"
                sx={{ backgroundColor: '#ffebee', color: '#f44336' }}
              />
              <Chip
                size="small"
                label="Selected"
                sx={{ backgroundColor: '#1976d2', color: '#fff' }}
              />
            </Stack>
          </Box>

          {/* Selection Summary */}
          {(startDate || endDate) && (
            <Box sx={{ mt: 3, p: 2, backgroundColor: 'grey.50', borderRadius: 2 }}>
              <Stack spacing={2}>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  Selection Summary:
                </Typography>
                
                {startDate && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircle color="success" fontSize="small" />
                    <Typography variant="body2">
                      Start Date: {startDate.format('MMMM DD, YYYY')}
                    </Typography>
                  </Box>
                )}
                
                {endDate && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircle color="success" fontSize="small" />
                    <Typography variant="body2">
                      End Date: {endDate.format('MMMM DD, YYYY')}
                    </Typography>
                  </Box>
                )}
                
                {startDate && endDate && (
                  <>
                    <Typography variant="body2">
                      Duration: {endDate.diff(startDate, 'day')} day(s)
                    </Typography>
                    <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 600 }}>
                      Total: ₹{calculateTotalPrice()}
                    </Typography>
                  </>
                )}
                
                {!selectingStartDate && !endDate && (
                  <Alert severity="info" sx={{ mt: 1 }}>
                    Now select your end date
                  </Alert>
                )}
                
                <Button
                  variant="outlined"
                  size="small"
                  onClick={clearSelection}
                  startIcon={<Cancel />}
                  sx={{ alignSelf: 'flex-start' }}
                >
                  Clear Selection
                </Button>
              </Stack>
            </Box>
          )}
        </Box>
      </Paper>
    </LocalizationProvider>
  );
};

export default BookingCalendar;