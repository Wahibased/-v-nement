import { useState } from 'react';
import axios from 'axios';

// Access the environment variable set in Vercel
const VITE_API_URL = import.meta.env.VITE_API_URL; //

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      // Use the environment variable for the backend URL
      const { data } = await axios.post(`${VITE_API_URL}/api/auth/forgot-password`, { email });
      setMessage(data.message);
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de l’envoi.');
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Mot de passe oublié</h2>
        {message && <div className="login-success">{message}</div>}
        {error && <div className="login-error">{error}</div>}

        <input
          type="email"
          className="login-input"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <button type="submit" className="login-button">Envoyer</button>
      </form>
    </div>
  );
}

export default ForgotPassword;
