import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import CheckoutForm from '../components/CheckoutForm';

// Make sure to call `loadStripe` outside of a component’s render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = loadStripe('pk_test_51RmBESP0LYNC3VT5q4LvNs7kZwfaiPK2BTjdsbKuhMrS9cGE5Y2cVhwbOo3ltGeMNynEqwwnlWDbUWCOG5wCXCUN00Ufljs22O');

const PaymentPage = () => {
  const [clientSecret, setClientSecret] = useState('');
  const location = useLocation();

  useEffect(() => {
    // Get the bookingId from the state passed via navigate
    const { bookingId } = location.state || {};

    if (bookingId) {
      const getClientSecret = async () => {
        try {
          const res = await axios.post('/api/bookings/create-payment-intent', { bookingId });
          setClientSecret(res.data.clientSecret);
        } catch (err) {
          console.error('Error fetching client secret', err);
        }
      };
      getClientSecret();
    }
  }, [location.state]);

  const options = {
    clientSecret,
  };

  return (
    <div>
      <h2>Confirm Your Booking</h2>
      {clientSecret && (
        <Elements options={options} stripe={stripePromise}>
          <CheckoutForm />
        </Elements>
      )}
    </div>
  );
};

export default PaymentPage;