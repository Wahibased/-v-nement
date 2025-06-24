import { useEffect, useState } from 'react';
import axios from 'axios';
import '../App.css';

// Accédez à la variable d'environnement définie dans Netlify
const VITE_API_URL = import.meta.env.VITE_API_URL;

function MyRegistrations() {
  const [registrations, setRegistrations] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Utilisez la variable d'environnement pour l'URL du backend
        const { data } = await axios.get(`${VITE_API_URL}/api/registrations`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setRegistrations(data);
      } catch (error) {
        console.error('Failed to load registrations:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="registration-container">
      <h2 className="registration-title">🪐 My Event Registrations</h2>
      {registrations.length === 0 ? (
        <p className="registration-empty">No registrations found.</p>
      ) : (
        <div className="registration-list">
          {registrations.map((event) => (
            <div key={event._id} className="registration-card">
              <h3>{event.title}</h3>
              <p>{event.description}</p>
              <span>{new Date(event.date).toLocaleDateString()}</span>
              <span className="location">{event.location}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyRegistrations;