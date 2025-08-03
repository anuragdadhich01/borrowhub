import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Box,
  Container,
  TextField,
  InputAdornment,
  Grid,
  Chip,
  Button,
  Paper,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  Divider,
  Slider,
  Switch,
  FormControlLabel,
  Autocomplete,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Collapse,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Search,
  FilterList,
  LocationOn,
  Star,
  TuneRounded,
  Close,
  History,
  TrendingUp,
  ExpandMore,
  ExpandLess
} from '@mui/icons-material';

const SearchAndFilter = ({ onSearch, onFilter, categories, isOpen, onToggle }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [location, setLocation] = useState('');
  const [sortBy, setSortBy] = useState('relevance');
  const [availability, setAvailability] = useState('all');
  const [rating, setRating] = useState(0);
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  // Search suggestions and autocomplete
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  
  // Mobile filter state
  const [mobileFiltersExpanded, setMobileFiltersExpanded] = useState(false);

  // Real-time search with debouncing
  const [searchDebounceTimer, setSearchDebounceTimer] = useState(null);
  const searchInputRef = useRef(null);

  // Predefined suggestions and popular searches
  const popularSearches = [
    'Camera DSLR', 'Mountain Bike', 'Gaming Console', 'Laptop', 'Drone',
    'Guitar', 'Projector', 'Power Tools', 'Camping Gear', 'Photography Equipment'
  ];

  const locationOptions = [
    'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad',
    'Pune', 'Ahmedabad', 'Surat', 'Jaipur', 'Lucknow', 'Kanpur'
  ];

  // Load search history from localStorage on component mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('borrowhub_search_history');
    if (savedHistory) {
      setSearchHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Generate search suggestions based on input (memoized)
  const searchSuggestions = useMemo(() => {
    if (searchTerm.length > 0) {
      return popularSearches.filter(item =>
        item.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return [];
  }, [searchTerm, popularSearches]);

  // Save search to history (memoized)
  const saveSearchToHistory = useCallback((searchValue) => {
    if (searchValue.trim() && !searchHistory.includes(searchValue)) {
      const newHistory = [searchValue, ...searchHistory.slice(0, 4)]; // Keep only 5 recent searches
      setSearchHistory(newHistory);
      localStorage.setItem('borrowhub_search_history', JSON.stringify(newHistory));
    }
  }, [searchHistory]);

  // Apply all current filters (memoized)
  const applyCurrentFilters = useCallback((customSearchTerm = null) => {
    const filters = {
      searchTerm: customSearchTerm !== null ? customSearchTerm : searchTerm,
      category: selectedCategory,
      priceRange,
      location,
      sortBy,
      availability,
      rating,
      verifiedOnly
    };
    onFilter(filters);
  }, [searchTerm, selectedCategory, priceRange, location, sortBy, availability, rating, verifiedOnly, onFilter]);

  // Handle real-time search with debouncing (memoized)
  const handleSearchChange = useCallback((e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setShowSuggestions(true);
    
    // Clear existing timer
    if (searchDebounceTimer) {
      clearTimeout(searchDebounceTimer);
    }
    
    // Set new timer for debounced search
    const newTimer = setTimeout(() => {
      applyCurrentFilters(value);
    }, 300); // 300ms debounce
    
    setSearchDebounceTimer(newTimer);
  }, [searchDebounceTimer, applyCurrentFilters]);

  const handleSearch = useCallback(() => {
    if (searchTerm.trim()) {
      saveSearchToHistory(searchTerm);
    }
    setShowSuggestions(false);
    applyCurrentFilters();
  }, [searchTerm, saveSearchToHistory, applyCurrentFilters]);

  const handleSuggestionClick = (suggestion) => {
    setSearchTerm(suggestion);
    setShowSuggestions(false);
    saveSearchToHistory(suggestion);
    applyCurrentFilters(suggestion);
  };

  const handleSearchFocus = () => {
    setShowSuggestions(true);
  };

  const handleSearchBlur = () => {
    // Delay hiding suggestions to allow clicking
    setTimeout(() => setShowSuggestions(false), 200);
  };

  const handleQuickFilter = (filter) => {
    if (filter.category) {
      setSelectedCategory(filter.category);
      // Apply filters immediately
      setTimeout(() => {
        const filters = {
          searchTerm,
          category: filter.category,
          priceRange,
          location,
          sortBy,
          availability,
          rating,
          verifiedOnly
        };
        onFilter(filters);
      }, 0);
    } else if (filter.type === 'availability') {
      setAvailability('available');
      setTimeout(() => {
        const filters = {
          searchTerm,
          category: selectedCategory,
          priceRange,
          location,
          sortBy,
          availability: 'available',
          rating,
          verifiedOnly
        };
        onFilter(filters);
      }, 0);
    } else if (filter.type === 'price') {
      setPriceRange([0, 1000]);
      setTimeout(() => {
        const filters = {
          searchTerm,
          category: selectedCategory,
          priceRange: [0, 1000],
          location,
          sortBy,
          availability,
          rating,
          verifiedOnly
        };
        onFilter(filters);
      }, 0);
    }
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setPriceRange([0, 5000]);
    setLocation('');
    setSortBy('relevance');
    setAvailability('all');
    setRating(0);
    setVerifiedOnly(false);
    onFilter({});
  };

  // Apply filters when any filter value changes
  const handleFilterChange = (filterType, value) => {
    let updatedFilters = {};
    
    switch (filterType) {
      case 'category':
        setSelectedCategory(value);
        updatedFilters.category = value;
        break;
      case 'sortBy':
        setSortBy(value);
        updatedFilters.sortBy = value;
        break;
      case 'availability':
        setAvailability(value);
        updatedFilters.availability = value;
        break;
      case 'rating':
        setRating(value);
        updatedFilters.rating = value;
        break;
      case 'priceRange':
        setPriceRange(value);
        updatedFilters.priceRange = value;
        break;
      case 'location':
        setLocation(value);
        updatedFilters.location = value;
        break;
      case 'verifiedOnly':
        setVerifiedOnly(value);
        updatedFilters.verifiedOnly = value;
        break;
    }
    
    // Apply all current filters with the updated value
    setTimeout(() => {
      const filters = {
        searchTerm,
        category: selectedCategory,
        priceRange,
        location,
        sortBy,
        availability,
        rating,
        verifiedOnly,
        ...updatedFilters
      };
      onFilter(filters);
    }, 0);
  };

  const quickFilters = [
    { label: '📸 Cameras', category: 'electronics' },
    { label: '💻 Electronics', category: 'electronics' },
    { label: '🔧 Tools', category: 'tools' },
    { label: '⚽ Sports', category: 'sports' },
    { label: '🚀 Available Now', type: 'availability' },
    { label: '💰 Under ₹1000', type: 'price' }
  ];

  return (
    <Box sx={{ 
      backgroundColor: 'background.paper', 
      borderBottom: '1px solid', 
      borderColor: 'divider',
      position: 'relative'
    }}>
      <Container maxWidth="xl" sx={{ py: { xs: 2, md: 3 } }}>
        {/* Main Search Bar */}
        <Grid container spacing={{ xs: 1, md: 2 }} alignItems="center">
          <Grid item xs={12} md={6}>
            <Box sx={{ position: 'relative' }}>
              <TextField
                ref={searchInputRef}
                fullWidth
                placeholder="Search for cameras, tools, bikes, electronics..."
                value={searchTerm}
                onChange={handleSearchChange}
                onFocus={handleSearchFocus}
                onBlur={handleSearchBlur}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                  endAdornment: searchTerm && (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() => {
                          setSearchTerm('');
                          setShowSuggestions(false);
                          applyCurrentFilters('');
                        }}
                        sx={{ p: 1 }}
                      >
                        <Close sx={{ fontSize: 16 }} />
                      </IconButton>
                    </InputAdornment>
                  ),
                  sx: {
                    borderRadius: 2,
                    backgroundColor: 'grey.50',
                    fontSize: { xs: '0.875rem', md: '1rem' },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'transparent',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'primary.main',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'primary.main',
                    },
                  }
                }}
              />
              
              {/* Search Suggestions Dropdown */}
              {showSuggestions && (searchSuggestions.length > 0 || searchHistory.length > 0) && (
                <Paper
                  sx={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    zIndex: 1000,
                    mt: 1,
                    maxHeight: 300,
                    overflow: 'auto',
                    borderRadius: 2,
                    boxShadow: theme.shadows[8]
                  }}
                >
                  <List sx={{ py: 1 }}>
                    {/* Search History */}
                    {searchHistory.length > 0 && searchTerm.length === 0 && (
                      <>
                        <ListItem sx={{ py: 0.5 }}>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                            Recent Searches
                          </Typography>
                        </ListItem>
                        {searchHistory.map((item, index) => (
                          <ListItem
                            key={`history-${index}`}
                            button
                            onClick={() => handleSuggestionClick(item)}
                            sx={{ py: 1 }}
                          >
                            <History sx={{ mr: 2, color: 'text.secondary', fontSize: 18 }} />
                            <ListItemText primary={item} />
                          </ListItem>
                        ))}
                        <Divider sx={{ my: 1 }} />
                      </>
                    )}
                    
                    {/* Popular Searches */}
                    {searchTerm.length === 0 && (
                      <>
                        <ListItem sx={{ py: 0.5 }}>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                            Popular Searches
                          </Typography>
                        </ListItem>
                        {popularSearches.slice(0, 5).map((item, index) => (
                          <ListItem
                            key={`popular-${index}`}
                            button
                            onClick={() => handleSuggestionClick(item)}
                            sx={{ py: 1 }}
                          >
                            <TrendingUp sx={{ mr: 2, color: 'text.secondary', fontSize: 18 }} />
                            <ListItemText primary={item} />
                          </ListItem>
                        ))}
                      </>
                    )}
                    
                    {/* Search Suggestions */}
                    {searchSuggestions.length > 0 && (
                      <>
                        {searchTerm.length > 0 && (
                          <ListItem sx={{ py: 0.5 }}>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                              Suggestions
                            </Typography>
                          </ListItem>
                        )}
                        {searchSuggestions.map((item, index) => (
                          <ListItem
                            key={`suggestion-${index}`}
                            button
                            onClick={() => handleSuggestionClick(item)}
                            sx={{ py: 1 }}
                          >
                            <Search sx={{ mr: 2, color: 'text.secondary', fontSize: 18 }} />
                            <ListItemText primary={item} />
                          </ListItem>
                        ))}
                      </>
                    )}
                  </List>
                </Paper>
              )}
            </Box>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Autocomplete
              freeSolo
              options={locationOptions}
              value={location}
              onChange={(event, newValue) => {
                handleFilterChange('location', newValue || '');
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  fullWidth
                  placeholder="Location (e.g., Mumbai, Delhi)"
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationOn sx={{ color: 'text.secondary' }} />
                      </InputAdornment>
                    ),
                    sx: {
                      borderRadius: 2,
                      backgroundColor: 'grey.50',
                      fontSize: { xs: '0.875rem', md: '1rem' },
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'transparent',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'primary.main',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'primary.main',
                      },
                    }
                  }}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <Button
              variant={isOpen ? "contained" : "outlined"}
              startIcon={<TuneRounded />}
              onClick={onToggle}
              fullWidth
              sx={{
                height: { xs: 48, md: 56 },
                borderRadius: 2,
                fontWeight: 600,
                textTransform: 'none',
                fontSize: { xs: '0.875rem', md: '1rem' }
              }}
            >
              {isOpen ? 'Hide Filters' : 'Show Filters'}
            </Button>
          </Grid>
        </Grid>

        {/* Quick Filter Chips */}
        <Box sx={{ mt: { xs: 2, md: 3 } }}>
          <Stack 
            direction="row" 
            spacing={1} 
            flexWrap="wrap" 
            useFlexGap
            sx={{ 
              gap: { xs: 1, md: 1 }
            }}
          >
            {quickFilters.map((filter, index) => (
              <Chip
                key={index}
                label={filter.label}
                size={isMobile ? "small" : "medium"}
                variant={
                  (filter.category && selectedCategory === filter.category) ||
                  (filter.type === 'availability' && availability === 'available') ||
                  (filter.type === 'price' && priceRange[1] === 1000)
                    ? "filled" : "outlined"
                }
                clickable
                onClick={() => handleQuickFilter(filter)}
                sx={{
                  borderRadius: 2,
                  fontWeight: 500,
                  fontSize: { xs: '0.75rem', md: '0.875rem' },
                  '&:hover': {
                    backgroundColor: 'primary.main',
                    color: 'white',
                    borderColor: 'primary.main'
                  }
                }}
              />
            ))}
          </Stack>
        </Box>

        {/* Advanced Filters */}
        {isOpen && (
          <Paper
            elevation={0}
            sx={{
              mt: { xs: 2, md: 3 },
              p: { xs: 2, md: 3 },
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              backgroundColor: 'grey.50'
            }}
          >
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              mb: { xs: 2, md: 3 },
              flexDirection: { xs: 'column', sm: 'row' },
              gap: { xs: 1, sm: 0 }
            }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 600,
                  fontSize: { xs: '1.125rem', md: '1.25rem' }
                }}
              >
                Advanced Filters
              </Typography>
              <Button
                startIcon={<Close />}
                onClick={handleClearFilters}
                size={isMobile ? "small" : "medium"}
                sx={{ fontWeight: 500 }}
              >
                Clear All
              </Button>
            </Box>

            <Grid container spacing={{ xs: 2, md: 3 }}>
              {/* Mobile Expandable Section */}
              {isMobile && (
                <Grid item xs={12}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={mobileFiltersExpanded ? <ExpandLess /> : <ExpandMore />}
                    onClick={() => setMobileFiltersExpanded(!mobileFiltersExpanded)}
                    sx={{ mb: 2 }}
                  >
                    {mobileFiltersExpanded ? 'Hide' : 'Show'} Filter Options
                  </Button>
                </Grid>
              )}

              <Collapse in={!isMobile || mobileFiltersExpanded} sx={{ width: '100%' }}>
                <Grid container spacing={{ xs: 2, md: 3 }}>
                  {/* Category */}
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth size={isMobile ? "small" : "medium"}>
                      <InputLabel>Category</InputLabel>
                      <Select
                        value={selectedCategory}
                        label="Category"
                        onChange={(e) => handleFilterChange('category', e.target.value)}
                        sx={{ borderRadius: 2 }}
                      >
                        <MenuItem value="">All Categories</MenuItem>
                        <MenuItem value="electronics">📸 Cameras & Electronics</MenuItem>
                        <MenuItem value="tools">🔧 Tools & Equipment</MenuItem>
                        <MenuItem value="sports">⚽ Sports & Outdoor</MenuItem>
                        <MenuItem value="music">🎵 Music & Audio</MenuItem>
                        <MenuItem value="gaming">🎮 Gaming</MenuItem>
                        <MenuItem value="vehicles">🚗 Vehicles</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Sort By */}
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth size={isMobile ? "small" : "medium"}>
                      <InputLabel>Sort By</InputLabel>
                      <Select
                        value={sortBy}
                        label="Sort By"
                        onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                        sx={{ borderRadius: 2 }}
                      >
                        <MenuItem value="relevance">✨ Relevance</MenuItem>
                        <MenuItem value="price-low">💰 Price: Low to High</MenuItem>
                        <MenuItem value="price-high">💎 Price: High to Low</MenuItem>
                        <MenuItem value="rating">⭐ Highest Rated</MenuItem>
                        <MenuItem value="newest">🆕 Newest First</MenuItem>
                        <MenuItem value="distance">📍 Nearest First</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Availability */}
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth size={isMobile ? "small" : "medium"}>
                      <InputLabel>Availability</InputLabel>
                      <Select
                        value={availability}
                        label="Availability"
                        onChange={(e) => handleFilterChange('availability', e.target.value)}
                        sx={{ borderRadius: 2 }}
                      >
                        <MenuItem value="all">All Items</MenuItem>
                        <MenuItem value="available">🟢 Available Now</MenuItem>
                        <MenuItem value="coming-soon">🔜 Coming Soon</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Minimum Rating */}
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth size={isMobile ? "small" : "medium"}>
                      <InputLabel>Minimum Rating</InputLabel>
                      <Select
                        value={rating}
                        label="Minimum Rating"
                        onChange={(e) => handleFilterChange('rating', e.target.value)}
                        sx={{ borderRadius: 2 }}
                      >
                        <MenuItem value={0}>Any Rating</MenuItem>
                        <MenuItem value={3}>3+ ⭐⭐⭐</MenuItem>
                        <MenuItem value={4}>4+ ⭐⭐⭐⭐</MenuItem>
                        <MenuItem value={4.5}>4.5+ ⭐⭐⭐⭐⭐</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Price Range */}
                  <Grid item xs={12} md={6}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        mb: 2, 
                        fontWeight: 500,
                        fontSize: { xs: '0.875rem', md: '1rem' }
                      }}
                    >
                      Price Range: ₹{priceRange[0]} - ₹{priceRange[1]} per day
                    </Typography>
                    <Slider
                      value={priceRange}
                      onChange={(e, newValue) => handleFilterChange('priceRange', newValue)}
                      valueLabelDisplay="auto"
                      min={0}
                      max={10000}
                      step={100}
                      size={isMobile ? "small" : "medium"}
                      sx={{
                        '& .MuiSlider-thumb': {
                          backgroundColor: 'primary.main',
                        },
                        '& .MuiSlider-track': {
                          backgroundColor: 'primary.main',
                        }
                      }}
                    />
                  </Grid>

                  {/* Verified Owners Only */}
                  <Grid item xs={12} md={6}>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      height: '100%',
                      pt: { xs: 1, md: 2 }
                    }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={verifiedOnly}
                            onChange={(e) => handleFilterChange('verifiedOnly', e.target.checked)}
                            color="primary"
                            size={isMobile ? "small" : "medium"}
                          />
                        }
                        label={
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontWeight: 500,
                              fontSize: { xs: '0.875rem', md: '1rem' }
                            }}
                          >
                            ✅ Verified owners only
                          </Typography>
                        }
                      />
                    </Box>
                  </Grid>
                </Grid>
              </Collapse>
            </Grid>

            <Divider sx={{ my: { xs: 2, md: 3 } }} />

            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'flex-end', 
              gap: { xs: 1, md: 2 },
              flexDirection: { xs: 'column', sm: 'row' }
            }}>
              <Button
                variant="outlined"
                onClick={handleClearFilters}
                size={isMobile ? "small" : "medium"}
                sx={{ 
                  borderRadius: 2, 
                  fontWeight: 600, 
                  px: { xs: 2, md: 4 }
                }}
              >
                Clear Filters
              </Button>
              <Button
                variant="contained"
                onClick={applyCurrentFilters}
                size={isMobile ? "small" : "medium"}
                sx={{ 
                  borderRadius: 2, 
                  fontWeight: 600, 
                  px: { xs: 2, md: 4 }
                }}
              >
                Apply Filters
              </Button>
            </Box>
          </Paper>
        )}
      </Container>
    </Box>
  );
};

export default React.memo(SearchAndFilter);