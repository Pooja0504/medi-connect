'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../../lib/api';
import Header from '../../components/Header';

interface Appointment {
  id: string;
  patientId: string;
  date: string;
}

export default function DoctorDashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Get token from localStorage after client mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      router.push('/'); // redirect to login if no token
    } else {
      setToken(storedToken);
    }
  }, [router]);

  // Fetch appointments once token is available
  useEffect(() => {
    if (token) {
      fetchAppointments();
    }
  }, [token]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      console.log('Fetching doctor appointments with token:', token);
      const res = await api.get('/appointments/doctor/upcoming', {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Doctor appointments:', res.data);
      setAppointments(res.data);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Header role="DOCTOR" />
      <button
        style={{ marginBottom: 20, marginLeft: 20 }}
        onClick={() => window.location.href = '/doctor/dashboard/notes'}
      >
        Add Clinical Notes
      </button>
      <div style={styles.container}>
        <h2>Upcoming Appointments</h2>
        {loading ? (
          <p>Loading...</p>
        ) : appointments.length === 0 ? (
          <p>No upcoming appointments.</p>
        ) : (
          <ul style={styles.list}>
            {appointments.map((a) => (
              <li key={a.id} style={styles.item}>
                <strong>Patient:</strong> {a.patientId} |{' '}
                <strong>Date:</strong> {new Date(a.date).toLocaleString()}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: { maxWidth: 700, margin: '40px auto', padding: 20 },
  list: { listStyle: 'none', padding: 0 },
  item: {
    padding: 10,
    borderBottom: '1px solid #ccc',
    marginBottom: 5,
    borderRadius: 4,
    background: '#f9f9f9',
  },
};
