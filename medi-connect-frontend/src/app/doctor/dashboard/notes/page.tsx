'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../../../lib/api';
import Header from '../../../components/Header';

interface Appointment {
  id: string;
  patientId: string;
  date: string;
}

export default function DoctorNotesPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState('');
  const [note, setNote] = useState('');
  const [message, setMessage] = useState('');
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

  // Load doctor's appointments
  useEffect(() => {
    if (token) {
      fetchAppointments();
    }
  }, [token]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      console.log('Fetching doctor appointments for notes');
      const res = await api.get('/appointments/doctor/upcoming', {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Appointments loaded:', res.data);
      setAppointments(res.data);
    } catch (err) {
      console.error('Failed to load appointments:', err);
      setMessage('Failed to load appointments');
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  // Submit clinical note
  const submitNote = async () => {
    if (!selectedAppointmentId || !note) {
      setMessage('Please select appointment and write note');
      return;
    }

    try {
      console.log('Submitting note for appointment:', selectedAppointmentId);
      await api.post(
        '/notes',
        {
          appointmentId: selectedAppointmentId,
          content: note,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMessage('✅ Clinical note added successfully');
      setNote('');
      setSelectedAppointmentId('');
    } catch (err) {
      console.error('Failed to add note:', err);
      setMessage('❌ Failed to add note');
    }
  };

  return (
    <div>
      <Header role="DOCTOR" />

      <div style={styles.container}>
        <h2>Add Clinical Note</h2>

        {/* Appointment selector */}
        <select
          style={styles.select}
          value={selectedAppointmentId}
          onChange={(e) => setSelectedAppointmentId(e.target.value)}
        >
          <option value="">Select Appointment</option>
          {appointments.map((a) => (
            <option key={a.id} value={a.id}>
              Patient: {a.patientId} | {new Date(a.date).toLocaleString()}
            </option>
          ))}
        </select>

        {/* Note textarea */}
        <textarea
          style={styles.textarea}
          placeholder="Write clinical note here..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />

        <button style={styles.button} onClick={submitNote}>
          Submit Note
        </button>

        {message && <p style={styles.message}>{message}</p>}
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: 700,
    margin: '40px auto',
    padding: 20,
    background: '#fff',
    borderRadius: 8,
    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
  },
  select: {
    width: '100%',
    padding: 10,
    marginBottom: 15,
    borderRadius: 4,
    border: '1px solid #ccc',
  },
  textarea: {
    width: '100%',
    minHeight: 120,
    padding: 10,
    borderRadius: 4,
    border: '1px solid #ccc',
    marginBottom: 15,
  },
  button: {
    padding: '10px 20px',
    background: '#0070f3',
    color: '#fff',
    border: 'none',
    borderRadius: 4,
    cursor: 'pointer',
  },
  message: {
    marginTop: 15,
    fontWeight: 'bold',
  },
};
