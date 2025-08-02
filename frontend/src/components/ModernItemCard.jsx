import React from 'react';
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Box,
  IconButton,
  Chip,
  Stack,
  Rating,
  Avatar
} from '@mui/material';
import {
  FavoriteBorder,
  Favorite,
  LocationOn,
  Verified,
  Star
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';

const ModernItemCard = ({ item, onWishlistToggle, isWishlisted = false }) => {
  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onWishlistToggle) {
      onWishlistToggle(item.id);
    }
  };

  // Mock data for demonstration
  const mockRating = 4.5;
  const mockReviews = Math.floor(Math.random() * 50) + 5;
  const mockDistance = `${Math.floor(Math.random() * 10) + 1} km away`;
  const mockOwnerName = "John D.";
  const isVerified = Math.random() > 0.3;

  return (
    <Card
      component={RouterLink}
      to={`/item/${item.id}`}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        textDecoration: 'none',
        position: 'relative',
        overflow: 'hidden',
        '&:hover': {
          '& .item-image': {
            transform: 'scale(1.05)',
          },
          '& .item-content': {
            transform: 'translateY(-4px)',
          }
        }
      }}
    >
      {/* Wishlist Button */}
      <IconButton
        onClick={handleWishlistClick}
        sx={{
          position: 'absolute',
          top: 12,
          right: 12,
          zIndex: 2,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          width: 36,
          height: 36,
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 1)',
            transform: 'scale(1.1)',
          }
        }}
      >
        {isWishlisted ? (
          <Favorite sx={{ color: 'error.main', fontSize: '1.2rem' }} />
        ) : (
          <FavoriteBorder sx={{ color: 'text.secondary', fontSize: '1.2rem' }} />
        )}
      </IconButton>

      {/* Item Image */}
      <Box sx={{ position: 'relative', overflow: 'hidden' }}>
        <CardMedia
          component="img"
          height="200"
          image={item.imageUrl || `https://picsum.photos/400/300?random=${item.id}`}
          alt={item.name}
          className="item-image"
          sx={{
            transition: 'transform 0.3s ease-in-out',
            objectFit: 'cover'
          }}
        />
        
        {/* Status Badge */}
        <Chip
          label={item.status === 'available' ? 'Available' : 'Rented'}
          size="small"
          sx={{
            position: 'absolute',
            top: 12,
            left: 12,
            backgroundColor: item.status === 'available' ? 'success.main' : 'warning.main',
            color: 'white',
            fontWeight: 600,
            fontSize: '0.75rem'
          }}
        />
      </Box>

      {/* Card Content */}
      <CardContent
        className="item-content"
        sx={{
          flexGrow: 1,
          p: 2,
          transition: 'transform 0.2s ease-in-out',
          display: 'flex',
          flexDirection: 'column',
          gap: 1
        }}
      >
        {/* Item Name and Price */}
        <Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              fontSize: '1.1rem',
              lineHeight: 1.3,
              mb: 0.5,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {item.name}
          </Typography>
          
          <Typography
            variant="h6"
            sx={{
              color: 'primary.main',
              fontWeight: 700,
              fontSize: '1.25rem'
            }}
          >
            ₹{item.dailyRate}
            <Typography
              component="span"
              variant="body2"
              sx={{ color: 'text.secondary', fontWeight: 400, ml: 0.5 }}
            >
              /day
            </Typography>
          </Typography>
        </Box>

        {/* Description */}
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            lineHeight: 1.4,
            mb: 1
          }}
        >
          {item.description}
        </Typography>

        {/* Rating and Reviews */}
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
          <Rating
            value={mockRating}
            precision={0.1}
            size="small"
            readOnly
            sx={{
              '& .MuiRating-iconFilled': {
                color: '#fbbf24',
              }
            }}
          />
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
            {mockRating} ({mockReviews})
          </Typography>
        </Stack>

        {/* Owner and Location */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 'auto' }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Avatar sx={{ width: 24, height: 24, fontSize: '0.875rem' }}>
              {mockOwnerName.charAt(0)}
            </Avatar>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
              {mockOwnerName}
            </Typography>
            {isVerified && (
              <Verified sx={{ fontSize: '1rem', color: 'success.main' }} />
            )}
          </Stack>
          
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <LocationOn sx={{ fontSize: '1rem', color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {mockDistance}
            </Typography>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default ModernItemCard;