import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [succeeded, setSucceeded] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setProcessing(true);

    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      return;
    }

    const payload = await stripe.confirmCardPayment(
      // We will get the clientSecret from the PaymentPage
      // This is just a placeholder for now
      "CLIENT_SECRET_FROM_SERVER", 
      {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      }
    );

    if (payload.error) {
      setError(`Payment failed: ${payload.error.message}`);
      setProcessing(false);
    } else {
      setError(null);
      setProcessing(false);
      setSucceeded(true);
      // You can redirect to a success page or show a success message
      alert("Payment Successful!");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardElement />
      <button disabled={processing || succeeded}>
        {processing ? "Processing..." : "Pay"}
      </button>
      {error && <div>{error}</div>}
    </form>
  );
};

export default CheckoutForm;