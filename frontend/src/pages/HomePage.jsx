// frontend/src/pages/HomePage.jsx

import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import {
    Container,
    Grid,
    Typography,
    CircularProgress,
    Box,
    Alert,
    Stack,
    Chip,
    Button,
    Paper
} from '@mui/material';
import { TrendingUp, Category, Star, ShoppingBag } from '@mui/icons-material';
import HeroSection from '../components/HeroSection';
import ModernItemCard from '../components/ModernItemCard';
import SearchAndFilter from '../components/SearchAndFilter';
import TestimonialsSection from '../components/TestimonialsSection';
import Footer from '../components/Footer';

const HomePage = () => {
    const [items, setItems] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [wishlistedItems, setWishlistedItems] = useState(new Set());
    const [showFilters, setShowFilters] = useState(false);

    // Mock data for when API is not available
    const mockItems = [
        {
            id: 1,
            name: "Canon EOS R5 Camera",
            description: "Professional full-frame mirrorless camera with 45MP sensor. Perfect for weddings, events, and professional photography.",
            dailyRate: 2500,
            imageUrl: "https://picsum.photos/400/300?random=1",
            status: "available"
        },
        {
            id: 2,
            name: "DJI Mavic Air 2 Drone",
            description: "4K camera drone with 34-minute flight time. Great for aerial photography and videography projects.",
            dailyRate: 1800,
            imageUrl: "https://picsum.photos/400/300?random=2",
            status: "available"
        },
        {
            id: 3,
            name: "MacBook Pro 16-inch",
            description: "M1 Pro chip with 16GB RAM and 512GB SSD. Perfect for video editing, design work, and development.",
            dailyRate: 1200,
            imageUrl: "https://picsum.photos/400/300?random=3",
            status: "rented"
        },
        {
            id: 4,
            name: "Sony A7III Camera",
            description: "Full-frame mirrorless camera with excellent low-light performance. Includes 24-70mm lens.",
            dailyRate: 2000,
            imageUrl: "https://picsum.photos/400/300?random=4",
            status: "available"
        },
        {
            id: 5,
            name: "iPhone 14 Pro Max",
            description: "Latest iPhone with ProRAW camera and cinematic mode. Perfect for content creation.",
            dailyRate: 800,
            imageUrl: "https://picsum.photos/400/300?random=5",
            status: "available"
        },
        {
            id: 6,
            name: "GoPro Hero 11",
            description: "Action camera with 5.3K video recording. Waterproof and perfect for adventure activities.",
            dailyRate: 500,
            imageUrl: "https://picsum.photos/400/300?random=6",
            status: "available"
        }
    ];

    useEffect(() => {
        const fetchItems = async () => {
            try {
                setLoading(true);
                const res = await axios.get('/api/items');
                setItems(res.data || []);
                setFilteredItems(res.data || []);
                setError(null);
            } catch (err) {
                console.error("Error fetching items:", err);
                // Use mock data when API fails
                setItems(mockItems);
                setFilteredItems(mockItems);
                setError(null);
            } finally {
                setLoading(false);
            }
        };

        fetchItems();
    }, []);

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
        if (!searchTerm) {
            setFilteredItems(items);
            return;
        }
        const filtered = items.filter(item =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredItems(filtered);
    };

    const handleFilter = (filters) => {
        let filtered = [...items];

        // Apply search term
        if (filters.searchTerm) {
            filtered = filtered.filter(item =>
                item.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                item.description.toLowerCase().includes(filters.searchTerm.toLowerCase())
            );
        }

        // Apply price range
        if (filters.priceRange) {
            filtered = filtered.filter(item =>
                item.dailyRate >= filters.priceRange[0] && item.dailyRate <= filters.priceRange[1]
            );
        }

        // Apply availability filter
        if (filters.availability && filters.availability !== 'all') {
            filtered = filtered.filter(item => item.status === filters.availability);
        }

        // Apply sorting
        if (filters.sortBy) {
            switch (filters.sortBy) {
                case 'price-low':
                    filtered.sort((a, b) => a.dailyRate - b.dailyRate);
                    break;
                case 'price-high':
                    filtered.sort((a, b) => b.dailyRate - a.dailyRate);
                    break;
                case 'newest':
                    filtered.sort((a, b) => b.id - a.id);
                    break;
                default:
                    break;
            }
        }

        setFilteredItems(filtered);
    };

    const categories = [
        { name: 'Cameras', icon: '📸', count: 12 },
        { name: 'Electronics', icon: '💻', count: 8 },
        { name: 'Tools', icon: '🔧', count: 15 },
        { name: 'Sports', icon: '⚽', count: 6 },
        { name: 'Music', icon: '🎵', count: 4 },
        { name: 'Gaming', icon: '🎮', count: 7 }
    ];

    const stats = [
        { label: 'Happy Customers', value: '10,000+', icon: <Star /> },
        { label: 'Items Available', value: '50,000+', icon: <ShoppingBag /> },
        { label: 'Categories', value: '100+', icon: <Category /> },
        { label: 'Growth Rate', value: '200%', icon: <TrendingUp /> }
    ];

    if (loading) {
        return (
            <>
                <HeroSection />
                <SearchAndFilter 
                    onSearch={handleSearch}
                    onFilter={handleFilter}
                    isOpen={showFilters}
                    onToggle={() => setShowFilters(!showFilters)}
                />
                <Container maxWidth="xl" sx={{ py: 8 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                        <CircularProgress size={60} />
                    </Box>
                </Container>
                <Footer />
            </>
        );
    }

    if (error) {
        return (
            <>
                <HeroSection />
                <SearchAndFilter 
                    onSearch={handleSearch}
                    onFilter={handleFilter}
                    isOpen={showFilters}
                    onToggle={() => setShowFilters(!showFilters)}
                />
                <Container maxWidth="xl" sx={{ py: 8 }}>
                    <Alert severity="error" sx={{ mt: 4 }}>
                        {error}
                    </Alert>
                </Container>
                <Footer />
            </>
        );
    }

    return (
        <Box sx={{ width: '100%' }}>
            {/* Hero Section */}
            <HeroSection />

            {/* Search and Filter */}
            <SearchAndFilter 
                onSearch={handleSearch}
                onFilter={handleFilter}
                isOpen={showFilters}
                onToggle={() => setShowFilters(!showFilters)}
            />

            {/* Stats Section */}
            <Box sx={{ backgroundColor: 'background.paper', py: 6, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Container maxWidth="xl">
                    <Grid container spacing={4}>
                        {stats.map((stat, index) => (
                            <Grid item xs={6} md={3} key={index}>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 3,
                                        textAlign: 'center',
                                        backgroundColor: 'transparent',
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        borderRadius: 2,
                                        height: '100%'
                                    }}
                                >
                                    <Box sx={{ color: 'primary.main', mb: 1 }}>
                                        {stat.icon}
                                    </Box>
                                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                                        {stat.value}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {stat.label}
                                    </Typography>
                                </Paper>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box>

            {/* Categories Section */}
            <Container maxWidth="xl" sx={{ py: 8 }}>
                <Stack spacing={6}>
                    <Box textAlign="center">
                        <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>
                            Browse by Category
                        </Typography>
                        <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
                            Find exactly what you need from our diverse collection of rental items
                        </Typography>
                    </Box>

                    <Grid container spacing={3}>
                        {categories.map((category, index) => (
                            <Grid item xs={6} sm={4} md={2} key={index}>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 3,
                                        textAlign: 'center',
                                        cursor: 'pointer',
                                        borderRadius: 3,
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        transition: 'all 0.2s ease-in-out',
                                        '&:hover': {
                                            borderColor: 'primary.main',
                                            transform: 'translateY(-4px)',
                                            boxShadow: '0px 10px 15px rgba(0, 0, 0, 0.1), 0px 4px 6px rgba(0, 0, 0, 0.05)',
                                        }
                                    }}
                                >
                                    <Typography variant="h3" sx={{ mb: 1 }}>
                                        {category.icon}
                                    </Typography>
                                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                                        {category.name}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {category.count} items
                                    </Typography>
                                </Paper>
                            </Grid>
                        ))}
                    </Grid>
                </Stack>
            </Container>

            {/* Featured Items Section */}
            <Container maxWidth="xl" sx={{ py: 8 }}>
                <Stack spacing={6}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                        <Box>
                            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                                <Chip
                                    label="TRENDING"
                                    size="small"
                                    sx={{
                                        backgroundColor: 'primary.main',
                                        color: 'white',
                                        fontWeight: 600
                                    }}
                                />
                            </Stack>
                            <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                                Featured Items
                            </Typography>
                            <Typography variant="h6" color="text.secondary">
                                {filteredItems.length > 0 ? `${filteredItems.length} items found` : 'Most popular items in your area'}
                            </Typography>
                        </Box>
                        <Button
                            variant="outlined"
                            size="large"
                            sx={{
                                borderRadius: 2,
                                fontWeight: 600,
                                px: 4
                            }}
                        >
                            View All
                        </Button>
                    </Box>

                    <Grid container spacing={4}>
                        {filteredItems.length > 0 ? filteredItems.map((item) => (
                            <Grid item key={item.id} xs={12} sm={6} lg={4}>
                                <ModernItemCard
                                    item={item}
                                    onWishlistToggle={handleWishlistToggle}
                                    isWishlisted={wishlistedItems.has(item.id)}
                                />
                            </Grid>
                        )) : (
                            <Grid item xs={12}>
                                <Paper
                                    sx={{
                                        p: 8,
                                        textAlign: 'center',
                                        backgroundColor: 'grey.50',
                                        borderRadius: 3
                                    }}
                                >
                                    <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                                        No items found
                                    </Typography>
                                    <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                                        Try adjusting your search or filters to find what you're looking for.
                                    </Typography>
                                    <Button
                                        variant="contained"
                                        size="large"
                                        onClick={() => {
                                            handleSearch('');
                                            handleFilter({});
                                        }}
                                        sx={{ borderRadius: 2, fontWeight: 600, px: 4 }}
                                    >
                                        Clear Filters
                                    </Button>
                                </Paper>
                            </Grid>
                        )}
                    </Grid>
                </Stack>
            </Container>

            {/* Testimonials Section */}
            <TestimonialsSection />

            {/* Footer */}
            <Footer />
        </Box>
    );
};

export default HomePage;