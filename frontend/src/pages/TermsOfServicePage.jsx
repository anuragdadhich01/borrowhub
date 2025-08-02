import React from 'react';
import {
  Container,
  Typography,
  Box,
  Paper
} from '@mui/material';

const TermsOfServicePage = () => {
  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Typography variant="h2" sx={{ fontWeight: 700, mb: 4, textAlign: 'center' }}>
        Terms of Service
      </Typography>
      
      <Paper elevation={0} sx={{ p: 6, backgroundColor: 'grey.50', borderRadius: 3 }}>
        <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary' }}>
          Last updated: January 2024
        </Typography>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 2 }}>
            1. Acceptance of Terms
          </Typography>
          <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
            By accessing and using BorrowHub ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 2 }}>
            2. Description of Service
          </Typography>
          <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
            BorrowHub is a peer-to-peer rental marketplace that connects people who want to rent items with people who have items to rent. We facilitate transactions but are not party to the rental agreements between users.
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 2 }}>
            3. User Responsibilities
          </Typography>
          <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
            Users are responsible for:
          </Typography>
          <ul style={{ marginLeft: '20px' }}>
            <li>Providing accurate information about items and rental terms</li>
            <li>Treating rented items with care and returning them in good condition</li>
            <li>Communicating respectfully with other users</li>
            <li>Complying with all applicable laws and regulations</li>
          </ul>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 2 }}>
            4. Payment and Fees
          </Typography>
          <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
            BorrowHub charges a service fee for facilitating transactions. Payment terms, fees, and refund policies are clearly disclosed before each transaction. All payments are processed securely through our platform.
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 2 }}>
            5. Prohibited Uses
          </Typography>
          <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
            You may not use our service to:
          </Typography>
          <ul style={{ marginLeft: '20px' }}>
            <li>Engage in any illegal or fraudulent activity</li>
            <li>Rent dangerous, stolen, or prohibited items</li>
            <li>Harass, abuse, or harm other users</li>
            <li>Violate any intellectual property rights</li>
          </ul>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 2 }}>
            6. Limitation of Liability
          </Typography>
          <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
            BorrowHub is not liable for any damages arising from the use of rented items or disputes between users. Our liability is limited to the maximum extent permitted by law.
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 2 }}>
            7. Privacy Policy
          </Typography>
          <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
            Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the Service, to understand our practices.
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 2 }}>
            8. Contact Information
          </Typography>
          <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
            If you have any questions about these Terms of Service, please contact us at:
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            Email: legal@borrowhub.com<br/>
            Phone: +91 9999-888-777
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default TermsOfServicePage;