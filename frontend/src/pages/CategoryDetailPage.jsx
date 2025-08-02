import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Chip,
  Stack,
  TextField,
  InputAdornment,
  MenuItem,
  Breadcrumbs,
  Link,
  Paper,
  Divider
} from '@mui/material';
import {
  PhotoCamera,
  Devices,
  Build,
  SportsBaseball,
  MusicNote,
  Home,
  DirectionsCar,
  School,
  FitnessCenter,
  Celebration,
  Search,
  FilterList,
  Sort,
  Star,
  LocationOn,
  NavigateNext
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import Footer from '../components/Footer';

const CategoryDetailPage = () => {
  const { category } = useParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('relevance');
  const [priceRange, setPriceRange] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');

  const categoryData = {
    cameras: {
      name: 'Cameras & Photography',
      icon: <PhotoCamera />,
      description: 'Professional cameras, lenses, lighting, and photography equipment for all your creative needs.',
      totalItems: 1250,
      subcategories: [
        { name: 'DSLR Cameras', count: 350, slug: 'dslr' },
        { name: 'Mirrorless Cameras', count: 280, slug: 'mirrorless' },
        { name: 'Lenses', count: 420, slug: 'lenses' },
        { name: 'Lighting Equipment', count: 150, slug: 'lighting' },
        { name: 'Tripods & Supports', count: 50, slug: 'tripods' }
      ]
    },
    electronics: {
      name: 'Electronics',
      icon: <Devices />,
      description: 'Latest electronic devices including laptops, gaming consoles, tablets, and smart gadgets.',
      totalItems: 2100,
      subcategories: [
        { name: 'Laptops', count: 650, slug: 'laptops' },
        { name: 'Gaming Consoles', count: 280, slug: 'gaming' },
        { name: 'Tablets', count: 320, slug: 'tablets' },
        { name: 'Smart TVs', count: 180, slug: 'smart-tvs' },
        { name: 'Audio Systems', count: 670, slug: 'audio' }
      ]
    },
    tools: {
      name: 'Tools & Equipment',
      icon: <Build />,
      description: 'Professional tools and equipment for construction, repair, and DIY projects.',
      totalItems: 850,
      subcategories: [
        { name: 'Power Tools', count: 350, slug: 'power-tools' },
        { name: 'Hand Tools', count: 200, slug: 'hand-tools' },
        { name: 'Construction Equipment', count: 150, slug: 'construction' },
        { name: 'Measuring Tools', count: 100, slug: 'measuring' },
        { name: 'Safety Equipment', count: 50, slug: 'safety' }
      ]
    },
    sports: {
      name: 'Sports & Outdoor',
      icon: <SportsBaseball />,
      description: 'Sports equipment, outdoor gear, and adventure accessories for active lifestyles.',
      totalItems: 1500,
      subcategories: [
        { name: 'Fitness Equipment', count: 450, slug: 'fitness' },
        { name: 'Camping Gear', count: 350, slug: 'camping' },
        { name: 'Water Sports', count: 250, slug: 'water-sports' },
        { name: 'Cycling', count: 300, slug: 'cycling' },
        { name: 'Adventure Sports', count: 150, slug: 'adventure' }
      ]
    },
    music: {
      name: 'Music & Audio',
      icon: <MusicNote />,
      description: 'Musical instruments, audio equipment, and recording gear for musicians and audio enthusiasts.',
      totalItems: 600,
      subcategories: [
        { name: 'Musical Instruments', count: 200, slug: 'instruments' },
        { name: 'Audio Equipment', count: 180, slug: 'audio' },
        { name: 'Recording Gear', count: 120, slug: 'recording' },
        { name: 'DJ Equipment', count: 80, slug: 'dj' },
        { name: 'Speakers', count: 20, slug: 'speakers' }
      ]
    }
  };

  const currentCategory = categoryData[category] || categoryData.cameras;

  // Mock items for the category
  const mockItems = [
    {
      id: 1,
      name: 'Canon EOS R5 Camera',
      description: 'Professional full-frame mirrorless camera with 45MP sensor',
      dailyRate: 2500,
      location: 'Mumbai',
      rating: 4.8,
      reviews: 24,
      imageUrl: 'https://picsum.photos/300/200?random=1',
      owner: 'PhotoPro Studios',
      available: true
    },
    {
      id: 2,
      name: 'Sony A7 III Camera',
      description: 'Professional mirrorless camera with excellent low-light performance',
      dailyRate: 2200,
      location: 'Delhi',
      rating: 4.9,
      reviews: 31,
      imageUrl: 'https://picsum.photos/300/200?random=2',
      owner: 'Creative Lens',
      available: true
    },
    {
      id: 3,
      name: 'Nikon D850 DSLR',
      description: 'High-resolution DSLR camera perfect for professional photography',
      dailyRate: 2800,
      location: 'Bangalore',
      rating: 4.7,
      reviews: 18,
      imageUrl: 'https://picsum.photos/300/200?random=3',
      owner: 'Studio Elite',
      available: false
    },
    {
      id: 4,
      name: '70-200mm f/2.8 Lens',
      description: 'Professional telephoto lens with constant aperture',
      dailyRate: 1800,
      location: 'Mumbai',
      rating: 4.8,
      reviews: 42,
      imageUrl: 'https://picsum.photos/300/200?random=4',
      owner: 'Lens Library',
      available: true
    },
    {
      id: 5,
      name: 'Professional LED Panel',
      description: 'High-quality LED lighting panel for photography and videography',
      dailyRate: 800,
      location: 'Pune',
      rating: 4.6,
      reviews: 15,
      imageUrl: 'https://picsum.photos/300/200?random=5',
      owner: 'Light Masters',
      available: true
    },
    {
      id: 6,
      name: 'Carbon Fiber Tripod',
      description: 'Lightweight professional tripod with excellent stability',
      dailyRate: 600,
      location: 'Chennai',
      rating: 4.9,
      reviews: 28,
      imageUrl: 'https://picsum.photos/300/200?random=6',
      owner: 'Gear Hub',
      available: true
    }
  ];

  const filteredItems = mockItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Breadcrumbs */}
        <Breadcrumbs
          separator={<NavigateNext fontSize="small" />}
          sx={{ mb: 4 }}
        >
          <Link component={RouterLink} to="/" underline="hover" color="inherit">
            Home
          </Link>
          <Link component={RouterLink} to="/categories" underline="hover" color="inherit">
            Categories
          </Link>
          <Typography color="text.primary">{currentCategory.name}</Typography>
        </Breadcrumbs>

        {/* Category Header */}
        <Box sx={{ mb: 6 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Box sx={{ color: 'primary.main', mr: 2, fontSize: '3rem' }}>
              {currentCategory.icon}
            </Box>
            <Box>
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                {currentCategory.name}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                {currentCategory.description}
              </Typography>
              <Chip
                label={`${currentCategory.totalItems} items available`}
                color="primary"
                variant="outlined"
              />
            </Box>
          </Box>
        </Box>

        {/* Subcategories */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
            Browse Subcategories
          </Typography>
          <Grid container spacing={2}>
            {currentCategory.subcategories.map((subcat, index) => (
              <Grid item xs={6} sm={4} md={2.4} key={index}>
                <Card
                  elevation={1}
                  sx={{
                    p: 2,
                    textAlign: 'center',
                    cursor: 'pointer',
                    borderRadius: 2,
                    '&:hover': {
                      elevation: 3,
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    {subcat.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {subcat.count} items
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Grid container spacing={4}>
          {/* Filters Sidebar */}
          <Grid item xs={12} md={3}>
            <Paper elevation={1} sx={{ p: 3, borderRadius: 2, position: 'sticky', top: 24 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, display: 'flex', alignItems: 'center' }}>
                <FilterList sx={{ mr: 1 }} />
                Filters
              </Typography>

              <Stack spacing={3}>
                {/* Search */}
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                  }}
                />

                <Divider />

                {/* Sort By */}
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Sort By"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <MenuItem value="relevance">Relevance</MenuItem>
                  <MenuItem value="price-low">Price: Low to High</MenuItem>
                  <MenuItem value="price-high">Price: High to Low</MenuItem>
                  <MenuItem value="rating">Rating</MenuItem>
                  <MenuItem value="newest">Newest First</MenuItem>
                </TextField>

                {/* Price Range */}
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Price Range"
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                >
                  <MenuItem value="all">All Prices</MenuItem>
                  <MenuItem value="0-500">₹0 - ₹500</MenuItem>
                  <MenuItem value="500-1000">₹500 - ₹1,000</MenuItem>
                  <MenuItem value="1000-2000">₹1,000 - ₹2,000</MenuItem>
                  <MenuItem value="2000+">₹2,000+</MenuItem>
                </TextField>

                {/* Location */}
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Location"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                >
                  <MenuItem value="all">All Cities</MenuItem>
                  <MenuItem value="mumbai">Mumbai</MenuItem>
                  <MenuItem value="delhi">Delhi</MenuItem>
                  <MenuItem value="bangalore">Bangalore</MenuItem>
                  <MenuItem value="pune">Pune</MenuItem>
                  <MenuItem value="chennai">Chennai</MenuItem>
                </TextField>
              </Stack>
            </Paper>
          </Grid>

          {/* Items Grid */}
          <Grid item xs={12} md={9}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
              <Typography variant="h6">
                {filteredItems.length} items found
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Sort />
                <Typography variant="body2" color="text.secondary">
                  Sorted by {sortBy}
                </Typography>
              </Box>
            </Box>

            <Grid container spacing={3}>
              {filteredItems.map((item) => (
                <Grid item xs={12} sm={6} lg={4} key={item.id}>
                  <Card
                    elevation={2}
                    sx={{
                      borderRadius: 3,
                      overflow: 'hidden',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.12)',
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <Box sx={{ position: 'relative' }}>
                      <CardMedia
                        component="img"
                        height="200"
                        image={item.imageUrl}
                        alt={item.name}
                      />
                      <Chip
                        label={item.available ? 'Available' : 'Booked'}
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 12,
                          left: 12,
                          backgroundColor: item.available ? 'success.main' : 'error.main',
                          color: 'white',
                          fontWeight: 600
                        }}
                      />
                    </Box>
                    <CardContent sx={{ p: 3 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                        {item.name}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.5 }}>
                        {item.description}
                      </Typography>
                      
                      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                        <Star sx={{ color: 'warning.main', fontSize: '1.2rem' }} />
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {item.rating}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          ({item.reviews} reviews)
                        </Typography>
                      </Stack>

                      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                        <LocationOn sx={{ color: 'text.secondary', fontSize: '1.2rem' }} />
                        <Typography variant="body2" color="text.secondary">
                          {item.location}
                        </Typography>
                      </Stack>

                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        By {item.owner}
                      </Typography>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                          ₹{item.dailyRate}/day
                        </Typography>
                        <Button
                          component={RouterLink}
                          to={`/item/${item.id}`}
                          variant="contained"
                          size="small"
                          disabled={!item.available}
                          sx={{ borderRadius: 2 }}
                        >
                          {item.available ? 'View Details' : 'Unavailable'}
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {filteredItems.length === 0 && (
              <Box textAlign="center" sx={{ py: 8 }}>
                <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                  No items found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Try adjusting your search filters or browse other categories.
                </Typography>
              </Box>
            )}
          </Grid>
        </Grid>
      </Container>
      <Footer />
    </>
  );
};

export default CategoryDetailPage;