import { useState } from 'react';
import axios from 'axios';
import '../App.css';

const VITE_API_URL = import.meta.env.VITE_API_URL;

function CreateEvent() {
  const [form, setForm] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
  });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      await axios.post(`${VITE_API_URL}/api/events`, form, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setMessage('✅ Event created successfully!');
      setForm({ title: '', description: '', date: '', location: '' });
    } catch {
      setMessage('❌ Failed to create event. Please try again.');
    }
  };

  return (
    <div className="event-container">
      <form className="event-form" onSubmit={handleSubmit}>
        <h2 className="event-title">Create New Event</h2>
        {message && <div className="event-message">{message}</div>}
        <input type="text" name="title" placeholder="Title" value={form.title} onChange={handleChange} className="event-input" required />
        <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} className="event-input" rows="4" required />
        <input type="date" name="date" value={form.date} onChange={handleChange} className="event-input" required />
        <input type="text" name="location" placeholder="Location" value={form.location} onChange={handleChange} className="event-input" required />
        <button type="submit" className="event-button">Create Event</button>
      </form>
    </div>
  );
}

export default CreateEvent;
