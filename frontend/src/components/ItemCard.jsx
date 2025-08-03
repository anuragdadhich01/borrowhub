import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box 
} from '@mui/material';
import LazyImage from './LazyImage';

const ItemCard = React.memo(({ item }) => {
  return (
    <Card 
      component={Link} 
      to={`/item/${item._id}`} 
      sx={{ 
        textDecoration: 'none',
        color: 'inherit',
        margin: 2,
        maxWidth: 300,
        boxShadow: 2,
        '&:hover': {
          boxShadow: 4,
          transform: 'translateY(-2px)',
        },
        transition: 'all 0.3s ease-in-out'
      }}
    >
      <LazyImage
        src={item.imageUrl}
        alt={item.name}
        height={200}
      />
      <CardContent>
        <Typography 
          variant="h6" 
          component="h3" 
          sx={{ 
            mb: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}
        >
          {item.name}
        </Typography>
        <Typography 
          variant="h6" 
          color="primary" 
          sx={{ fontWeight: 'bold' }}
        >
          ₹{item.dailyRate} / day
        </Typography>
      </CardContent>
    </Card>
  );
});

ItemCard.displayName = 'ItemCard';

export default ItemCard;