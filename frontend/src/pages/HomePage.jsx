import React, { useEffect, useContext } from 'react';
import axios from 'axios';
import ItemContext from '../context/ItemContext';
import ItemCard from '../components/ItemCard';
import './HomePage.css'; // For layout styling

const HomePage = () => {
  const { items, loading, dispatch } = useContext(ItemContext);

  useEffect(() => {
    const getItems = async () => {
      try {
        const res = await axios.get('/api/items');
        dispatch({
          type: 'GET_ITEMS',
          payload: res.data,
        });
      } catch (err) {
        console.error(err);
      }
    };

    getItems();
  }, [dispatch]);

  return (
    <div>
      <h1>Available Items</h1>
      <div className="items-container">
        {loading ? (
          <p>Loading items...</p>
        ) : (
          items.map(item => <ItemCard key={item._id} item={item} />)
        )}
      </div>
    </div>
  );
};

export default HomePage;