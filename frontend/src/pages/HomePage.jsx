import React, { useState, useEffect } from 'react';
import axios from 'axios';

const HomePage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await axios.get('/items');
        setItems(res.data);
      } catch (err) {
        console.error("Error fetching items:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  if (loading) {
    return <h1>Loading items...</h1>;
  }

  return (
    <div>
      <h1>Welcome to BorrowHub</h1>
      <h2>Available Items:</h2>
      <ul>
        {items.map(item => (
          // The key prop has been added here
          <li key={item.ID}>{item.Name}</li>
        ))}
      </ul>
    </div>
  );
};

export default HomePage;