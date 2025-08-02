import React, { useState } from 'react';
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
  FormControlLabel
} from '@mui/material';
import {
  Search,
  FilterList,
  LocationOn,
  Star,
  TuneRounded,
  Close
} from '@mui/icons-material';

const SearchAndFilter = ({ onSearch, onFilter, categories, isOpen, onToggle }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [location, setLocation] = useState('');
  const [sortBy, setSortBy] = useState('relevance');
  const [availability, setAvailability] = useState('all');
  const [rating, setRating] = useState(0);
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const handleSearch = () => {
    const filters = {
      searchTerm,
      category: selectedCategory,
      priceRange,
      location,
      sortBy,
      availability,
      rating,
      verifiedOnly
    };
    onSearch(searchTerm);
    onFilter(filters);
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
    onSearch('');
    onFilter({});
  };

  const quickFilters = [
    { label: 'Cameras', category: 'cameras' },
    { label: 'Electronics', category: 'electronics' },
    { label: 'Tools', category: 'tools' },
    { label: 'Sports', category: 'sports' },
    { label: 'Available Now', type: 'availability' },
    { label: 'Under ₹1000', type: 'price' }
  ];

  return (
    <Box sx={{ backgroundColor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider' }}>
      <Container maxWidth="xl" sx={{ py: 3 }}>
        {/* Main Search Bar */}
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search for cameras, tools, bikes, electronics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <Button
                      variant="contained"
                      onClick={handleSearch}
                      sx={{
                        borderRadius: 1.5,
                        px: 3,
                        fontWeight: 600
                      }}
                    >
                      Search
                    </Button>
                  </InputAdornment>
                ),
                sx: {
                  borderRadius: 2,
                  backgroundColor: 'grey.50',
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
          </Grid>
          
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              placeholder="Location (e.g., Mumbai, Delhi)"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LocationOn sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
                sx: {
                  borderRadius: 2,
                  backgroundColor: 'grey.50',
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
          </Grid>

          <Grid item xs={12} md={3}>
            <Button
              variant={isOpen ? "contained" : "outlined"}
              startIcon={<TuneRounded />}
              onClick={onToggle}
              fullWidth
              sx={{
                height: 56,
                borderRadius: 2,
                fontWeight: 600,
                textTransform: 'none'
              }}
            >
              {isOpen ? 'Hide Filters' : 'Show Filters'}
            </Button>
          </Grid>
        </Grid>

        {/* Quick Filter Chips */}
        <Box sx={{ mt: 3 }}>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {quickFilters.map((filter, index) => (
              <Chip
                key={index}
                label={filter.label}
                variant="outlined"
                clickable
                onClick={() => {
                  if (filter.category) {
                    setSelectedCategory(filter.category);
                  }
                  handleSearch();
                }}
                sx={{
                  borderRadius: 2,
                  fontWeight: 500,
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
              mt: 3,
              p: 3,
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              backgroundColor: 'grey.50'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Advanced Filters
              </Typography>
              <Button
                startIcon={<Close />}
                onClick={handleClearFilters}
                sx={{ fontWeight: 500 }}
              >
                Clear All
              </Button>
            </Box>

            <Grid container spacing={3}>
              {/* Category */}
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={selectedCategory}
                    label="Category"
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value="">All Categories</MenuItem>
                    <MenuItem value="cameras">📸 Cameras</MenuItem>
                    <MenuItem value="electronics">💻 Electronics</MenuItem>
                    <MenuItem value="tools">🔧 Tools</MenuItem>
                    <MenuItem value="sports">⚽ Sports</MenuItem>
                    <MenuItem value="music">🎵 Music</MenuItem>
                    <MenuItem value="gaming">🎮 Gaming</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Sort By */}
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Sort By</InputLabel>
                  <Select
                    value={sortBy}
                    label="Sort By"
                    onChange={(e) => setSortBy(e.target.value)}
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value="relevance">Relevance</MenuItem>
                    <MenuItem value="price-low">Price: Low to High</MenuItem>
                    <MenuItem value="price-high">Price: High to Low</MenuItem>
                    <MenuItem value="rating">Highest Rated</MenuItem>
                    <MenuItem value="newest">Newest First</MenuItem>
                    <MenuItem value="distance">Nearest First</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Availability */}
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Availability</InputLabel>
                  <Select
                    value={availability}
                    label="Availability"
                    onChange={(e) => setAvailability(e.target.value)}
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value="all">All Items</MenuItem>
                    <MenuItem value="available">Available Now</MenuItem>
                    <MenuItem value="coming-soon">Coming Soon</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Minimum Rating */}
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Minimum Rating</InputLabel>
                  <Select
                    value={rating}
                    label="Minimum Rating"
                    onChange={(e) => setRating(e.target.value)}
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value={0}>Any Rating</MenuItem>
                    <MenuItem value={3}>3+ ⭐</MenuItem>
                    <MenuItem value={4}>4+ ⭐</MenuItem>
                    <MenuItem value={4.5}>4.5+ ⭐</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Price Range */}
              <Grid item xs={12} md={6}>
                <Typography variant="body2" sx={{ mb: 2, fontWeight: 500 }}>
                  Price Range: ₹{priceRange[0]} - ₹{priceRange[1]} per day
                </Typography>
                <Slider
                  value={priceRange}
                  onChange={(e, newValue) => setPriceRange(newValue)}
                  valueLabelDisplay="auto"
                  min={0}
                  max={10000}
                  step={100}
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
                <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={verifiedOnly}
                        onChange={(e) => setVerifiedOnly(e.target.checked)}
                        color="primary"
                      />
                    }
                    label="Verified owners only"
                    sx={{ fontWeight: 500 }}
                  />
                </Box>
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button
                variant="outlined"
                onClick={handleClearFilters}
                sx={{ borderRadius: 2, fontWeight: 600, px: 4 }}
              >
                Clear Filters
              </Button>
              <Button
                variant="contained"
                onClick={handleSearch}
                sx={{ borderRadius: 2, fontWeight: 600, px: 4 }}
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

export default SearchAndFilter;