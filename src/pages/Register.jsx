import { useState } from 'react';
import axios from 'axios';
import '../App.css';

// Access the environment variable set in Vercel
const VITE_API_URL = import.meta.env.VITE_API_URL; //

function Register() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    console.log('Sending:', { email, name, password }); // Debug

    try {
      // Use the environment variable for the backend URL
      const { data } = await axios.post(`${VITE_API_URL}/api/auth/register`, {
        email,
        name,
        password,
      });

      alert(data.message); // Message de succès
      window.location.href = '/login'; // Redirection
    } catch (error) {
      console.error('Erreur inscription :', error);
      setErrorMsg(error.response?.data?.error || error.message || 'Registration failed.');
    }
  };

  return (
    <div className="register-container">
      <form className="register-form" onSubmit={handleSubmit}>
        <h2 className="register-title">Create an Account</h2>

        {errorMsg && <div className="register-error">{errorMsg}</div>}

        <input
          type="text"
          className="register-input"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <input
          type="email"
          className="register-input"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          className="register-input"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" className="register-button">Register</button>

        <p className="register-footer">
          Already have an account? <a href="/login">Login</a>
        </p>
      </form>
    </div>
  );
}

export default Register;

