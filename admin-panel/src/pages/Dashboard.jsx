import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        navigate('/login');
    };

    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <h1 style={styles.title}>8K News Admin Dashboard</h1>
                <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
            </header>
            <main style={styles.main}>
                <div style={styles.welcomeCard}>
                    <h2>Welcome Admin 👋</h2>
                    <p>Successfully connected to the 8K News Management System.</p>
                </div>
            </main>
        </div>
    );
};

const styles = {
    container: {
        minHeight: '100vh',
        background: '#f8f9fa',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem 2rem',
        background: '#fff',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    },
    title: {
        fontSize: '1.25rem',
        margin: 0,
        color: '#333',
    },
    logoutBtn: {
        padding: '0.5rem 1rem',
        borderRadius: '4px',
        border: '1px solid #dc3545',
        background: 'transparent',
        color: '#dc3545',
        cursor: 'pointer',
        fontWeight: '600',
    },
    main: {
        padding: '2rem',
    },
    welcomeCard: {
        background: 'white',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        textAlign: 'center',
    }
};

export default Dashboard;
