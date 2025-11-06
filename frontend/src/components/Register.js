import React, { useState, useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    role: 'Annotator',
  });
  const { registerUser } = useContext(AuthContext);
  const history = useHistory();

  const { username, password, email, role } = formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = (e) => {
    e.preventDefault();
    registerUser(formData);
    history.push('/login');
  };

  return (
    <form onSubmit={onSubmit}>
      <input
        type="text"
        placeholder="Username"
        name="username"
        value={username}
        onChange={onChange}
        required
      />
      <input
        type="password"
        placeholder="Password"
        name="password"
        value={password}
        onChange={onChange}
        required
      />
      <input
        type="email"
        placeholder="Email"
        name="email"
        value={email}
        onChange={onChange}
        required
      />
      <select name="role" value={role} onChange={onChange}>
        <option value="Annotator">Annotator</option>
        <option value="Data Specialist">Data Specialist</option>
      </select>
      <button type="submit">Register</button>
    </form>
  );
};

export default Register;