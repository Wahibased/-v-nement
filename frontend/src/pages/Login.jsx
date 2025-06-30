import { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate
import '../App.css';

// Access the environment variable set by Netlify
const VITE_API_URL = import.meta.env.VITE_API_URL;

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate(); // Initialize the useNavigate hook

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    try {
      const { data } = await axios.post(`${VITE_API_URL}/api/auth/login`, {
        email,
        password
      });
      localStorage.setItem('token', data.token);
      
      // Navigate directly to the events page without an alert
      navigate('/events'); 

    } catch (error) {
      // Keep error handling for failed logins
      setErrorMsg(error.response?.data?.error || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2 className="login-title">Login to Your Account</h2>

        {errorMsg && <div className="login-error">{errorMsg}</div>}

        <input
          type="email"
          className="login-input"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          className="login-input"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <div style={{ textAlign: 'right', marginBottom: '1rem' }}>
          <Link to="/forgot-password" className="login-forgot-link">
            Mot de passe oublié ?
          </Link>
        </div>

        <button type="submit" className="login-button">Sign In</button>

        <p className="login-footer">
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </form>
    </div>
  );
}

export default Login;
