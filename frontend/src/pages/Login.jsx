import { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom'; // Ajouté pour la navigation
import '../App.css'; // Assure-toi que ce fichier existe

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    try {
      const { data } = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password
      });
      localStorage.setItem('token', data.token);
      alert('Login successful!');
      window.location.href = '/events';
    } catch (error) {
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

        {/* Lien mot de passe oublié */}
        <div style={{ textAlign: 'right', marginBottom: '1rem' }}>
          <Link to="/forgot-password" className="login-forgot-link">
            Mot de passe oublié ?
          </Link>
        </div>

        <button type="submit" className="login-button">Sign In</button>

        <p className="login-footer">
          Don't have an account? <a href="/register">Register</a>
        </p>
      </form>
    </div>
  );
}

export default Login;

