import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Skeleton,
  Stack,
  Container,
  useTheme,
  useMediaQuery
} from '@mui/material';

// Item Card Skeleton
export const ItemCardSkeleton = () => (
  <Card 
    sx={{ 
      height: '100%',
      borderRadius: 2,
      boxShadow: 1
    }}
  >
    <Skeleton 
      variant="rectangular" 
      height={200} 
      sx={{ borderRadius: '8px 8px 0 0' }}
    />
    <CardContent sx={{ p: 2 }}>
      <Skeleton variant="text" height={28} sx={{ mb: 1 }} />
      <Skeleton variant="text" height={20} width="60%" sx={{ mb: 1 }} />
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
        <Skeleton variant="circular" width={16} height={16} />
        <Skeleton variant="text" width={80} height={16} />
      </Stack>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Skeleton variant="text" width={60} height={24} />
        <Skeleton variant="rectangular" width={80} height={32} sx={{ borderRadius: 1 }} />
      </Stack>
    </CardContent>
  </Card>
);

// Items Grid Skeleton
export const ItemsGridSkeleton = ({ count = 8 }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  const columns = isMobile ? 1 : isTablet ? 2 : 4;
  const itemCount = Math.min(count, 12);
  
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Grid container spacing={{ xs: 2, md: 3 }}>
        {Array.from({ length: itemCount }).map((_, index) => (
          <Grid key={index} item xs={12} sm={6} md={4} lg={3}>
            <ItemCardSkeleton />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

// Search Bar Skeleton
export const SearchBarSkeleton = () => (
  <Box sx={{ backgroundColor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider' }}>
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} md={6}>
          <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 2 }} />
        </Grid>
        <Grid item xs={12} md={3}>
          <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 2 }} />
        </Grid>
        <Grid item xs={12} md={3}>
          <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 2 }} />
        </Grid>
      </Grid>
      <Stack direction="row" spacing={1} sx={{ mt: 3 }}>
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton 
            key={index} 
            variant="rectangular" 
            width={Math.random() * 40 + 80} 
            height={32} 
            sx={{ borderRadius: 2 }} 
          />
        ))}
      </Stack>
    </Container>
  </Box>
);

// Hero Section Skeleton
export const HeroSkeleton = () => (
  <Box 
    sx={{ 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      py: { xs: 8, md: 12 }
    }}
  >
    <Container maxWidth="lg">
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Skeleton 
          variant="text" 
          sx={{ 
            fontSize: { xs: '2rem', md: '3.5rem' },
            mx: 'auto',
            mb: 2,
            bgcolor: 'rgba(255, 255, 255, 0.2)'
          }} 
        />
        <Skeleton 
          variant="text" 
          sx={{ 
            fontSize: '1.25rem',
            width: '60%',
            mx: 'auto',
            mb: 4,
            bgcolor: 'rgba(255, 255, 255, 0.2)'
          }} 
        />
        <Skeleton 
          variant="rectangular" 
          width={200} 
          height={48} 
          sx={{ 
            mx: 'auto',
            borderRadius: 2,
            bgcolor: 'rgba(255, 255, 255, 0.2)'
          }} 
        />
      </Box>
    </Container>
  </Box>
);

