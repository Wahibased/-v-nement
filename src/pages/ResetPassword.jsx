import { useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

function ResetPassword() {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(`http://localhost:5000/api/auth/reset-password/${token}`, { password });
      setSuccess(data.message);
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur de réinitialisation');
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Réinitialiser votre mot de passe</h2>
        {success && <div className="login-success">{success}</div>}
        {error && <div className="login-error">{error}</div>}

        <input
          type="password"
          className="login-input"
          placeholder="Nouveau mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="login-button">Réinitialiser</button>
      </form>
    </div>
  );
}

export default ResetPassword;
