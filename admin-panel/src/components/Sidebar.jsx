import { ROLES } from '../constants';

const Sidebar = ({ role, currentView, onViewChange }) => {
    const menuItems = [
        {
            id: 'dashboard',
            label: 'Dashboard',
            icon: '📊',
            roles: Object.values(ROLES)
        },
        {
            id: 'create_news',
            label: 'Create News',
            icon: '✍️',
            roles: [ROLES.INGESTOR, ROLES.ADMIN]
        },
        {
            id: 'my_drafts',
            label: 'My Drafts',
            icon: '📝',
            roles: [ROLES.INGESTOR, ROLES.ADMIN]
        },
        {
            id: 'sub_editor_review',
            label: 'Sub-Editor Review',
            icon: '👀',
            roles: [ROLES.SUB_EDITOR, ROLES.ADMIN]
        },
        {
            id: 'senior_editor_review',
            label: 'Senior-Editor Review',
            icon: '⭐',
            roles: [ROLES.SENIOR_EDITOR, ROLES.ADMIN]
        },
        {
            id: 'all_news',
            label: 'Archives',
            icon: '📰',
            roles: [ROLES.SUB_EDITOR, ROLES.SENIOR_EDITOR, ROLES.PUBLISHER, ROLES.ADMIN]
        },
        {
            id: 'legal_review',
            label: 'Legal Check',
            icon: '⚖️',
            roles: [ROLES.LEGAL, ROLES.ADMIN]
        },
        {
            id: 'publisher_review',
            label: 'Publish Queue',
            icon: '🚀',
            roles: [ROLES.PUBLISHER, ROLES.ADMIN]
        }
    ];

    const normalizeRole = (r) => {
        if (!r) return '';
        const lower = r.toLowerCase();
        if (lower === 'ingestor' || lower === 'content_inputter') return ROLES.INGESTOR;
        if (lower === 'admin') return ROLES.ADMIN;
        if (lower === 'publisher') return ROLES.PUBLISHER;
        if (lower === 'sub_editor') return ROLES.SUB_EDITOR;
        if (lower === 'senior_editor') return ROLES.SENIOR_EDITOR;
        if (lower === 'legal') return ROLES.LEGAL;
        return lower;
    };

    const userRole = normalizeRole(role);
    const allowedItems = menuItems.filter(item => item.roles.includes(userRole));

    return (
        <aside style={styles.sidebar}>
            <div style={styles.logo}>
                <h2>8K Admin</h2>
                <span style={styles.roleBadge}>{role?.replace('_', ' ').toUpperCase()}</span>
            </div>
            <nav style={styles.nav}>
                {allowedItems.map(item => (
                    <button
                        key={item.id}
                        onClick={() => onViewChange(item.id)}
                        style={{
                            ...styles.navItem,
                            ...(currentView === item.id ? styles.activeItem : {})
                        }}
                    >
                        <span style={styles.icon}>{item.icon}</span>
                        {item.label}
                    </button>
                ))}
            </nav>
        </aside>
    );
};

const styles = {
    sidebar: {
        width: '260px',
        background: '#1a1c23',
        color: '#fff',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '2px 0 10px rgba(0,0,0,0.1)'
    },
    logo: {
        padding: '1.5rem',
        borderBottom: '1px solid #2d3748',
        textAlign: 'center'
    },
    roleBadge: {
        fontSize: '0.7rem',
        background: '#4a5568',
        padding: '0.2rem 0.5rem',
        borderRadius: '4px',
        marginTop: '0.5rem',
        display: 'inline-block'
    },
    nav: {
        padding: '1rem 0',
        display: 'flex',
        flexDirection: 'column'
    },
    navItem: {
        background: 'transparent',
        border: 'none',
        color: '#a0aec0',
        padding: '1rem 2rem',
        textAlign: 'left',
        cursor: 'pointer',
        fontSize: '0.95rem',
        display: 'flex',
        alignItems: 'center',
        transition: 'all 0.2s',
        gap: '12px'
    },
    activeItem: {
        background: '#2d3748',
        color: '#fff',
        borderLeft: '4px solid #3182ce'
    },
    icon: {
        fontSize: '1.2rem'
    }
};

export default Sidebar;
