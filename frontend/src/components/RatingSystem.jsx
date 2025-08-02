import React, { useState, useEffect } from 'react';
import {
  Box,
  Rating,
  TextField,
  Button,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Grid
} from '@mui/material';
import { 
  Star, 
  StarBorder, 
  Verified, 
  Edit, 
  Delete,
  Image as ImageIcon 
} from '@mui/icons-material';
import axiosInstance from '../api/axios';

// Star Rating Display Component
export const StarRating = ({ value, size = 'medium', showText = true }) => {
  return (
    <Box display="flex" alignItems="center" gap={1}>
      <Rating
        value={value}
        readOnly
        precision={0.1}
        size={size}
        icon={<Star fontSize="inherit" />}
        emptyIcon={<StarBorder fontSize="inherit" />}
      />
      {showText && (
        <Typography variant="body2" color="text.secondary">
          {value ? value.toFixed(1) : '0.0'}
        </Typography>
      )}
    </Box>
  );
};

// Rating Form Component
export const RatingForm = ({ bookingId, itemId, onSuccess, onClose }) => {
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!rating) {
      setError('Please provide a rating');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await axiosInstance.post('/api/ratings', {
        itemId,
        bookingId,
        rating,
        review: review.trim()
      });
      
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to submit rating');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Rate Your Experience
        </Typography>
        
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        <Box component="form" onSubmit={handleSubmit}>
          <Box mb={3}>
            <Typography component="legend" variant="body2" gutterBottom>
              Rating *
            </Typography>
            <Rating
              value={rating}
              onChange={(event, newValue) => setRating(newValue)}
              size="large"
              icon={<Star fontSize="inherit" />}
              emptyIcon={<StarBorder fontSize="inherit" />}
            />
          </Box>

          <TextField
            fullWidth
            multiline
            rows={4}
            label="Review (Optional)"
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder="Share your experience with this item..."
            inputProps={{ maxLength: 1000 }}
            helperText={`${review.length}/1000 characters`}
            sx={{ mb: 3 }}
          />

          <Box display="flex" gap={2} justifyContent="flex-end">
            {onClose && (
              <Button onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting || !rating}
              startIcon={isSubmitting && <CircularProgress size={20} />}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Rating'}
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

// Individual Rating Display Component
export const RatingCard = ({ rating, currentUserId, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editRating, setEditRating] = useState(rating.rating);
  const [editReview, setEditReview] = useState(rating.review);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState('');

  const handleUpdate = async () => {
    if (!editRating) {
      setError('Please provide a rating');
      return;
    }

    setIsUpdating(true);
    setError('');

    try {
      await axiosInstance.put(`/api/ratings/${rating.id}`, {
        rating: editRating,
        review: editReview.trim()
      });
      
      setIsEditing(false);
      if (onUpdate) onUpdate();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to update rating');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this rating?')) return;

    try {
      await axiosInstance.delete(`/api/ratings/${rating.id}`);
      if (onDelete) onDelete();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to delete rating');
    }
  };

  const isOwner = currentUserId === rating.userId;

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar sx={{ width: 40, height: 40 }}>
              {rating.userEmail?.[0]?.toUpperCase() || 'U'}
            </Avatar>
            <Box>
              <Typography variant="subtitle2">
                {rating.userEmail || 'Anonymous User'}
              </Typography>
              <Box display="flex" alignItems="center" gap={1}>
                {isEditing ? (
                  <Rating
                    value={editRating}
                    onChange={(event, newValue) => setEditRating(newValue)}
                    size="small"
                  />
                ) : (
                  <StarRating value={rating.rating} size="small" showText={false} />
                )}
                {rating.isVerified && (
                  <Chip
                    label="Verified"
                    size="small"
                    icon={<Verified />}
                    color="success"
                    variant="outlined"
                  />
                )}
              </Box>
            </Box>
          </Box>
          
          {isOwner && (
            <Box display="flex" gap={1}>
              <Button
                size="small"
                startIcon={<Edit />}
                onClick={() => setIsEditing(!isEditing)}
                disabled={isUpdating}
              >
                {isEditing ? 'Cancel' : 'Edit'}
              </Button>
              <Button
                size="small"
                color="error"
                startIcon={<Delete />}
                onClick={handleDelete}
                disabled={isUpdating}
              >
                Delete
              </Button>
            </Box>
          )}
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {isEditing ? (
          <Box>
            <TextField
              fullWidth
              multiline
              rows={3}
              value={editReview}
              onChange={(e) => setEditReview(e.target.value)}
              placeholder="Update your review..."
              inputProps={{ maxLength: 1000 }}
              sx={{ mb: 2 }}
            />
            <Button
              variant="contained"
              size="small"
              onClick={handleUpdate}
              disabled={isUpdating || !editRating}
              startIcon={isUpdating && <CircularProgress size={16} />}
            >
              {isUpdating ? 'Updating...' : 'Update'}
            </Button>
          </Box>
        ) : (
          rating.review && (
            <Typography variant="body2" color="text.secondary">
              {rating.review}
            </Typography>
          )
        )}

        <Typography variant="caption" display="block" color="text.secondary" mt={1}>
          {new Date(rating.createdAt).toLocaleDateString()}
        </Typography>
      </CardContent>
    </Card>
  );
};

