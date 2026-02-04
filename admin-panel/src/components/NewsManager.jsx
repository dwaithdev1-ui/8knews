import axios from 'axios';
import { useEffect, useState } from 'react';
import { ROLES, STATUS } from '../constants';

const NewsManager = ({ viewMode }) => {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState(null); // For Review Modal
    const storedRole = localStorage.getItem('adminRole');
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
    const role = normalizeRole(storedRole);
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
            const response = await axios.get('http://192.168.29.70:3000/api/news', {
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
        const isApproval = [STATUS.SUB_EDITOR_REVIEW, STATUS.SENIOR_EDITOR_REVIEW, STATUS.LEGAL_REVIEW, STATUS.PUBLISHER_REVIEW, STATUS.PUBLISHED].includes(newStatus);
        const remarks = prompt(`Enter remarks for ${newStatus.replace(/_/g, ' ')}${!isApproval ? ' (Mandatory)' : ' (Optional)'}:`);

        if (remarks === null) return; // Cancelled
        if (!isApproval && !remarks.trim()) return alert("Remarks are mandatory for rejections.");

        try {
            await axios.patch(`http://192.168.29.70:3000/api/news/${id}/status`, {
                status: newStatus,
                remarks: remarks || 'Approved'
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSelectedItem(null); // Close modal if open
            fetchNews();
        } catch (err) {
            alert(err.response?.data?.error || 'Action failed');
        }
    };

    const getActions = (item) => {
        const actions = [];

        // Add "View / Review" for everyone
        actions.push({ label: 'View / Review', onClick: () => setSelectedItem(item), color: '#17a2b8' });

        // --- Role Based Workflow Actions ---
        if (role === ROLES.INGESTOR && (item.status === STATUS.DRAFT || item.status === STATUS.REJECTED_BY_SUB_EDITOR)) {
            actions.push({ label: 'Submit for Review', status: STATUS.SUB_EDITOR_REVIEW, color: '#007bff' });
        }
        if (role === ROLES.SUB_EDITOR && item.status === STATUS.SUB_EDITOR_REVIEW) {
            actions.push({ label: 'Approve & Pass to Senior Editor', status: STATUS.SENIOR_EDITOR_REVIEW, color: '#28a745' });
            actions.push({ label: 'Reject & Return to Ingestor', status: STATUS.REJECTED_BY_SUB_EDITOR, color: '#dc3545' });
        }
        if (role === ROLES.SENIOR_EDITOR && item.status === STATUS.SENIOR_EDITOR_REVIEW) {
            actions.push({ label: 'Approve & Pass to Legal', status: STATUS.LEGAL_REVIEW, color: '#17a2b8' });
            actions.push({ label: 'Approve & Pass to Publisher', status: STATUS.PUBLISHER_REVIEW, color: '#ff9800' });
            actions.push({ label: 'Reject & Return to Sub-Editor', status: STATUS.SUB_EDITOR_REVIEW, color: '#dc3545' });
        }
        if (role === ROLES.LEGAL && item.status === STATUS.LEGAL_REVIEW) {
            actions.push({ label: 'Legally Clear & Pass to Publisher', status: STATUS.PUBLISHER_REVIEW, color: '#28a745' });
            actions.push({ label: 'Reject/Block', status: STATUS.REJECTED, color: '#dc3545' });
        }
        if (role === ROLES.PUBLISHER && item.status === STATUS.PUBLISHER_REVIEW) {
            actions.push({ label: '✅ Approve & Publish to News Feed', status: STATUS.PUBLISHED, color: '#6f42c1' });
            actions.push({ label: '❌ Reject & Return to Senior Editor', status: STATUS.SENIOR_EDITOR_REVIEW, color: '#dc3545' });
        }

        // --- Admin Power Actions ---
        if (role === ROLES.ADMIN) {
            if (item.status !== STATUS.PUBLISHED) {
                actions.push({ label: '🚀 Direct Publish to Feed', status: STATUS.PUBLISHED, color: '#6f42c1' });
            }
            // Keep status force options but with different styling
            Object.keys(STATUS).forEach(s => {
                if (STATUS[s] !== item.status && STATUS[s] !== STATUS.PUBLISHED) {
                    actions.push({ label: `Force ${s.replace(/_/g, ' ')}`, status: STATUS[s], color: '#6c757d' });
                }
            });
        }
        return actions;
    };

    const filterNews = (items) => {
        if (!items) return [];
        switch (viewMode) {
            case 'my_drafts':
                return items.filter(i => (i.status === STATUS.DRAFT || i.status === STATUS.REJECTED_BY_SUB_EDITOR) && (i.created_by === email || role === ROLES.ADMIN));
            case 'sub_editor_review':
                return items.filter(i => i.status === STATUS.SUB_EDITOR_REVIEW);
            case 'senior_editor_review':
                return items.filter(i => i.status === STATUS.SENIOR_EDITOR_REVIEW);
            case 'legal_review':
                return items.filter(i => i.status === STATUS.LEGAL_REVIEW);
            case 'publisher_review':
                return items.filter(i => i.status === STATUS.PUBLISHER_REVIEW);
            case 'all_news':
                return items;
            default:
                return items;
        }
    };

    const showHistory = (history) => {
        if (!history || history.length === 0) return alert("No history available.");
        const text = history.map(h =>
            `${new Date(h.date).toLocaleString()} - ${h.status.replace(/_/g, ' ').toUpperCase()} by ${h.updated_by} (${h.role || 'Staff'})\nRemarks: ${h.remarks || 'None'}`
        ).join('\n---\n');
        alert(text);
    };

    const filteredNews = filterNews(news);
    const viewTitles = {
        'my_drafts': 'My Content / Returned',
        'sub_editor_review': 'Sub-Editor Review',
        'senior_editor_review': 'Senior Editor Review',
        'legal_review': 'Legal Clearance',
        'publisher_review': 'Publisher Queue',
        'all_news': 'Archives'
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
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        {item.type === 'ad' && (
                                            <span style={{ ...styles.badge, backgroundColor: '#fab005', color: '#000', fontSize: '0.7rem' }}>
                                                AD
                                            </span>
                                        )}
                                        <div style={{ fontWeight: 'bold' }}>{item.title || '(No Title)'}</div>
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: '#666' }}>{new Date(item.created_at).toLocaleDateString()}</div>
                                </td>
                                <td style={styles.td}>
                                    {Array.isArray(item.category)
                                        ? item.category.map(c => c.name).join(', ')
                                        : (item.category?.name || 'N/A')}
                                </td>
                                <td style={styles.td}>
                                    <span style={{ ...styles.badge, ...getLangStyle(item.language) }}>
                                        {(item.language || 'te').toUpperCase()}
                                    </span>
                                </td>
                                <td style={styles.td}>
                                    <span style={{ ...styles.badge, ...getStatusStyle(item.status) }}>
                                        {item.status.replace(/_/g, ' ').toUpperCase()}
                                    </span>
                                </td>
                                <td style={styles.td}>
                                    <button onClick={() => showHistory(item.history)} style={styles.historyBtn}>
                                        🕒 Log
                                    </button>
                                </td>
                                <td style={styles.td}>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                                        {getActions(item).map((action, idx) => (
                                            <button
                                                key={idx}
                                                onClick={action.onClick || (() => handleStatusChange(item._id, action.status))}
                                                style={{ ...styles.actionBtn, backgroundColor: action.color }}
                                            >
                                                {action.label}
                                            </button>
                                        ))}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {/* Review Modal */}
            {selectedItem && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modalContent}>
                        <div style={styles.modalHeader}>
                            <h2>News Review</h2>
                            <button onClick={() => setSelectedItem(null)} style={styles.closeBtn}>×</button>
                        </div>
                        <div style={styles.modalBody}>
                            {selectedItem.image && (
                                <img
                                    src={`http://192.168.29.70:3000${selectedItem.image}`}
                                    alt="News"
                                    style={styles.reviewImage}
                                />
                            )}
                            <div style={styles.reviewSection}>
                                <label style={styles.reviewLabel}>Title</label>
                                <p style={styles.reviewText}>{selectedItem.title || '(No Title)'}</p>
                            </div>
                            <div style={styles.reviewSection}>
                                <label style={styles.reviewLabel}>Content / Description</label>
                                <p style={{ ...styles.reviewText, whiteSpace: 'pre-wrap' }}>{selectedItem.description || '(No Description)'}</p>
                            </div>
                            {selectedItem.type === 'ad' && (
                                <div style={{ ...styles.reviewSection, background: '#fff9db', padding: '0.5rem', borderRadius: '4px' }}>
                                    <label style={styles.reviewLabel}>🎯 Redirect URL (External Link)</label>
                                    <p style={{ ...styles.reviewText, color: '#e67e22', fontWeight: 'bold' }}>
                                        <a href={selectedItem.redirect_url} target="_blank" rel="noopener noreferrer">
                                            {selectedItem.redirect_url}
                                        </a>
                                    </p>
                                    <p style={{ fontSize: '0.8rem', margin: '5px 0 0 0' }}>Placement: {selectedItem.placement?.toUpperCase()}</p>
                                </div>
                            )}
                            <div style={styles.reviewRow}>
                                <div style={styles.reviewSection}>
                                    <label style={styles.reviewLabel}>Category</label>
                                    <p style={styles.reviewText}>
                                        {Array.isArray(selectedItem.category)
                                            ? selectedItem.category.map(c => c.name).join(', ')
                                            : (selectedItem.category?.name || 'N/A')}
                                    </p>
                                </div>
                                <div style={styles.reviewSection}>
                                    <label style={styles.reviewLabel}>Language</label>
                                    <p style={styles.reviewText}>{selectedItem.language?.toUpperCase() || 'TE'}</p>
                                </div>
                                <div style={styles.reviewSection}>
                                    <label style={styles.reviewLabel}>Creator</label>
                                    <p style={styles.reviewText}>{selectedItem.created_by}</p>
                                </div>
                            </div>
                        </div>
                        <div style={styles.modalFooter}>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                {getActions(selectedItem).filter(a => a.status).map((action, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleStatusChange(selectedItem._id, action.status)}
                                        style={{ ...styles.actionBtn, fontSize: '1rem', padding: '0.6rem 1.2rem', backgroundColor: action.color }}
                                    >
                                        {action.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
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
        case STATUS.REJECTED_BY_SUB_EDITOR: return { background: '#ffebee', color: '#b71c1c' };
        case STATUS.SUB_EDITOR_REVIEW: return { background: '#cce5ff', color: '#004085' };
        case STATUS.SENIOR_EDITOR_REVIEW: return { background: '#e2e3e5', color: '#383d41' };
        case STATUS.LEGAL_REVIEW: return { background: '#e0f7fa', color: '#006064' };
        case STATUS.PUBLISHER_REVIEW: return { background: '#fce4ec', color: '#880e4f' };
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
        cursor: 'pointer'
    },
    modalOverlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000
    },
    modalContent: {
        background: 'white',
        width: '90%',
        maxWidth: '800px',
        borderRadius: '8px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
    },
    modalHeader: {
        padding: '1rem 1.5rem',
        borderBottom: '1px solid #eee',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    closeBtn: {
        background: 'none',
        border: 'none',
        fontSize: '1.5rem',
        cursor: 'pointer'
    },
    modalBody: {
        padding: '1.5rem',
        overflowY: 'auto',
        flex: 1
    },
    modalFooter: {
        padding: '1rem 1.5rem',
        borderTop: '1px solid #eee',
        display: 'flex',
        justifyContent: 'flex-end'
    },
    reviewImage: {
        width: '100%',
        maxHeight: '300px',
        objectFit: 'cover',
        borderRadius: '4px',
        marginBottom: '1rem'
    },
    reviewSection: {
        marginBottom: '1rem'
    },
    reviewLabel: {
        fontSize: '0.8rem',
        color: '#666',
        fontWeight: 'bold',
        display: 'block',
        marginBottom: '0.3rem'
    },
    reviewText: {
        fontSize: '1rem',
        color: '#333',
        margin: 0
    },
    reviewRow: {
        display: 'flex',
        gap: '2rem',
        marginTop: '1rem',
        flexWrap: 'wrap'
    },
    historyBtn: {
        background: 'none',
        border: 'none',
        color: '#007bff',
        cursor: 'pointer',
        fontSize: '0.85rem'
    }
};

export default NewsManager;
