import React from 'react';
import { Link } from 'react-router-dom'; // Import Link
import './ItemCard.css';

const ItemCard = ({ item }) => {
  return (
    // Wrap the entire card in a Link component
    <Link to={`/item/${item._id}`} className="card-link">
      <div className="card">
        <img src={item.imageUrl} alt={item.name} className="card-img" />
        <div className="card-body">
          <h3 className="card-title">{item.name}</h3>
          <p className="card-price">₹{item.dailyRate} / day</p>
        </div>
      </div>
    </Link>
  );
};

export default ItemCard;