// Profile Page Skeleton
export const ProfileSkeleton = () => (
  <Container maxWidth="lg" sx={{ py: 4 }}>
    <Grid container spacing={4}>
      <Grid item xs={12} md={4}>
        <Card sx={{ p: 3, textAlign: 'center' }}>
          <Skeleton variant="circular" width={120} height={120} sx={{ mx: 'auto', mb: 2 }} />
          <Skeleton variant="text" height={32} sx={{ mb: 1 }} />
          <Skeleton variant="text" height={20} width="60%" sx={{ mx: 'auto', mb: 2 }} />
          <Skeleton variant="rectangular" height={36} sx={{ borderRadius: 1 }} />
        </Card>
      </Grid>
      <Grid item xs={12} md={8}>
        <Stack spacing={3}>
          <Card sx={{ p: 3 }}>
            <Skeleton variant="text" height={28} width="40%" sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              {Array.from({ length: 6 }).map((_, index) => (
                <Grid key={index} item xs={12} sm={6}>
                  <Skeleton variant="text" height={20} sx={{ mb: 1 }} />
                  <Skeleton variant="rectangular" height={40} sx={{ borderRadius: 1 }} />
                </Grid>
              ))}
            </Grid>
          </Card>
          <Card sx={{ p: 3 }}>
            <Skeleton variant="text" height={28} width="30%" sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              {Array.from({ length: 3 }).map((_, index) => (
                <Grid key={index} item xs={12} sm={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Skeleton variant="text" height={40} sx={{ mb: 1 }} />
                    <Skeleton variant="text" height={20} />
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Card>
        </Stack>
      </Grid>
    </Grid>
  </Container>
);

// Booking List Skeleton
export const BookingListSkeleton = () => (
  <Container maxWidth="lg" sx={{ py: 4 }}>
    <Skeleton variant="text" height={40} width="30%" sx={{ mb: 3 }} />
    <Stack spacing={2}>
      {Array.from({ length: 5 }).map((_, index) => (
        <Card key={index} sx={{ p: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={3}>
              <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 1 }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Skeleton variant="text" height={24} sx={{ mb: 1 }} />
              <Skeleton variant="text" height={20} width="80%" sx={{ mb: 1 }} />
              <Stack direction="row" spacing={1}>
                <Skeleton variant="rectangular" width={60} height={20} sx={{ borderRadius: 1 }} />
                <Skeleton variant="rectangular" width={80} height={20} sx={{ borderRadius: 1 }} />
              </Stack>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Box sx={{ textAlign: 'right' }}>
                <Skeleton variant="text" height={28} sx={{ mb: 1 }} />
                <Skeleton variant="rectangular" height={36} sx={{ borderRadius: 1, ml: 'auto' }} />
              </Box>
            </Grid>
          </Grid>
        </Card>
      ))}
    </Stack>
  </Container>
);

// Dashboard Skeleton
export const DashboardSkeleton = () => (
  <Container maxWidth="xl" sx={{ py: 4 }}>
    {/* Stats Cards */}
    <Grid container spacing={3} sx={{ mb: 4 }}>
      {Array.from({ length: 4 }).map((_, index) => (
        <Grid key={index} item xs={12} sm={6} md={3}>
          <Card sx={{ p: 3, textAlign: 'center' }}>
            <Skeleton variant="circular" width={48} height={48} sx={{ mx: 'auto', mb: 2 }} />
            <Skeleton variant="text" height={32} sx={{ mb: 1 }} />
            <Skeleton variant="text" height={20} />
          </Card>
        </Grid>
      ))}
    </Grid>
    
    {/* Charts */}
    <Grid container spacing={3}>
      <Grid item xs={12} md={8}>
        <Card sx={{ p: 3 }}>
          <Skeleton variant="text" height={28} sx={{ mb: 3 }} />
          <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 1 }} />
        </Card>
      </Grid>
      <Grid item xs={12} md={4}>
        <Card sx={{ p: 3 }}>
          <Skeleton variant="text" height={28} sx={{ mb: 3 }} />
          <Stack spacing={2}>
            {Array.from({ length: 5 }).map((_, index) => (
              <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Skeleton variant="rectangular" width={40} height={40} sx={{ borderRadius: 1 }} />
                <Box sx={{ flexGrow: 1 }}>
                  <Skeleton variant="text" height={20} sx={{ mb: 0.5 }} />
                  <Skeleton variant="text" height={16} width="60%" />
                </Box>
              </Box>
            ))}
          </Stack>
        </Card>
      </Grid>
    </Grid>
  </Container>
);

// Generic Page Skeleton
export const PageSkeleton = ({ 
  showHero = false, 
  showSearch = false, 
  showGrid = false,
  gridCount = 8 
}) => (
  <Box>
    {showHero && <HeroSkeleton />}
    {showSearch && <SearchBarSkeleton />}
    {showGrid && <ItemsGridSkeleton count={gridCount} />}
    {!showHero && !showSearch && !showGrid && (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Skeleton variant="text" height={40} width="50%" sx={{ mb: 3 }} />
        <Stack spacing={2}>
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} variant="text" height={20} />
          ))}
        </Stack>
      </Container>
    )}
  </Box>
);

export default {
  ItemCardSkeleton,
  ItemsGridSkeleton,
  SearchBarSkeleton,
  HeroSkeleton,
  ProfileSkeleton,
  BookingListSkeleton,
  DashboardSkeleton,
  PageSkeleton
};