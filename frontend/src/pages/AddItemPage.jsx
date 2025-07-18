import React, { useState, useContext } from 'react';
import axios from 'axios';
import ItemContext from '../context/ItemContext';
import AuthContext from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AddItemPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    dailyRate: '',
    imageUrl: '',
  });
  const { dispatch: itemDispatch } = useContext(ItemContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const { name, description, dailyRate, imageUrl } = formData;

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    if (!user) {
      alert('You must be logged in to list an item.');
      return;
    }
    try {
      const res = await axios.post('/api/items', formData);
      itemDispatch({ type: 'ADD_ITEM', payload: res.data });
      navigate('/'); // Redirect to home page after successful submission
    } catch (err) {
      console.error(err.response.data);
      // Display error to user
    }
  };

  return (
    <div>
      <h2>List a New Item</h2>
      <form onSubmit={onSubmit}>
        <input type="text" name="name" placeholder="Item Name" value={name} onChange={onChange} required />
        <textarea name="description" placeholder="Item Description" value={description} onChange={onChange} required />
        <input type="number" name="dailyRate" placeholder="Daily Rate (₹)" value={dailyRate} onChange={onChange} required />
        <input type="text" name="imageUrl" placeholder="Image URL" value={imageUrl} onChange={onChange} required />
        <button type="submit">List My Item</button>
      </form>
    </div>
  );
};

export default AddItemPage;