import React, { useContext } from 'react';
// This import was broken, it's now fixed
import { Link } from 'react-router-dom'; 
import AuthContext from '../context/AuthContext.jsx';

const Navbar = () => {
  const { isAuthenticated, dispatch } = useContext(AuthContext);

  const onLogout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  const authLinks = (
    <ul>
      <li><Link to="/">Home</Link></li>
      <li><Link to="/add-item">List an Item</Link></li>
      <li><a onClick={onLogout} href="#!">Logout</a></li>
    </ul>
  );

  const guestLinks = (
    <ul>
      <li><Link to="/">Home</Link></li>
      <li><Link to="/register">Register</Link></li>
      <li><Link to="/login">Login</Link></li>
    </ul>
  );

  return (
    <nav>
      <h1><Link to="/">BorrowHub</Link></h1>
      {isAuthenticated ? authLinks : guestLinks}
    </nav>
  );
};

export default Navbar;