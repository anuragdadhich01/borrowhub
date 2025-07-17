import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // This reads the backend address from your .env.production file
  const API_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    // IMPORTANT: If your API endpoint is not /items, change it here.
    // For example, it might be /users or /products.
    const endpoint = '/items';

    fetch(`${API_URL}${endpoint}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(responseData => {
        setData(responseData);
        setLoading(false);
      })
      .catch(error => {
        setError(error);
        setLoading(false);
      });
  }, [API_URL]); // The effect will re-run if API_URL changes (it won't, but this is good practice)

  return (
    <>
      <h1>BorrowHubb</h1>
      <div>
        <h2>Data from the API:</h2>
        {loading && <p>Loading...</p>}
        {error && <p>Error: {error.message}</p>}
        {data && (
          <pre>
            {JSON.stringify(data, null, 2)}
          </pre>
        )}
      </div>
    </>
  );
}

export default App;