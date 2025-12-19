import { useState } from 'react';
import axios from 'axios';

export default function DoctorNotes() {
  const [patientId, setPatientId] = useState('');
  const [appointmentId, setAppointmentId] = useState('');
  const [content, setContent] = useState('');

  const handleAddNote = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        'http://localhost:5000/notes',
        { patientId, appointmentId, content },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Note added: ' + res.data.id);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error adding note');
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '50px auto' }}>
      <h1>Add Clinical Note</h1>
      <input placeholder="Patient ID" value={patientId} onChange={(e) => setPatientId(e.target.value)} style={{ width: '100%', marginBottom: 10 }} />
      <input placeholder="Appointment ID" value={appointmentId} onChange={(e) => setAppointmentId(e.target.value)} style={{ width: '100%', marginBottom: 10 }} />
      <textarea placeholder="Content" value={content} onChange={(e) => setContent(e.target.value)} style={{ width: '100%', marginBottom: 10 }} />
      <button onClick={handleAddNote} style={{ width: '100%' }}>Add Note</button>
    </div>
  );
}
