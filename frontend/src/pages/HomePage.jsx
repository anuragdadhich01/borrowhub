// frontend/src/pages/HomePage.jsx

import React, { useState, useEffect } from 'react';
import axios, { switchToLocalhost, getApiStatus } from '../api/axios';
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
    Paper,
    AlertTitle
} from '@mui/material';
import { TrendingUp, Category, Star, ShoppingBag, Refresh, Warning } from '@mui/icons-material';
import HeroSection from '../components/HeroSection';
import ModernItemCard from '../components/ModernItemCard';
import SearchAndFilter from '../components/SearchAndFilter';
import TestimonialsSection from '../components/TestimonialsSection';
import Footer from '../components/Footer';
import NetworkStatus from '../components/NetworkStatus';

const HomePage = () => {
    const [items, setItems] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [wishlistedItems, setWishlistedItems] = useState(new Set());
    const [showFilters, setShowFilters] = useState(false);
    const [isUsingMockData, setIsUsingMockData] = useState(false);
    const [retryCount, setRetryCount] = useState(0);
    const [apiStatus, setApiStatus] = useState(null);

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
        fetchItems();
        // Update API status
        setApiStatus(getApiStatus());
    }, []);

    const fetchItems = async (showLoadingState = true) => {
        try {
            if (showLoadingState) {
                setLoading(true);
            }
            setError(null);
            
            const res = await axios.get('/api/items');
            setItems(res.data || []);
            setFilteredItems(res.data || []);
            setIsUsingMockData(false);
            setRetryCount(0);
            
        } catch (err) {
            console.error("Error fetching items:", err);
            
            // Use mock data when API fails
            setItems(mockItems);
            setFilteredItems(mockItems);
            setIsUsingMockData(true);
            
            // Set user-friendly error message
            if (err.isNetworkError) {
                setError({
                    message: err.userMessage || 'Unable to connect to the server. Please check your internet connection.',
                    type: 'network',
                    canRetry: true
                });
            } else if (err.isServerError) {
                setError({
                    message: err.userMessage || 'Server is temporarily unavailable. Please try again later.',
                    type: 'server',
                    canRetry: true
                });
            } else {
                setError({
                    message: err.userMessage || 'Unable to load items. Please try again.',
                    type: 'general',
                    canRetry: true
                });
            }
        } finally {
            if (showLoadingState) {
                setLoading(false);
            }
        }
    };

    const handleRetry = () => {
        setRetryCount(prev => prev + 1);
        setApiStatus(getApiStatus());
        fetchItems(true);
    };

    const handleSwitchToLocalhost = () => {
        switchToLocalhost();
        setApiStatus(getApiStatus());
        setRetryCount(prev => prev + 1);
        fetchItems(true);
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

    const handleSearch = (searchTerm) => {
        // Apply current filters along with search
        const currentFilters = {
            searchTerm: searchTerm,
            // Preserve other active filters if any
        };
        applyFilters(currentFilters);
    };

    const handleFilter = (filters) => {
        applyFilters(filters);
    };

    const applyFilters = (filters) => {
        let filtered = [...items];

        // Apply search term
        if (filters.searchTerm && filters.searchTerm.trim()) {
            const searchLower = filters.searchTerm.toLowerCase();
            filtered = filtered.filter(item =>
                item.name?.toLowerCase().includes(searchLower) ||
                item.description?.toLowerCase().includes(searchLower) ||
                item.title?.toLowerCase().includes(searchLower) // Backward compatibility
            );
        }

        // Apply category filter
        if (filters.category && filters.category !== '') {
            // Map category to item properties - this would be enhanced with actual category field in items
            const categoryKeywords = {
                'cameras': ['camera', 'dslr', 'photography', 'photo'],
                'electronics': ['electronics', 'laptop', 'phone', 'computer', 'macbook', 'iphone'],
                'tools': ['tool', 'drill', 'hammer', 'equipment'],
                'sports': ['bike', 'bicycle', 'sports', 'fitness'],
                'gaming': ['game', 'gaming', 'console', 'xbox', 'playstation'],
                'music': ['music', 'audio', 'speaker', 'headphone']
            };
            
            const keywords = categoryKeywords[filters.category] || [];
            if (keywords.length > 0) {
                filtered = filtered.filter(item => {
                    const itemText = `${item.name} ${item.description}`.toLowerCase();
                    return keywords.some(keyword => itemText.includes(keyword));
                });
            }
        }

        // Apply price range filter
        if (filters.priceRange && filters.priceRange.length === 2) {
            filtered = filtered.filter(item => {
                const price = item.dailyRate || item.price || 0;
                return price >= filters.priceRange[0] && price <= filters.priceRange[1];
            });
        }

        // Apply availability filter
        if (filters.availability && filters.availability !== 'all') {
            if (filters.availability === 'available') {
                filtered = filtered.filter(item => item.available !== false);
            } else if (filters.availability === 'coming-soon') {
                filtered = filtered.filter(item => item.available === false);
            }
        }

        // Apply location filter (basic text matching)
        if (filters.location && filters.location.trim()) {
            const locationLower = filters.location.toLowerCase();
            // For now, we'll filter based on a simple location match
            // In a real app, this would use proper location/distance filtering
            filtered = filtered.filter(item => {
                // Mock location data - in real app this would come from item data
                return ['mumbai', 'delhi', 'bangalore', 'pune'].some(city => 
                    city.includes(locationLower) || locationLower.includes(city)
                );
            });
        }

        // Apply minimum rating filter
        if (filters.rating && filters.rating > 0) {
            filtered = filtered.filter(item => {
                // Mock rating - in real app this would come from reviews
                const mockRating = 4.5; // All items have good rating for demo
                return mockRating >= filters.rating;
            });
        }

        // Apply verified owners only filter
        if (filters.verifiedOnly) {
            // All items are from verified owners in this demo
            // In real app, this would filter based on owner verification status
        }

        // Apply sorting
        if (filters.sortBy) {
            switch (filters.sortBy) {
                case 'price-low':
                    filtered.sort((a, b) => (a.dailyRate || a.price || 0) - (b.dailyRate || b.price || 0));
                    break;
                case 'price-high':
                    filtered.sort((a, b) => (b.dailyRate || b.price || 0) - (a.dailyRate || a.price || 0));
                    break;
                case 'newest':
                    filtered.sort((a, b) => (parseInt(b.id) || 0) - (parseInt(a.id) || 0));
                    break;
                case 'rating':
                    // Sort by rating (mock data - all items have same rating for demo)
                    filtered.sort((a, b) => 0); // No actual sorting since all have same rating
                    break;
                case 'distance':
                    // Sort by distance (mock data)
                    filtered.sort((a, b) => Math.random() - 0.5); // Random for demo
                    break;
                case 'relevance':
                default:
                    // Keep current order for relevance
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
                <NetworkStatus onRetry={() => fetchItems(false)} />
                <HeroSection />
                <SearchAndFilter 
                    onSearch={handleSearch}
                    onFilter={handleFilter}
                    isOpen={showFilters}
                    onToggle={() => setShowFilters(!showFilters)}
                />
                <Container maxWidth="xl" sx={{ py: 8 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 4 }}>
                        <CircularProgress size={60} />
                        <Typography variant="body1" sx={{ mt: 2 }} color="text.secondary">
                            Loading available items...
                        </Typography>
                    </Box>
                </Container>
                <Footer />
            </>
        );
    }

    return (
        <Box sx={{ width: '100%' }}>
            {/* Network Status Monitor */}
            <NetworkStatus onRetry={() => fetchItems(false)} />
            
            {/* API Status Indicator */}
            {apiStatus?.usingFallback && (
                <Container maxWidth="xl" sx={{ pt: 2 }}>
                    <Alert severity="info" sx={{ mb: 2 }}>
                        <AlertTitle>Using Local Backend</AlertTitle>
                        Currently connected to localhost backend due to AWS service outage.
                        <Typography variant="body2" sx={{ mt: 1 }}>
                            API Endpoint: {apiStatus.baseURL}
                        </Typography>
                    </Alert>
                </Container>
            )}

            {/* Error Alert for API issues */}
            {error && (
                <Container maxWidth="xl" sx={{ pt: 2 }}>
                    <Alert 
                        severity={error.type === 'network' ? 'error' : 'warning'} 
                        sx={{ mb: 2 }}
                        icon={<Warning />}
                        action={
                            <Stack direction="row" spacing={1}>
                                {error.canRetry && (
                                    <Button
                                        color="inherit"
                                        size="small"
                                        onClick={handleRetry}
                                        startIcon={<Refresh />}
                                    >
                                        Retry
                                    </Button>
                                )}
                                {error.type === 'network' && !apiStatus?.usingFallback && (
                                    <Button
                                        color="inherit"
                                        size="small"
                                        onClick={handleSwitchToLocalhost}
                                        variant="outlined"
                                    >
                                        Use Local Backend
                                    </Button>
                                )}
                            </Stack>
                        }
                    >
                        <AlertTitle>
                            {error.type === 'network' ? 'Connection Problem' : 'Service Issue'}
                        </AlertTitle>
                        {error.message}
                        {isUsingMockData && (
                            <Box sx={{ mt: 1 }}>
                                <Typography variant="body2">
                                    Showing sample items while the service is unavailable.
                                </Typography>
                            </Box>
                        )}
                    </Alert>
                </Container>
            )}

            {/* Mock Data Notice */}
            {isUsingMockData && !error && (
                <Container maxWidth="xl" sx={{ pt: 2 }}>
                    <Alert severity="info" sx={{ mb: 2 }}>
                        <AlertTitle>Demo Mode</AlertTitle>
                        Currently showing sample items. Some features may be limited.
                        <Button
                            color="inherit"
                            size="small"
                            onClick={handleRetry}
                            startIcon={<Refresh />}
                            sx={{ ml: 2 }}
                        >
                            Try to connect
                        </Button>
                    </Alert>
                </Container>
            )}

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