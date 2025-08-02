import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  CircularProgress,
  Alert
} from '@mui/material';
import axios from '../api/axios';
import ModernItemCard from '../components/ModernItemCard';
import SearchAndFilter from '../components/SearchAndFilter';

const CategoryPage = () => {
  const { category } = useParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [wishlistedItems, setWishlistedItems] = useState(new Set());

  const categoryInfo = {
    cameras: {
      title: 'Cameras & Photography',
      description: 'Professional cameras, lenses, and photography equipment for all your creative needs',
      icon: '📸'
    },
    electronics: {
      title: 'Electronics',
      description: 'Laptops, phones, gaming consoles, and other electronic devices',
      icon: '💻'
    },
    tools: {
      title: 'Tools & Equipment',
      description: 'Power tools, hand tools, and equipment for all your projects',
      icon: '🔧'
    },
    sports: {
      title: 'Sports & Outdoor',
      description: 'Sports equipment, bikes, and outdoor gear for active lifestyles',
      icon: '⚽'
    },
    music: {
      title: 'Music & Audio',
      description: 'Musical instruments, audio equipment, and sound systems',
      icon: '🎵'
    },
    gaming: {
      title: 'Gaming',
      description: 'Gaming consoles, accessories, and entertainment systems',
      icon: '🎮'
    }
  };

  const currentCategory = categoryInfo[category] || {
    title: category?.charAt(0).toUpperCase() + category?.slice(1) || 'Category',
    description: 'Browse items in this category',
    icon: '📦'
  };

  useEffect(() => {
    fetchCategoryItems();
  }, [category]);

  const fetchCategoryItems = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`/api/items?category=${category}`);
      setItems(response.data || []);
    } catch (err) {
      console.error('Error fetching category items:', err);
      setError('Failed to load items for this category');
      // Fallback to mock data based on category
      setItems(getMockItemsForCategory(category));
    } finally {
      setLoading(false);
    }
  };

  const getMockItemsForCategory = (categoryName) => {
    const mockItems = {
      cameras: [
        {
          id: 'cam1',
          name: 'Canon EOS R5 Camera',
          description: 'Professional full-frame mirrorless camera with 45MP sensor',
          dailyRate: 2500,
          imageUrl: 'https://picsum.photos/400/300?random=1',
          status: 'available'
        },
        {
          id: 'cam2',
          name: 'Sony A7III Camera',
          description: 'Full-frame mirrorless camera with excellent low-light performance',
          dailyRate: 2000,
          imageUrl: 'https://picsum.photos/400/300?random=2',
          status: 'available'
        }
      ],
      electronics: [
        {
          id: 'elec1',
          name: 'MacBook Pro 16-inch',
          description: 'M1 Pro chip with 16GB RAM and 512GB SSD',
          dailyRate: 1200,
          imageUrl: 'https://picsum.photos/400/300?random=3',
          status: 'available'
        },
        {
          id: 'elec2',
          name: 'iPhone 14 Pro Max',
          description: 'Latest iPhone with ProRAW camera and cinematic mode',
          dailyRate: 800,
          imageUrl: 'https://picsum.photos/400/300?random=4',
          status: 'available'
        }
      ],
      tools: [
        {
          id: 'tool1',
          name: 'Drill Machine Set',
          description: 'Professional cordless drill with multiple bits',
          dailyRate: 300,
          imageUrl: 'https://picsum.photos/400/300?random=5',
          status: 'available'
        }
      ],
      sports: [
        {
          id: 'sport1',
          name: 'Mountain Bike',
          description: 'High-quality mountain bike suitable for all terrains',
          dailyRate: 400,
          imageUrl: 'https://picsum.photos/400/300?random=6',
          status: 'available'
        }
      ],
      music: [
        {
          id: 'music1',
          name: 'Acoustic Guitar',
          description: 'Professional acoustic guitar for performances',
          dailyRate: 200,
          imageUrl: 'https://picsum.photos/400/300?random=7',
          status: 'available'
        }
      ],
      gaming: [
        {
          id: 'game1',
          name: 'PlayStation 5',
          description: 'Latest gaming console with multiple games',
          dailyRate: 600,
          imageUrl: 'https://picsum.photos/400/300?random=8',
          status: 'available'
        }
      ]
    };
    
    return mockItems[categoryName] || [];
  };

  const handleWishlistToggle = (itemId) => {
    setWishlistedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const handleFilter = async (filters) => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        category: category,
        ...filters
      });
      
      const response = await axios.get(`/api/items?${queryParams.toString()}`);
      setItems(response.data || []);
    } catch (err) {
      console.error('Error filtering items:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 8 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 4 }}>
          <CircularProgress size={60} />
          <Typography variant="body1" sx={{ mt: 2 }} color="text.secondary">
            Loading {currentCategory.title.toLowerCase()}...
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      {/* Category Header */}
      <Container maxWidth="xl" sx={{ py: 6 }}>
        <Box textAlign="center">
          <Typography variant="h1" sx={{ fontSize: '4rem', mb: 2 }}>
            {currentCategory.icon}
          </Typography>
          <Typography variant="h2" sx={{ fontWeight: 700, mb: 2 }}>
            {currentCategory.title}
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
            {currentCategory.description}
          </Typography>
        </Box>
      </Container>

      {/* Search and Filter */}
      <SearchAndFilter 
        onFilter={handleFilter}
        isOpen={false}
        onToggle={() => {}}
      />

      {/* Error Alert */}
      {error && (
        <Container maxWidth="xl" sx={{ pt: 2 }}>
          <Alert severity="warning" sx={{ mb: 2 }}>
            {error}. Showing sample items for demonstration.
          </Alert>
        </Container>
      )}

      {/* Items Grid */}
      <Container maxWidth="xl" sx={{ py: 6 }}>
        {items.length > 0 ? (
          <>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 4 }}>
              {items.length} items available
            </Typography>
            <Grid container spacing={4}>
              {items.map((item) => (
                <Grid item key={item.id} xs={12} sm={6} lg={4}>
                  <ModernItemCard
                    item={item}
                    onWishlistToggle={handleWishlistToggle}
                    isWishlisted={wishlistedItems.has(item.id)}
                  />
                </Grid>
              ))}
            </Grid>
          </>
        ) : (
          <Box textAlign="center" sx={{ py: 8 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
              No items found in this category
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Try browsing other categories or check back later.
            </Typography>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default CategoryPage;