import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    // Make sure this endpoint matches your Go API, e.g., /items
    const endpoint = '/items';

    fetch(`${API_URL}${endpoint}`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(responseData => {
        // Assuming the API returns an array of items
        setItems(responseData || []);
        setLoading(false);
      })
      .catch(error => {
        setError(error);
        setLoading(false);
      });
  }, [API_URL]);

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>BorrowHubb</h1>
        <p>A place to borrow and lend items with your community.</p>
      </header>
      <main>
        {loading && <p className="loading-message">Loading items...</p>}
        {error && <p className="error-message">Error: {error.message}</p>}
        {!loading && !error && (
          <div className="items-grid">
            {items.map(item => (
              <div key={item.id} className="item-card">
                <h2>{item.name}</h2>
                <p className={item.borrowed ? 'status-borrowed' : 'status-available'}>
                  {item.borrowed ? 'Borrowed' : 'Available'}
                </p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;