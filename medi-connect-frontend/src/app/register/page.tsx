'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../lib/api';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'PATIENT' | 'DOCTOR'>('PATIENT');
  const [specialization, setSpecialization] = useState(''); // new state
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async () => {
    console.log('Register clicked!', { name, email, password, role, specialization });
    setLoading(true);
    try {
      const payload: { name: string; email: string; password: string; role: 'PATIENT' | 'DOCTOR'; specialization?: string } = { name, email, password, role };
      if (role === 'DOCTOR') {
        payload['specialization'] = specialization; // include only for doctors
      }

      const res = await api.post('/auth/register', payload);
      alert(res.data.message || 'Registration successful! Please login.');
      router.push('/');
    } catch (err: any) {
      console.error('Registration error:', err);
      alert(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Register</h1>

        {/* Name input */}
        <input
          style={styles.input}
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        {/* Email input */}
        <input
          style={styles.input}
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* Password input */}
        <input
          style={styles.input}
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {/* Role select */}
        <select
          style={styles.input}
          value={role}
          onChange={(e) => setRole(e.target.value as 'PATIENT' | 'DOCTOR')}
        >
          <option value="PATIENT">Patient</option>
          <option value="DOCTOR">Doctor</option>
        </select>

        {/* Specialization input - only for doctors */}
        {role === 'DOCTOR' && (
          <input
            style={styles.input}
            type="text"
            placeholder="Specialization"
            value={specialization}
            onChange={(e) => setSpecialization(e.target.value)}
          />
        )}

        {/* Register button */}
        <button
          style={styles.button}
          type="button"
          onClick={handleRegister}
          disabled={loading}
        >
          {loading ? 'Registering...' : 'Register'}
        </button>

        <p style={styles.text}>
          Already have an account?{' '}
          <span style={styles.link} onClick={() => router.push('/')}>
            Login
          </span>
        </p>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    background: '#f0f2f5',
  },
  card: {
    background: '#fff',
    padding: 40,
    borderRadius: 8,
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    width: 350,
    textAlign: 'center',
  },
  title: { marginBottom: 20 },
  input: {
    width: '100%',
    padding: 10,
    marginBottom: 15,
    borderRadius: 4,
    border: '1px solid #ccc',
    fontSize: 16,
  },
  button: {
    width: '100%',
    padding: 10,
    background: '#0070f3',
    color: '#fff',
    border: 'none',
    borderRadius: 4,
    cursor: 'pointer',
    fontSize: 16,
  },
  text: { marginTop: 15, fontSize: 14 },
  link: { color: '#0070f3', cursor: 'pointer' },
};
