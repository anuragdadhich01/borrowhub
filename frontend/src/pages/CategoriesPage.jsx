import React, { useState } from 'react';
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
  IconButton
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
  TrendingUp,
  ArrowForward
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import Footer from '../components/Footer';

const CategoriesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const categories = [
    {
      id: 1,
      name: 'Cameras & Photography',
      slug: 'cameras',
      description: 'Professional cameras, lenses, lighting, and photography equipment',
      icon: <PhotoCamera />,
      itemCount: '1,250+',
      averagePrice: '₹2,500/day',
      image: 'https://picsum.photos/400/250?random=1',
      trending: true,
      subcategories: ['DSLR Cameras', 'Mirrorless Cameras', 'Lenses', 'Lighting', 'Tripods', 'Action Cameras']
    },
    {
      id: 2,
      name: 'Electronics',
      slug: 'electronics',
      description: 'Laptops, gaming consoles, tablets, and electronic gadgets',
      icon: <Devices />,
      itemCount: '2,100+',
      averagePrice: '₹1,800/day',
      image: 'https://picsum.photos/400/250?random=2',
      trending: true,
      subcategories: ['Laptops', 'Gaming Consoles', 'Tablets', 'Smartphones', 'Smart TVs', 'Audio Systems']
    },
    {
      id: 3,
      name: 'Tools & Equipment',
      slug: 'tools',
      description: 'Power tools, construction equipment, and professional machinery',
      icon: <Build />,
      itemCount: '850+',
      averagePrice: '₹1,200/day',
      image: 'https://picsum.photos/400/250?random=3',
      trending: false,
      subcategories: ['Power Tools', 'Hand Tools', 'Construction Equipment', 'Measuring Tools', 'Safety Equipment']
    },
    {
      id: 4,
      name: 'Sports & Outdoor',
      slug: 'sports',
      description: 'Sports equipment, outdoor gear, and adventure accessories',
      icon: <SportsBaseball />,
      itemCount: '1,500+',
      averagePrice: '₹800/day',
      image: 'https://picsum.photos/400/250?random=4',
      trending: true,
      subcategories: ['Fitness Equipment', 'Camping Gear', 'Water Sports', 'Cycling', 'Adventure Sports']
    },
    {
      id: 5,
      name: 'Music & Audio',
      slug: 'music',
      description: 'Musical instruments, audio equipment, and recording gear',
      icon: <MusicNote />,
      itemCount: '600+',
      averagePrice: '₹1,500/day',
      image: 'https://picsum.photos/400/250?random=5',
      trending: false,
      subcategories: ['Instruments', 'Audio Equipment', 'Recording Gear', 'DJ Equipment', 'Speakers']
    },
    {
      id: 6,
      name: 'Home & Garden',
      slug: 'home',
      description: 'Home appliances, garden tools, and household equipment',
      icon: <Home />,
      itemCount: '900+',
      averagePrice: '₹600/day',
      image: 'https://picsum.photos/400/250?random=6',
      trending: false,
      subcategories: ['Home Appliances', 'Garden Tools', 'Cleaning Equipment', 'Furniture', 'Decor']
    },
    {
      id: 7,
      name: 'Automotive',
      slug: 'automotive',
      description: 'Car accessories, tools, and automotive equipment',
      icon: <DirectionsCar />,
      itemCount: '400+',
      averagePrice: '₹1,000/day',
      image: 'https://picsum.photos/400/250?random=7',
      trending: false,
      subcategories: ['Car Accessories', 'Diagnostic Tools', 'Cleaning Supplies', 'Performance Parts']
    },
    {
      id: 8,
      name: 'Education & Office',
      slug: 'education',
      description: 'Educational materials, office equipment, and learning tools',
      icon: <School />,
      itemCount: '550+',
      averagePrice: '₹500/day',
      image: 'https://picsum.photos/400/250?random=8',
      trending: false,
      subcategories: ['Office Equipment', 'Educational Tools', 'Presentation Equipment', 'Books', 'Stationery']
    },
    {
      id: 9,
      name: 'Fitness & Health',
      slug: 'fitness',
      description: 'Gym equipment, fitness accessories, and health devices',
      icon: <FitnessCenter />,
      itemCount: '750+',
      averagePrice: '₹700/day',
      image: 'https://picsum.photos/400/250?random=9',
      trending: true,
      subcategories: ['Cardio Equipment', 'Strength Training', 'Yoga & Pilates', 'Health Monitors', 'Supplements']
    },
    {
      id: 10,
      name: 'Party & Events',
      slug: 'party',
      description: 'Party supplies, event equipment, and celebration accessories',
      icon: <Celebration />,
      itemCount: '450+',
      averagePrice: '₹900/day',
      image: 'https://picsum.photos/400/250?random=10',
      trending: false,
      subcategories: ['Party Decor', 'Sound Systems', 'Lighting', 'Furniture', 'Costumes']
    }
  ];

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const trendingCategories = categories.filter(category => category.trending);

  return (
    <>
      <Container maxWidth="lg" sx={{ py: 8 }}>
        {/* Hero Section */}
        <Box textAlign="center" sx={{ mb: 8 }}>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 700,
              mb: 3,
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Browse Categories
          </Typography>
          <Typography
            variant="h5"
            sx={{ color: 'text.secondary', mb: 4, maxWidth: '600px', mx: 'auto', lineHeight: 1.6 }}
          >
            Find exactly what you need from our wide range of rental categories across India.
          </Typography>

          {/* Search Bar */}
          <Box sx={{ maxWidth: '500px', mx: 'auto', mb: 4 }}>
            <TextField
              fullWidth
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  backgroundColor: 'white',
                  boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.05)',
                }
              }}
            />
          </Box>
        </Box>

        {/* Trending Categories */}
        {!searchTerm && (
          <Box sx={{ mb: 8 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
              <TrendingUp sx={{ color: 'warning.main', mr: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 600 }}>
                Trending Categories
              </Typography>
            </Box>
            <Grid container spacing={3}>
              {trendingCategories.map((category) => (
                <Grid item xs={12} sm={6} md={4} key={category.id}>
                  <Card
                    elevation={3}
                    sx={{
                      borderRadius: 3,
                      overflow: 'hidden',
                      position: 'relative',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: '0px 12px 32px rgba(0, 0, 0, 0.15)',
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <Box sx={{ position: 'relative' }}>
                      <CardMedia
                        component="img"
                        height="200"
                        image={category.image}
                        alt={category.name}
                      />
                      <Chip
                        label="Trending"
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 12,
                          right: 12,
                          backgroundColor: 'warning.main',
                          color: 'white',
                          fontWeight: 600
                        }}
                      />
                    </Box>
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Box sx={{ color: 'primary.main', mr: 1, fontSize: '1.5rem' }}>
                          {category.icon}
                        </Box>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {category.name}
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ mb: 3, lineHeight: 1.6 }}>
                        {category.description}
                      </Typography>
                      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
                        <Typography variant="body2" color="primary.main" sx={{ fontWeight: 500 }}>
                          {category.itemCount} items
                        </Typography>
                        <Typography variant="body2" color="success.main" sx={{ fontWeight: 500 }}>
                          From {category.averagePrice}
                        </Typography>
                      </Stack>
                      <Button
                        component={RouterLink}
                        to={`/category/${category.slug}`}
                        variant="contained"
                        fullWidth
                        endIcon={<ArrowForward />}
                        sx={{
                          borderRadius: 2,
                          textTransform: 'none',
                          fontWeight: 600
                        }}
                      >
                        Explore {category.name}
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* All Categories */}
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 4 }}>
            {searchTerm ? `Search Results (${filteredCategories.length})` : 'All Categories'}
          </Typography>
          <Grid container spacing={4}>
            {filteredCategories.map((category) => (
              <Grid item xs={12} sm={6} md={4} key={category.id}>
                <Card
                  elevation={2}
                  sx={{
                    borderRadius: 3,
                    overflow: 'hidden',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
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
                      height="180"
                      image={category.image}
                      alt={category.name}
                    />
                    {category.trending && (
                      <Chip
                        label="Trending"
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 12,
                          right: 12,
                          backgroundColor: 'warning.main',
                          color: 'white',
                          fontWeight: 600
                        }}
                      />
                    )}
                  </Box>
                  <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Box sx={{ color: 'primary.main', mr: 1, fontSize: '1.5rem' }}>
                        {category.icon}
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {category.name}
                      </Typography>
                    </Box>
                    
                    <Typography variant="body2" sx={{ mb: 3, lineHeight: 1.6, flexGrow: 1 }}>
                      {category.description}
                    </Typography>
                    
                    <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
                      <Typography variant="body2" color="primary.main" sx={{ fontWeight: 500 }}>
                        {category.itemCount} items
                      </Typography>
                      <Typography variant="body2" color="success.main" sx={{ fontWeight: 500 }}>
                        From {category.averagePrice}
                      </Typography>
                    </Stack>

                    {/* Subcategories */}
                    <Box sx={{ mb: 3 }}>
                      <Stack direction="row" flexWrap="wrap" gap={1}>
                        {category.subcategories.slice(0, 3).map((subcat, index) => (
                          <Chip
                            key={index}
                            label={subcat}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: '0.75rem' }}
                          />
                        ))}
                        {category.subcategories.length > 3 && (
                          <Chip
                            label={`+${category.subcategories.length - 3} more`}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: '0.75rem', color: 'text.secondary' }}
                          />
                        )}
                      </Stack>
                    </Box>

                    <Button
                      component={RouterLink}
                      to={`/category/${category.slug}`}
                      variant="outlined"
                      fullWidth
                      endIcon={<ArrowForward />}
                      sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 600,
                        mt: 'auto'
                      }}
                    >
                      Browse {category.name}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {filteredCategories.length === 0 && searchTerm && (
            <Box textAlign="center" sx={{ py: 8 }}>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                No categories found for "{searchTerm}"
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Try searching with different keywords or browse all categories above.
              </Typography>
            </Box>
          )}
        </Box>
      </Container>
      <Footer />
    </>
  );
};

export default CategoriesPage;