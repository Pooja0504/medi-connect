'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../../lib/api';

interface Doctor {
  id: string;
  name: string;
  specialization: string;
}

interface Appointment {
  id: string;
  doctorId: string;
  date: string;
  doctorName?: string;
}

export default function PatientDashboard() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);

  // Form states
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [loading, setLoading] = useState(false);

  // Appointments
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);

  // Get token from localStorage after client mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      router.push('/'); // redirect to login if no token
    } else {
      setToken(storedToken);
    }
  }, [router]);

  // Fetch doctors & appointments once token is available
  useEffect(() => {
    if (token) {
      fetchDoctors();
      fetchAppointments();
    }
  }, [token]);

  const fetchDoctors = async () => {
    try {
      console.log('Fetching doctors with token:', token);
      const res = await api.get('/doctors/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Res doctors : ', res.data);
      
      setDoctors(res.data);
      if (res.data.length > 0) setSelectedDoctorId(res.data[0].id);
    } catch (err: any) {
      console.error('Error fetching doctors:', err);
      console.error('Full error:', JSON.stringify(err, null, 2));
      if (err.response) {
        console.error('Response status:', err.response.status);
        console.error('Response data:', err.response.data);
      }
      setDoctors([]);
    }
  };

  const fetchAppointments = async () => {
    try {
      const res = await api.get('/appointments/patient/upcoming', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUpcomingAppointments(res.data);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setUpcomingAppointments([]);
    }
  };

  const handleCreateAppointment = async () => {
    if (!selectedDoctorId || !selectedDate) {
      alert('Please select a doctor and date');
      return;
    }
    setLoading(true);
    try {
      await api.post(
        '/appointments/patient',
        { doctorId: selectedDoctorId, date: selectedDate },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Appointment created successfully!');
      setSelectedDate('');
      fetchAppointments(); // refresh list
    } catch (err: any) {
      console.error('Error creating appointment:', err);
      alert(err.response?.data?.message || 'Failed to create appointment');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/');
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>MediConnect - PATIENT Portal</h1>
          <button style={styles.logoutButton} onClick={handleLogout}>
            Logout
          </button>
        </div>

        {/* Create Appointment */}
        <div style={styles.formSection}>
          <h2 style={styles.sectionTitle}>Create Appointment</h2>

          <select
            style={styles.input}
            value={selectedDoctorId}
            onChange={(e) => setSelectedDoctorId(e.target.value)}
          >
            {doctors.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>

          <input
            style={styles.input}
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />

          <button
            style={styles.button}
            type="button"
            onClick={handleCreateAppointment}
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Appointment'}
          </button>
        </div>

        {/* Upcoming Appointments */}
        <div style={styles.appointmentsSection}>
          <h2 style={styles.sectionTitle}>Upcoming Appointments</h2>
          {upcomingAppointments.length === 0 ? (
            <p>No upcoming appointments.</p>
          ) : (
            <ul>
              {upcomingAppointments.map((appt) => (
                <li key={appt.id}>
                  Doctor: {appt.doctorName || appt.doctorId}, Date:{' '}
                  {new Date(appt.date).toLocaleString()}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    padding: 40,
    background: '#f0f2f5',
    minHeight: '100vh',
  },
  card: {
    background: '#fff',
    padding: 30,
    borderRadius: 8,
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    width: 500,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: { marginBottom: 10 },
  logoutButton: {
    background: '#ff4d4f',
    color: '#fff',
    border: 'none',
    padding: '8px 12px',
    borderRadius: 4,
    cursor: 'pointer',
  },
  formSection: { marginTop: 20, marginBottom: 30 },
  sectionTitle: { marginBottom: 10 },
  input: {
    width: '100%',
    padding: 10,
    marginBottom: 10,
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
  appointmentsSection: {},
};
