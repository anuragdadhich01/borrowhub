import React from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Divider,
  Stack,
  Alert,
  Link
} from '@mui/material';
import { Gavel, Update } from '@mui/icons-material';
import Footer from '../components/Footer';

const TermsPage = () => {
  return (
    <>
      <Container maxWidth="md" sx={{ py: 8 }}>
        {/* Header */}
        <Box textAlign="center" sx={{ mb: 6 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <Gavel sx={{ fontSize: '4rem', color: 'primary.main' }} />
          </Box>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 700,
              mb: 3,
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Terms of Service
          </Typography>
          <Alert 
            icon={<Update />} 
            severity="info" 
            sx={{ maxWidth: '500px', mx: 'auto', borderRadius: 2 }}
          >
            Last updated: January 1, 2024
          </Alert>
        </Box>

        <Paper elevation={1} sx={{ p: 6, borderRadius: 3 }}>
          <Stack spacing={4}>
            {/* Introduction */}
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
                1. Introduction
              </Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.8, mb: 2 }}>
                Welcome to BorrowHub Technologies Pvt. Ltd. ("BorrowHub", "we", "our", or "us"). 
                These Terms of Service ("Terms") govern your use of our website, mobile application, 
                and services (collectively, the "Service") operated by BorrowHub.
              </Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                By accessing or using our Service, you agree to be bound by these Terms. 
                If you disagree with any part of these terms, then you may not access the Service.
              </Typography>
            </Box>

            <Divider />

            {/* Acceptance of Terms */}
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
                2. Acceptance of Terms
              </Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.8, mb: 2 }}>
                By creating an account or using our Service, you acknowledge that you have read, 
                understood, and agree to be bound by these Terms and our Privacy Policy.
              </Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                You must be at least 18 years old to use our Service. By using the Service, 
                you represent and warrant that you are at least 18 years of age.
              </Typography>
            </Box>

            <Divider />

            {/* Service Description */}
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
                3. Service Description
              </Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.8, mb: 2 }}>
                BorrowHub is a peer-to-peer rental marketplace that allows users to:
              </Typography>
              <Box component="ul" sx={{ pl: 4, mb: 2 }}>
                <Typography component="li" variant="body1" sx={{ lineHeight: 1.8, mb: 1 }}>
                  List items for rent ("Owners")
                </Typography>
                <Typography component="li" variant="body1" sx={{ lineHeight: 1.8, mb: 1 }}>
                  Browse and rent items from other users ("Renters")
                </Typography>
                <Typography component="li" variant="body1" sx={{ lineHeight: 1.8, mb: 1 }}>
                  Process payments securely through our platform
                </Typography>
                <Typography component="li" variant="body1" sx={{ lineHeight: 1.8 }}>
                  Communicate through our messaging system
                </Typography>
              </Box>
            </Box>

            <Divider />

            {/* User Responsibilities */}
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
                4. User Responsibilities
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                4.1 Account Security
              </Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.8, mb: 3 }}>
                You are responsible for maintaining the confidentiality of your account credentials 
                and for all activities that occur under your account. You must notify us immediately 
                of any unauthorized use of your account.
              </Typography>
              
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                4.2 Accurate Information
              </Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.8, mb: 3 }}>
                You agree to provide accurate, current, and complete information when creating listings, 
                making bookings, or using our Service. You must update your information to keep it accurate.
              </Typography>

              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                4.3 Prohibited Activities
              </Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.8, mb: 2 }}>
                You agree not to:
              </Typography>
              <Box component="ul" sx={{ pl: 4 }}>
                <Typography component="li" variant="body1" sx={{ lineHeight: 1.8, mb: 1 }}>
                  Use the Service for any illegal or unauthorized purpose
                </Typography>
                <Typography component="li" variant="body1" sx={{ lineHeight: 1.8, mb: 1 }}>
                  List stolen, counterfeit, or dangerous items
                </Typography>
                <Typography component="li" variant="body1" sx={{ lineHeight: 1.8, mb: 1 }}>
                  Engage in fraudulent activities or misrepresent items
                </Typography>
                <Typography component="li" variant="body1" sx={{ lineHeight: 1.8, mb: 1 }}>
                  Harass, abuse, or harm other users
                </Typography>
                <Typography component="li" variant="body1" sx={{ lineHeight: 1.8 }}>
                  Circumvent our fees or payment system
                </Typography>
              </Box>
            </Box>

            <Divider />

            {/* Rental Terms */}
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
                5. Rental Terms
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                5.1 Booking and Payment
              </Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.8, mb: 3 }}>
                All bookings must be made through our platform. Payment is processed securely 
                and held in escrow until the rental is completed successfully.
              </Typography>

              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                5.2 Item Condition
              </Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.8, mb: 3 }}>
                Owners must accurately describe item condition. Renters must return items 
                in the same condition as received, accounting for normal wear and tear.
              </Typography>

              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                5.3 Insurance and Liability
              </Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                All rentals are covered by our comprehensive insurance policy. 
                Details are available in our <Link href="/insurance">Insurance Policy</Link>.
              </Typography>
            </Box>

            <Divider />

            {/* Fees and Payments */}
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
                6. Fees and Payments
              </Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.8, mb: 2 }}>
                BorrowHub charges service fees for successful transactions:
              </Typography>
              <Box component="ul" sx={{ pl: 4, mb: 2 }}>
                <Typography component="li" variant="body1" sx={{ lineHeight: 1.8, mb: 1 }}>
                  Renters: 5% service fee on rental amount
                </Typography>
                <Typography component="li" variant="body1" sx={{ lineHeight: 1.8, mb: 1 }}>
                  Owners: 3% service fee on earnings
                </Typography>
                <Typography component="li" variant="body1" sx={{ lineHeight: 1.8 }}>
                  Payment processing fees may apply
                </Typography>
              </Box>
              <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                Fees are clearly displayed before completing any transaction.
              </Typography>
            </Box>

            <Divider />

            {/* Dispute Resolution */}
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
                7. Dispute Resolution
              </Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.8, mb: 2 }}>
                We provide a dispute resolution process for issues between users. 
                Our team will mediate disputes fairly and may make binding decisions 
                regarding refunds or damages.
              </Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                For detailed information, see our <Link href="/disputes">Dispute Resolution Policy</Link>.
              </Typography>
            </Box>

            <Divider />

            {/* Termination */}
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
                8. Termination
              </Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.8, mb: 2 }}>
                We may terminate or suspend your account immediately, without prior notice, 
                for conduct that we believe violates these Terms or is harmful to other users, 
                us, or third parties.
              </Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                You may terminate your account at any time by contacting our support team.
              </Typography>
            </Box>

            <Divider />

            {/* Limitation of Liability */}
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
                9. Limitation of Liability
              </Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.8, mb: 2 }}>
                BorrowHub acts as an intermediary platform. We are not responsible for the actual 
                rental transactions between users. Our liability is limited to the maximum extent 
                permitted by law.
              </Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                Users engage in rental transactions at their own risk, subject to our insurance coverage.
              </Typography>
            </Box>

            <Divider />

            {/* Changes to Terms */}
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
                10. Changes to Terms
              </Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.8, mb: 2 }}>
                We reserve the right to modify these Terms at any time. We will notify users 
                of significant changes via email or through our platform.
              </Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                Your continued use of the Service after changes constitutes acceptance of the new Terms.
              </Typography>
            </Box>

            <Divider />

            {/* Contact Information */}
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
                11. Contact Information
              </Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.8, mb: 2 }}>
                If you have any questions about these Terms, please contact us:
              </Typography>
              <Box sx={{ pl: 2 }}>
                <Typography variant="body1" sx={{ lineHeight: 1.8, mb: 1 }}>
                  Email: legal@borrowhub.com
                </Typography>
                <Typography variant="body1" sx={{ lineHeight: 1.8, mb: 1 }}>
                  Phone: +91 9999-888-777
                </Typography>
                <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                  Address: BorrowHub Technologies Pvt. Ltd., Mumbai, Maharashtra, India
                </Typography>
              </Box>
            </Box>
          </Stack>
        </Paper>
      </Container>
      <Footer />
    </>
  );
};

export default TermsPage;