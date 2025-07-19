import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios'; // Only one import now
import AuthContext from '../context/AuthContext';
import './ItemDetailsPage.css';

const ItemDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useContext(AuthContext);
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const res = await axios.get(`/api/items/${id}`);
        setItem(res.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };

    fetchItem();
  }, [id]);

  const handleBookNow = async () => {
    if (!isAuthenticated) {
      alert('You must be logged in to book an item.');
      navigate('/login');
      return;
    }

    // This is a simplified booking flow.
    // In a real app, you would have a date picker.
    const bookingDetails = {
      itemId: item._id,
      startDate: new Date(),
      endDate: new Date(new Date().setDate(new Date().getDate() + 1)), // Example: 1 day rental
      totalPrice: item.dailyRate,
    };

    try {
      // 1. Create a pending booking in our database
      const res = await axios.post('/api/bookings', bookingDetails);
      const bookingId = res.data._id;

      // 2. Navigate to the Payment Page with the new booking ID
      navigate(`/pay/${bookingId}`, { state: { bookingId } });
    } catch (err) {
      console.error('Failed to create booking', err);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!item) {
    return <div>Item not found.</div>;
  }

  return (
    <div className="item-details-container">
      <img src={item.imageUrl} alt={item.name} className="item-details-img" />
      <div className="item-details-info">
        <h1>{item.name}</h1>
        <p className="item-details-price">₹{item.dailyRate} / day</p>
        <h3>Description</h3>
        <p>{item.description}</p>
        <button className="book-now-btn" onClick={handleBookNow}>
          Book Now
        </button>
      </div>
    </div>
  );
};

export default ItemDetailsPage;