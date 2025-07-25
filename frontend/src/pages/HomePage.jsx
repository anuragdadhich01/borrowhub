// frontend/src/pages/HomePage.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Container,
    Grid,
    Card,
    CardMedia,
    CardContent,
    Typography,
    CircularProgress,
    Box,
    CardActionArea,
    Alert
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const HomePage = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Hardcoded correct URL
    const API_ENDPOINT = 'https://zstkr6r24k.execute-api.us-east-1.amazonaws.com/prod/items';

    useEffect(() => {
        const fetchItems = async () => {
            try {
                setLoading(true);
                const res = await axios.get(API_ENDPOINT);
                const parsedItems = JSON.parse(res.data.body);
                setItems(parsedItems || []);
                setError(null);
            } catch (err) {
                console.error("Error fetching items:", err);
                let errorMessage = "Failed to load items. Please try again later.";
                if (err.response) {
                    errorMessage += ` (Status: ${err.response.status})`;
                }
                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        };

        fetchItems();
    }, [API_ENDPOINT]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Alert severity="error" sx={{ mt: 4 }}>
                {error}
            </Alert>
        );
    }

    return (
        <Container maxWidth="lg">
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', mb: 4 }}>
                Available Items
            </Typography>
            <Grid container spacing={4}>
                {items.length > 0 ? items.map((item) => (
                    <Grid item key={item.id} xs={12} sm={6} md={4}>
                        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 2, boxShadow: 3 }}>
                            <CardActionArea component={RouterLink} to={`/item/${item.id}`}>
                                <CardMedia
                                    component="img"
                                    height="160"
                                    image={item.imageUrl || `https://placehold.co/600x400/556cd6/white?text=${item.name.replace(/\s/g, '+')}`}
                                    alt={item.name}
                                />
                                <CardContent>
                                    <Typography gutterBottom variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
                                        {item.name}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {item.description}
                                    </Typography>
                                    <Typography variant="h6" component="p" sx={{ mt: 2 }}>
                                        ₹{item.dailyRate} / day
                                    </Typography>
                                </CardContent>
                            </CardActionArea>
                        </Card>
                    </Grid>
                )) : (
                    <Typography sx={{ mt: 4, width: '100%', textAlign: 'center' }}>
                        No items have been listed yet. Be the first!
                    </Typography>
                )}
            </Grid>
        </Container>
    );
};

export default HomePage;