// Main Ratings Display Component
export const RatingsList = ({ itemId, allowRating = false, bookingId = null }) => {
  const [ratings, setRatings] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [error, setError] = useState('');

  // Get current user ID from token or context
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setCurrentUserId(payload.user_id);
      } catch (e) {
        console.error('Error parsing token:', e);
      }
    }
  }, []);

  const fetchRatings = async () => {
    try {
      const response = await axiosInstance.get(`/api/items/${itemId}/ratings`);
      setRatings(response.data.ratings || []);
      setAverageRating(response.data.averageRating || 0);
      setTotalReviews(response.data.totalReviews || 0);
    } catch (error) {
      setError('Failed to load ratings');
      console.error('Error fetching ratings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (itemId) {
      fetchRatings();
    }
  }, [itemId]);

  const handleRatingSuccess = () => {
    setShowRatingForm(false);
    fetchRatings();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Rating Summary */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Customer Reviews
          </Typography>
          
          <Grid container spacing={2} alignItems="center">
            <Grid item>
              <Box display="flex" alignItems="center" gap={2}>
                <Typography variant="h4">{averageRating.toFixed(1)}</Typography>
                <Box>
                  <StarRating value={averageRating} size="large" showText={false} />
                  <Typography variant="body2" color="text.secondary">
                    {totalReviews} review{totalReviews !== 1 ? 's' : ''}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            
            {allowRating && bookingId && (
              <Grid item>
                <Button
                  variant="contained"
                  onClick={() => setShowRatingForm(true)}
                  startIcon={<Star />}
                >
                  Write a Review
                </Button>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>

      {/* Rating Form Dialog */}
      <Dialog 
        open={showRatingForm} 
        onClose={() => setShowRatingForm(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Rate This Item</DialogTitle>
        <DialogContent>
          <RatingForm
            bookingId={bookingId}
            itemId={itemId}
            onSuccess={handleRatingSuccess}
            onClose={() => setShowRatingForm(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Error Message */}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Individual Ratings */}
      <Box>
        {ratings.length === 0 ? (
          <Card>
            <CardContent>
              <Typography color="text.secondary" textAlign="center">
                No reviews yet. Be the first to share your experience!
              </Typography>
            </CardContent>
          </Card>
        ) : (
          ratings.map((rating) => (
            <RatingCard
              key={rating.id}
              rating={rating}
              currentUserId={currentUserId}
              onUpdate={fetchRatings}
              onDelete={fetchRatings}
            />
          ))
        )}
      </Box>
    </Box>
  );
};

export default RatingsList;