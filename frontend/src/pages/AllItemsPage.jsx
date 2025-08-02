import React, { useState, useEffect } from 'react';
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

const AllItemsPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [wishlistedItems, setWishlistedItems] = useState(new Set());
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchAllItems();
  }, []);

  const fetchAllItems = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get('/api/items');
      setItems(response.data || []);
    } catch (err) {
      console.error('Error fetching items:', err);
      setError('Failed to load items');
      // Fallback to mock data
      setItems(getMockItems());
    } finally {
      setLoading(false);
    }
  };

  const getMockItems = () => [
    {
      id: '1',
      name: 'Canon EOS R5 Camera',
      description: 'Professional full-frame mirrorless camera with 45MP sensor',
      dailyRate: 2500,
      imageUrl: 'https://picsum.photos/400/300?random=1',
      status: 'available'
    },
    {
      id: '2',
      name: 'MacBook Pro 16-inch',
      description: 'M1 Pro chip with 16GB RAM and 512GB SSD',
      dailyRate: 1200,
      imageUrl: 'https://picsum.photos/400/300?random=2',
      status: 'available'
    },
    {
      id: '3',
      name: 'Mountain Bike',
      description: 'High-quality mountain bike suitable for all terrains',
      dailyRate: 400,
      imageUrl: 'https://picsum.photos/400/300?random=3',
      status: 'available'
    },
    {
      id: '4',
      name: 'PlayStation 5',
      description: 'Latest gaming console with multiple games',
      dailyRate: 600,
      imageUrl: 'https://picsum.photos/400/300?random=4',
      status: 'available'
    },
    {
      id: '5',
      name: 'DJI Mavic Air 2 Drone',
      description: '4K camera drone with 34-minute flight time',
      dailyRate: 1800,
      imageUrl: 'https://picsum.photos/400/300?random=5',
      status: 'available'
    },
    {
      id: '6',
      name: 'Professional DSLR Camera',
      description: 'High-end DSLR with multiple lenses included',
      dailyRate: 2200,
      imageUrl: 'https://picsum.photos/400/300?random=6',
      status: 'available'
    }
  ];

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

  const handleSearch = (searchTerm) => {
    // Filter items based on search term
    const filtered = items.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setItems(filtered);
  };

  const handleFilter = async (filters) => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== '' && value !== 'all') {
          queryParams.append(key, value);
        }
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
            Loading all items...
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header */}
      <Container maxWidth="xl" sx={{ py: 6 }}>
        <Box textAlign="center">
          <Typography variant="h2" sx={{ fontWeight: 700, mb: 2 }}>
            All Items
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
            Browse our complete collection of rental items
          </Typography>
        </Box>
      </Container>

      {/* Search and Filter */}
      <SearchAndFilter 
        onSearch={handleSearch}
        onFilter={handleFilter}
        isOpen={showFilters}
        onToggle={() => setShowFilters(!showFilters)}
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
              No items found
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Try adjusting your search or filters.
            </Typography>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default AllItemsPage;