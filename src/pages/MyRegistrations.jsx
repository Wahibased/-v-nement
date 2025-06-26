import { useEffect, useState } from 'react';
import axios from 'axios';
import '../App.css';

function MyRegistrations() {
  const [registrations, setRegistrations] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get('/api/registrations', {
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

