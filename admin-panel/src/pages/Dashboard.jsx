import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NewsForm from '../components/NewsForm';
import NewsManager from '../components/NewsManager';
import Sidebar from '../components/Sidebar';
import { ROLES } from '../constants';

const Dashboard = () => {
    const navigate = useNavigate();
    const [role, setRole] = useState(null);
    const [currentView, setCurrentView] = useState('dashboard');

    useEffect(() => {
        const storedRole = localStorage.getItem('adminRole');
        if (!storedRole) {
            navigate('/login');
        } else {
            setRole(storedRole);
            // Default view based on role
            if (storedRole === ROLES.INGESTOR) setCurrentView('create_news');
            else if (storedRole === ROLES.PUBLISHER) setCurrentView('publisher_review');
            else setCurrentView('dashboard');
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminRole');
        localStorage.removeItem('adminEmail');
        navigate('/login');
    };

    const renderContent = () => {
        switch (currentView) {
            case 'create_news':
                return <NewsForm onSuccess={() => setCurrentView('my_drafts')} />;
            case 'my_drafts':
            case 'sub_editor_review':
            case 'senior_editor_review':
            case 'all_news':
            case 'legal_review':
            case 'publisher_review':
                // NewsManager handles filtration internally or via API params if needed.
                // For now, we use the same component as it seems robust.
                return <NewsManager viewMode={currentView} />;
            case 'dashboard':
            default:
                return (
                    <div style={styles.welcomeCard}>
                        <h2>Welcome Back, {role?.replace('_', ' ').toUpperCase()} 👋</h2>
                        <p>Select an option from the sidebar to get started.</p>
                    </div>
                );
        }
    };

    if (!role) return null;

    return (
        <div style={styles.container}>
            <Sidebar role={role} currentView={currentView} onViewChange={setCurrentView} />
            <div style={styles.mainContent}>
                <header style={styles.header}>
                    <h1 style={styles.title}>{currentView.replace('_', ' ').toUpperCase()}</h1>
                    <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
                </header>
                <main style={styles.contentArea}>
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        minHeight: '100vh',
        background: '#f4f6f8',
    },
    mainContent: {
        marginLeft: '260px',
        flex: 1,
        display: 'flex',
        flexDirection: 'column'
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem 2rem',
        background: '#fff',
        borderBottom: '1px solid #dfe2e6',
        height: '60px'
    },
    title: {
        fontSize: '1.2rem',
        margin: 0,
        color: '#1a1c23',
    },
    logoutBtn: {
        padding: '0.4rem 0.8rem',
        borderRadius: '4px',
        border: '1px solid #e0e0e0',
        background: 'white',
        color: '#dc3545',
        cursor: 'pointer',
        fontWeight: '600',
        fontSize: '0.85rem'
    },
    contentArea: {
        padding: '2rem',
        flex: 1,
        overflowY: 'auto'
    },
    welcomeCard: {
        background: 'white',
        padding: '3rem',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        textAlign: 'center',
        marginTop: '2rem'
    }
};

export default Dashboard;
