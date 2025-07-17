import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [data, setData] = useState(null);

  // This is the important part!
  // It reads the address from the .env.production file.
  const API_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    // Now we combine the backend address with the specific request
    fetch(`${API_URL}/some-data`)
      .then(res => res.json())
      .then(data => setData(data));
  }, []);

  return (
    // ... your JSX here
  )
}

export default App