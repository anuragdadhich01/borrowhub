import React from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Divider,
  Stack,
  Alert,
  Link,
  Chip
} from '@mui/material';
import { Security, Update, Shield } from '@mui/icons-material';
import Footer from '../components/Footer';

const PrivacyPage = () => {
  return (
    <>
      <Container maxWidth="md" sx={{ py: 8 }}>
        {/* Header */}
        <Box textAlign="center" sx={{ mb: 6 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <Security sx={{ fontSize: '4rem', color: 'primary.main' }} />
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
            Privacy Policy
          </Typography>
          <Alert 
            icon={<Update />} 
            severity="info" 
            sx={{ maxWidth: '500px', mx: 'auto', borderRadius: 2, mb: 3 }}
          >
            Last updated: January 1, 2024
          </Alert>
          <Stack direction="row" spacing={1} justifyContent="center">
            <Chip 
              icon={<Shield />} 
              label="GDPR Compliant" 
              color="success" 
              variant="outlined" 
            />
            <Chip 
              icon={<Security />} 
              label="SSL Encrypted" 
              color="primary" 
              variant="outlined" 
            />
          </Stack>
        </Box>

        <Paper elevation={1} sx={{ p: 6, borderRadius: 3 }}>
          <Stack spacing={4}>
            {/* Introduction */}
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
                1. Introduction
              </Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.8, mb: 2 }}>
                BorrowHub Technologies Pvt. Ltd. ("BorrowHub", "we", "our", or "us") is committed 
                to protecting your privacy. This Privacy Policy explains how we collect, use, 
                disclose, and safeguard your information when you use our website, mobile application, 
                and services.
              </Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                By using our Service, you consent to the data practices described in this policy.
              </Typography>
            </Box>

            <Divider />

            {/* Information We Collect */}
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
                2. Information We Collect
              </Typography>
              
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                2.1 Personal Information
              </Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.8, mb: 2 }}>
                We collect information you provide directly to us, including:
              </Typography>
              <Box component="ul" sx={{ pl: 4, mb: 3 }}>
                <Typography component="li" variant="body1" sx={{ lineHeight: 1.8, mb: 1 }}>
                  Name, email address, phone number
                </Typography>
                <Typography component="li" variant="body1" sx={{ lineHeight: 1.8, mb: 1 }}>
                  Address and location information
                </Typography>
                <Typography component="li" variant="body1" sx={{ lineHeight: 1.8, mb: 1 }}>
                  Identity verification documents
                </Typography>
                <Typography component="li" variant="body1" sx={{ lineHeight: 1.8, mb: 1 }}>
                  Payment information (processed securely through third parties)
                </Typography>
                <Typography component="li" variant="body1" sx={{ lineHeight: 1.8 }}>
                  Profile photos and item images
                </Typography>
              </Box>

              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                2.2 Automatically Collected Information
              </Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.8, mb: 2 }}>
                When you use our Service, we automatically collect:
              </Typography>
              <Box component="ul" sx={{ pl: 4, mb: 3 }}>
                <Typography component="li" variant="body1" sx={{ lineHeight: 1.8, mb: 1 }}>
                  Device information (IP address, browser type, operating system)
                </Typography>
                <Typography component="li" variant="body1" sx={{ lineHeight: 1.8, mb: 1 }}>
                  Usage data (pages viewed, time spent, clicks)
                </Typography>
                <Typography component="li" variant="body1" sx={{ lineHeight: 1.8, mb: 1 }}>
                  Location data (with your permission)
                </Typography>
                <Typography component="li" variant="body1" sx={{ lineHeight: 1.8 }}>
                  Cookies and similar tracking technologies
                </Typography>
              </Box>

              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                2.3 Communication Data
              </Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                We collect and store communications between users through our messaging system 
                to ensure safety, resolve disputes, and improve our services.
              </Typography>
            </Box>

            <Divider />

            {/* How We Use Information */}
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
                3. How We Use Your Information
              </Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.8, mb: 2 }}>
                We use the information we collect to:
              </Typography>
              <Box component="ul" sx={{ pl: 4, mb: 2 }}>
                <Typography component="li" variant="body1" sx={{ lineHeight: 1.8, mb: 1 }}>
                  Provide, maintain, and improve our services
                </Typography>
                <Typography component="li" variant="body1" sx={{ lineHeight: 1.8, mb: 1 }}>
                  Process transactions and send related information
                </Typography>
                <Typography component="li" variant="body1" sx={{ lineHeight: 1.8, mb: 1 }}>
                  Verify identity and prevent fraud
                </Typography>
                <Typography component="li" variant="body1" sx={{ lineHeight: 1.8, mb: 1 }}>
                  Facilitate communication between users
                </Typography>
                <Typography component="li" variant="body1" sx={{ lineHeight: 1.8, mb: 1 }}>
                  Send notifications and updates
                </Typography>
                <Typography component="li" variant="body1" sx={{ lineHeight: 1.8, mb: 1 }}>
                  Provide customer support
                </Typography>
                <Typography component="li" variant="body1" sx={{ lineHeight: 1.8, mb: 1 }}>
                  Analyze usage patterns and improve user experience
                </Typography>
                <Typography component="li" variant="body1" sx={{ lineHeight: 1.8 }}>
                  Comply with legal obligations
                </Typography>
              </Box>
            </Box>

            <Divider />

            {/* Information Sharing */}
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
                4. Information Sharing and Disclosure
              </Typography>
              
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                4.1 With Other Users
              </Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.8, mb: 3 }}>
                To facilitate rentals, we share certain information between renters and owners, 
                including names, profile photos, and contact information as necessary for the transaction.
              </Typography>

              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                4.2 With Service Providers
              </Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.8, mb: 3 }}>
                We work with third-party service providers for payment processing, identity verification, 
                insurance, customer support, and analytics. These providers are bound by strict 
                confidentiality agreements.
              </Typography>

              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                4.3 Legal Requirements
              </Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.8, mb: 3 }}>
                We may disclose your information if required by law, court order, or government 
                regulation, or to protect our rights, property, or safety, or that of our users.
              </Typography>

              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                4.4 Business Transfers
              </Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                In case of merger, acquisition, or sale of assets, your information may be 
                transferred as part of the business transaction, subject to the same privacy protections.
              </Typography>
            </Box>

            <Divider />

            {/* Data Security */}
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
                5. Data Security
              </Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.8, mb: 2 }}>
                We implement industry-standard security measures to protect your information:
              </Typography>
              <Box component="ul" sx={{ pl: 4, mb: 2 }}>
                <Typography component="li" variant="body1" sx={{ lineHeight: 1.8, mb: 1 }}>
                  SSL encryption for data transmission
                </Typography>
                <Typography component="li" variant="body1" sx={{ lineHeight: 1.8, mb: 1 }}>
                  Secure servers with regular security updates
                </Typography>
                <Typography component="li" variant="body1" sx={{ lineHeight: 1.8, mb: 1 }}>
                  Access controls and employee training
                </Typography>
                <Typography component="li" variant="body1" sx={{ lineHeight: 1.8, mb: 1 }}>
                  Regular security audits and monitoring
                </Typography>
                <Typography component="li" variant="body1" sx={{ lineHeight: 1.8 }}>
                  Data backup and recovery procedures
                </Typography>
              </Box>
              <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                However, no method of transmission over the internet is 100% secure. 
                We cannot guarantee absolute security but continuously work to improve our protections.
              </Typography>
            </Box>

            <Divider />

            {/* Your Rights */}
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
                6. Your Privacy Rights
              </Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.8, mb: 2 }}>
                You have the following rights regarding your personal information:
              </Typography>
              <Box component="ul" sx={{ pl: 4, mb: 2 }}>
                <Typography component="li" variant="body1" sx={{ lineHeight: 1.8, mb: 1 }}>
                  <strong>Access:</strong> Request copies of your personal information
                </Typography>
                <Typography component="li" variant="body1" sx={{ lineHeight: 1.8, mb: 1 }}>
                  <strong>Correction:</strong> Request correction of inaccurate information
                </Typography>
                <Typography component="li" variant="body1" sx={{ lineHeight: 1.8, mb: 1 }}>
                  <strong>Deletion:</strong> Request deletion of your information (subject to legal requirements)
                </Typography>
                <Typography component="li" variant="body1" sx={{ lineHeight: 1.8, mb: 1 }}>
                  <strong>Portability:</strong> Request transfer of your data to another service
                </Typography>
                <Typography component="li" variant="body1" sx={{ lineHeight: 1.8, mb: 1 }}>
                  <strong>Objection:</strong> Object to processing of your information
                </Typography>
                <Typography component="li" variant="body1" sx={{ lineHeight: 1.8 }}>
                  <strong>Restriction:</strong> Request restriction of processing
                </Typography>
              </Box>
              <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                To exercise these rights, contact us at privacy@borrowhub.com.
              </Typography>
            </Box>

            <Divider />

            {/* Cookies */}
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
                7. Cookies and Tracking Technologies
              </Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.8, mb: 2 }}>
                We use cookies and similar technologies to enhance your experience, analyze usage, 
                and provide personalized content. Types of cookies we use:
              </Typography>
              <Box component="ul" sx={{ pl: 4, mb: 2 }}>
                <Typography component="li" variant="body1" sx={{ lineHeight: 1.8, mb: 1 }}>
                  <strong>Essential cookies:</strong> Required for basic site functionality
                </Typography>
                <Typography component="li" variant="body1" sx={{ lineHeight: 1.8, mb: 1 }}>
                  <strong>Performance cookies:</strong> Help us analyze and improve site performance
                </Typography>
                <Typography component="li" variant="body1" sx={{ lineHeight: 1.8, mb: 1 }}>
                  <strong>Functional cookies:</strong> Remember your preferences and settings
                </Typography>
                <Typography component="li" variant="body1" sx={{ lineHeight: 1.8 }}>
                  <strong>Marketing cookies:</strong> Used to deliver relevant advertisements
                </Typography>
              </Box>
              <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                You can control cookies through your browser settings. See our{' '}
                <Link href="/cookies">Cookie Policy</Link> for detailed information.
              </Typography>
            </Box>

            <Divider />

            {/* Data Retention */}
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
                8. Data Retention
              </Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.8, mb: 2 }}>
                We retain your information for as long as necessary to:
              </Typography>
              <Box component="ul" sx={{ pl: 4, mb: 2 }}>
                <Typography component="li" variant="body1" sx={{ lineHeight: 1.8, mb: 1 }}>
                  Provide our services to you
                </Typography>
                <Typography component="li" variant="body1" sx={{ lineHeight: 1.8, mb: 1 }}>
                  Comply with legal obligations
                </Typography>
                <Typography component="li" variant="body1" sx={{ lineHeight: 1.8, mb: 1 }}>
                  Resolve disputes and enforce agreements
                </Typography>
                <Typography component="li" variant="body1" sx={{ lineHeight: 1.8 }}>
                  Protect against fraud and abuse
                </Typography>
              </Box>
              <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                When you delete your account, we will delete or anonymize your information 
                within 30 days, except where longer retention is required by law.
              </Typography>
            </Box>

            <Divider />

            {/* Third-Party Links */}
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
                9. Third-Party Links and Services
              </Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.8, mb: 2 }}>
                Our Service may contain links to third-party websites or integrate with third-party services. 
                We are not responsible for the privacy practices of these external sites or services.
              </Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                We encourage you to read the privacy policies of any third-party sites you visit.
              </Typography>
            </Box>

            <Divider />

            {/* Children's Privacy */}
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
                10. Children's Privacy
              </Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.8, mb: 2 }}>
                Our Service is not intended for use by children under 18 years of age. 
                We do not knowingly collect personal information from children under 18.
              </Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                If we become aware that we have collected information from a child under 18, 
                we will take steps to delete such information promptly.
              </Typography>
            </Box>

            <Divider />

            {/* Policy Changes */}
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
                11. Changes to This Privacy Policy
              </Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.8, mb: 2 }}>
                We may update this Privacy Policy from time to time. We will notify you of 
                any material changes by posting the new policy on this page and sending an email notification.
              </Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                Your continued use of the Service after changes constitutes acceptance of the updated policy.
              </Typography>
            </Box>

            <Divider />

            {/* Contact Information */}
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
                12. Contact Us
              </Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.8, mb: 2 }}>
                If you have questions about this Privacy Policy or our data practices, please contact us:
              </Typography>
              <Box sx={{ pl: 2 }}>
                <Typography variant="body1" sx={{ lineHeight: 1.8, mb: 1 }}>
                  <strong>Privacy Officer:</strong> privacy@borrowhub.com
                </Typography>
                <Typography variant="body1" sx={{ lineHeight: 1.8, mb: 1 }}>
                  <strong>General Contact:</strong> support@borrowhub.com
                </Typography>
                <Typography variant="body1" sx={{ lineHeight: 1.8, mb: 1 }}>
                  <strong>Phone:</strong> +91 9999-888-777
                </Typography>
                <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                  <strong>Address:</strong> BorrowHub Technologies Pvt. Ltd., Mumbai, Maharashtra, India
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

export default PrivacyPage;