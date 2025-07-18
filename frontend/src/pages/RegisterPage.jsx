import React, { useState, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const RegisterPage = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const { dispatch } = useContext(AuthContext);
  const navigate = useNavigate();

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/users', formData);
      dispatch({ type: 'LOGIN_SUCCESS', payload: res.data });
      navigate('/'); // Redirect to home on successful registration
    } catch (err) {
      console.error(err.response.data);
      // You can add logic here to display an error message to the user
    }
  };

  return (
    <div>
      <h2>Register</h2>
      <form onSubmit={onSubmit}>
        <input type="text" name="name" placeholder="Name" value={formData.name} onChange={onChange} required />
        <input type="email" name="email" placeholder="Email" value={formData.email} onChange={onChange} required />
        <input type="password" name="password" placeholder="Password" value={formData.password} onChange={onChange} required />
        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default RegisterPage;