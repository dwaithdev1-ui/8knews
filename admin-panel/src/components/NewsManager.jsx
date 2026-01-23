import axios from 'axios';
import { useEffect, useState } from 'react';
import { ROLES, STATUS } from '../constants';

const NewsManager = ({ viewMode }) => {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const role = localStorage.getItem('adminRole');
    const email = localStorage.getItem('adminEmail');
    const token = localStorage.getItem('adminToken');

    useEffect(() => {
        fetchNews();
    }, [viewMode]); // Re-fetch or re-filter when view changes

    const fetchNews = async () => {
        setLoading(true);
        try {
            // Ideally backend supports filtering, but for now we fetch all and filter client side
            // to avoid modifying backend as per constraints.
            const response = await axios.get('http://localhost:3000/api/news', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNews(response.data);
            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch news', err);
            setLoading(false);
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        const remarks = prompt("Enter remarks for this action:");
        if (remarks === null) return; // Cancelled

        try {
            await axios.patch(`http://localhost:3000/api/news/${id}/status`, {
                status: newStatus,
                remarks
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchNews();
        } catch (err) {
            alert(err.response?.data?.error || 'Action failed');
        }
    };

    const getActions = (item) => {
        const actions = [];
        // Helper to check if user can review
        const isOwner = item.created_by === email; // backend needs to return created_by email or id

        if (role === ROLES.INGESTOR && item.status === STATUS.DRAFT) {
            actions.push({ label: 'Submit for Review', status: STATUS.PENDING_REVIEW, color: '#007bff' });
        }
        if (role === ROLES.SUB_EDITOR && item.status === STATUS.PENDING_REVIEW) {
            actions.push({ label: 'Approve', status: STATUS.PENDING_APPROVAL, color: '#28a745' });
            actions.push({ label: 'Reject', status: STATUS.REJECTED, color: '#dc3545' });
        }
        // Senior Editor approves to Ready for Legal/Publish
        if (role === ROLES.SENIOR_EDITOR && item.status === STATUS.PENDING_APPROVAL) {
            actions.push({ label: 'Approve (Legal Check)', status: STATUS.PENDING_LEGAL_REVIEW, color: '#17a2b8' });
            actions.push({ label: 'Direct Approve', status: STATUS.APPROVED, color: '#28a745' });
            actions.push({ label: 'Reject', status: STATUS.REJECTED, color: '#dc3545' });
        }
        if (role === ROLES.LEGAL && item.status === STATUS.PENDING_LEGAL_REVIEW) {
            actions.push({ label: 'Legally Clear', status: STATUS.APPROVED, color: '#28a745' });
            actions.push({ label: 'Block', status: STATUS.REJECTED, color: '#dc3545' });
        }
        if (role === ROLES.PUBLISHER && item.status === STATUS.APPROVED) {
            actions.push({ label: 'Publish Live', status: STATUS.PUBLISHED, color: '#6f42c1' });
        }
        if (role === ROLES.ADMIN) {
            Object.keys(STATUS).forEach(s => {
                if (STATUS[s] !== item.status) {
                    actions.push({ label: `Force ${s}`, status: STATUS[s], color: '#6c757d' });
                }
            });
        }
        return actions;
    };

    const filterNews = (items) => {
        if (!items) return [];
        switch (viewMode) {
            case 'my_drafts':
                // Filter by creator email and draft status
                return items.filter(i => i.status === STATUS.DRAFT && (i.created_by === email || role === ROLES.ADMIN));
            case 'pending_review':
                return items.filter(i => i.status === STATUS.PENDING_REVIEW);
            case 'pending_approval': // For Senior Editors checking Sub Editor work
                return items.filter(i => i.status === STATUS.PENDING_APPROVAL);
            case 'legal_review':
                return items.filter(i => i.status === STATUS.PENDING_LEGAL_REVIEW);
            case 'publish_queue':
                return items.filter(i => i.status === STATUS.APPROVED);
            case 'all_news':
                // Exclude drafts mostly, or show everything? Let's show everything except maybe deleted
                return items;
            default:
                return items;
        }
    };

    const showHistory = (history) => {
        if (!history || history.length === 0) return alert("No history available.");
        const text = history.map(h =>
            `${new Date(h.date).toLocaleString()} - ${h.status.toUpperCase()} by ${h.updated_by}\nRemarks: ${h.remarks || 'None'}`
        ).join('\n---\n');
        alert(text);
    };

    const filteredNews = filterNews(news);
    const viewTitles = {
        'my_drafts': 'My Drafts',
        'pending_review': 'Pending Sub-Editor Review',
        'legal_review': 'Pending Legal Clearance',
        'publish_queue': 'Ready to Publish',
        'all_news': 'All News Archives'
    };

    if (loading) return <div>Loading content...</div>;

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h3>{viewTitles[viewMode] || 'Content Management'} ({filteredNews.length})</h3>
                <button onClick={fetchNews} style={styles.refreshBtn}>Refresh</button>
            </div>
            {filteredNews.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#666' }}>No news items found in this category.</p>
            ) : (
                <table style={styles.table}>
                    <thead>
                        <tr style={styles.thRow}>
                            <th style={styles.th}>Title</th>
                            <th style={styles.th}>Category</th>
                            <th style={styles.th}>Lang</th>
                            <th style={styles.th}>Status</th>
                            <th style={styles.th}>History</th>
                            <th style={styles.th}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredNews.map(item => (
                            <tr key={item._id} style={styles.tr}>
                                <td style={styles.td}>
                                    <div style={{ fontWeight: 'bold' }}>{item.title}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#666' }}>{new Date(item.created_at).toLocaleDateString()}</div>
                                </td>
                                <td style={styles.td}>{item.category?.name || 'N/A'}</td>
                                <td style={styles.td}>
                                    <span style={{ ...styles.badge, ...getLangStyle(item.language) }}>
                                        {(item.language || 'te').toUpperCase()}
                                    </span>
                                </td>
                                <td style={styles.td}>
                                    <span style={{ ...styles.badge, ...getStatusStyle(item.status) }}>
                                        {item.status.replace('_', ' ').toUpperCase()}
                                    </span>
                                </td>
                                <td style={styles.td}>
                                    <button onClick={() => showHistory(item.history)} style={styles.historyBtn}>
                                        🕒 Log
                                    </button>
                                </td>
                                <td style={styles.td}>
                                    {getActions(item).map(action => (
                                        <button
                                            key={action.status}
                                            onClick={() => handleStatusChange(item._id, action.status)}
                                            style={{ ...styles.actionBtn, backgroundColor: action.color }}
                                        >
                                            {action.label}
                                        </button>
                                    ))}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

const getLangStyle = (lang) => {
    switch (lang) {
        case 'en': return { background: '#e3f2fd', color: '#0d47a1' };
        case 'hi': return { background: '#fff3e0', color: '#e65100' };
        case 'te': return { background: '#f1f8e9', color: '#33691e' };
        default: return { background: '#f5f5f5', color: '#616161' };
    }
};

const getStatusStyle = (status) => {
    switch (status) {
        case STATUS.PUBLISHED: return { background: '#d4edda', color: '#155724' };
        case STATUS.DRAFT: return { background: '#fff3cd', color: '#856404' };
        case STATUS.REJECTED: return { background: '#f8d7da', color: '#721c24' };
        case STATUS.PENDING_REVIEW: return { background: '#cce5ff', color: '#004085' };
        case STATUS.PENDING_APPROVAL: return { background: '#e2e3e5', color: '#383d41' };
        case STATUS.PENDING_LEGAL_REVIEW: return { background: '#e0f7fa', color: '#006064' };
        default: return { background: '#eee', color: '#333' };
    }
};

const styles = {
    container: { background: 'white', padding: '1.5rem', borderRadius: '8px', marginTop: '1.5rem' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' },
    refreshBtn: { padding: '0.4rem 0.8rem', cursor: 'pointer' },
    table: { width: '100%', borderCollapse: 'collapse' },
    thRow: { background: '#f8f9fa', textAlign: 'left' },
    th: { padding: '0.75rem', borderBottom: '2px solid #dee2e6' },
    tr: { borderBottom: '1px solid #dee2e6' },
    td: { padding: '0.75rem' },
    badge: { padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' },
    actionBtn: {
        padding: '0.3rem 0.6rem',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        fontSize: '0.7rem',
        marginRight: '0.4rem',
        cursor: 'pointer'
    }
};

export default NewsManager;
