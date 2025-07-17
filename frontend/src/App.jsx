import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // The base URL is injected by the Vite build process from the workflow
    const apiUrl = `${import.meta.env.VITE_API_BASE_URL}items`;

    fetch(apiUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        setItems(data);
        setError(null);
      })
      .catch(err => {
        setError(err.message);
        setItems([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <>
      <h1>BorrowHubb</h1>
      <p className="read-the-docs">
        A place to borrow and lend items with your community.
      </p>

      <div className="card">
        {loading && <p>Loading items...</p>}
        {error && <p className="error-message">Error: {error}</p>}
        {!loading && !error && (
          <ul>
            {items.map(item => (
              <li key={item.id}>
                <strong>{item.name}</strong>: {item.description}
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

export default App;