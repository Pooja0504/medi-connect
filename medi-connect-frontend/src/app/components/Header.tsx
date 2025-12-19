'use client';
import { useRouter } from 'next/navigation';

interface HeaderProps {
  role: 'PATIENT' | 'DOCTOR';
}

export default function Header({ role }: HeaderProps) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/');
  };

  return (
    <header style={styles.header}>
      <h1 style={styles.title}>MediConnect - {role} Portal</h1>
      <div>
        <button style={styles.button} onClick={handleLogout}>
          Logout
        </button>
      </div>
    </header>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px 30px',
    backgroundColor: '#0070f3',
    color: '#fff',
  },
  title: { margin: 0 },
  button: {
    padding: '8px 16px',
    borderRadius: 4,
    border: 'none',
    background: '#fff',
    color: '#0070f3',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
};
