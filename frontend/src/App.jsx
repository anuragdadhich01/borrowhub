import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // The VITE_API_BASE_URL is injected by the GitHub Actions workflow
  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    if (!apiUrl) {
      setError("API URL is not configured. Deployment may be incomplete.");
      setLoading(false);
      return;
    }

    async function fetchItems() {
      try {
        setLoading(true);
        const response = await fetch(apiUrl);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setItems(data);
        setError(null);
      } catch (e) {
        setError(`Failed to fetch items: ${e.message}`);
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    fetchItems();
  }, [apiUrl]);

  return (
    <>
      <h1>Welcome to BorrowHub</h1>
      <div className="card">
        <h2>Available Items</h2>
        {loading && <p>Loading...</p>}
        {error && <p className="error">{error}</p>}
        {!loading && !error && (
          <ul>
            {items.map(item => (
              <li key={item.id}>{item.Name}</li>
            ))}
          </ul>
        )}
        {!apiUrl && <p className="error">Note: The backend API URL is missing. Please check the deployment status.</p>}
      </div>
    </>
  )
}

export default App