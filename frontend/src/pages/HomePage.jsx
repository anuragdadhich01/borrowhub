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
  CardActionArea
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const HomePage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // IMPORTANT: Replace this with the API URL from your `sam deploy` output
  const API_ENDPOINT = 'https://0dpjtt6ee7.execute-api.us-east-1.amazonaws.com/prod/items';

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        const res = await axios.get(API_ENDPOINT);
        
        // The data from the Go backend is a JSON string in the body, so we parse it.
        const parsedItems = JSON.parse(res.data.body);
        setItems(parsedItems);
        setError(null);
      } catch (err) {
        console.error("Error fetching items:", err);
        setError("Failed to load items. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography color="error" align="center">
        {error}
      </Typography>
    );
  }

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', mb: 4 }}>
        Available Items
      </Typography>
      <Grid container spacing={4}>
        {items.map((item) => (
          <Grid item key={item.id} xs={12} sm={6} md={4}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 2, boxShadow: 3 }}>
              <CardActionArea component={RouterLink} to={`/item/${item.id}`}>
                <CardMedia
                  component="img"
                  height="160"
                  // Using a placeholder image based on the item name
                  image={`https://placehold.co/600x400/556cd6/white?text=${item.Name.replace(/\s/g, '+')}`}
                  alt={item.Name}
                />
                <CardContent>
                  <Typography gutterBottom variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
                    {item.Name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {/* Placeholder description */}
                    This is a great item available for rent. Click to see more details.
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default HomePage;
