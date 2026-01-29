import axios from 'axios';
import { useEffect, useState } from 'react';
import { ReactTransliterate } from 'react-transliterate';
import 'react-transliterate/dist/index.css';

const NewsForm = ({ onSuccess }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category_ids: [],
        sub_category: '',
        location_id: '',
        is_full_card: false,
        is_video: false,
        language: 'te',
        image: null,
        type: 'news', // 'news' or 'ad'
        redirect_url: '',
        placement: 'trending' // 'trending' or 'home'
    });
    const [categories, setCategories] = useState([]);
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [translating, setTranslating] = useState({ title: false, desc: false });
    const [phoneticEnabled, setPhoneticEnabled] = useState(true);
    const token = localStorage.getItem('adminToken');

    useEffect(() => {
        fetchMetadata();
    }, []);

    const fetchMetadata = async () => {
        try {
            const [cats, locs] = await Promise.all([
                axios.get('http://localhost:3000/api/categories'),
                axios.get('http://localhost:3000/api/locations')
            ]);
            setCategories(cats.data || []);
            setLocations(locs.data || []);
        } catch (err) {
            console.error('Failed to fetch metadata', err);
        }
    };

    const translateText = async (text, field) => {
        if (!text) return;
        setTranslating(prev => ({ ...prev, [field]: true }));
        try {
            // Protect numbers from being translated
            const numberMap = new Map();
            let protectedText = text.replace(/(\d+)/g, (match, number) => {
                const placeholder = `__NUM_${numberMap.size}__`;
                numberMap.set(placeholder, number);
                return placeholder;
            });

            const response = await axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=te&dt=t&q=${encodeURIComponent(protectedText)}`);

            let translatedText = '';
            if (response.data && response.data[0]) {
                translatedText = response.data[0].map(item => item[0]).join('');
            }

            // Restore numbers
            numberMap.forEach((value, key) => {
                translatedText = translatedText.split(key).join(value);
            });

            setFormData(prev => ({ ...prev, [field]: translatedText }));
        } catch (err) {
            console.error('Translation failed', err);
            alert('Translation service failed. Please try again or enter manually.');
        } finally {
            setTranslating(prev => ({ ...prev, [field]: false }));
        }
    };

    const handleSubmit = async (e, submitStatus = 'draft') => {
        if (e) e.preventDefault();

        let remarks = 'Initial creation';
        if (submitStatus === 'pending_review') {
            submitStatus = 'sub_editor_review'; // Standardized
            remarks = prompt("Enter remarks for submission:");
            if (remarks === null) return; // User cancelled
        }

        setLoading(true);

        const data = new FormData();
        data.append('title', formData.title);
        data.append('description', formData.description);
        data.append('category_ids', JSON.stringify(formData.category_ids)); // Send as JSON array
        if (formData.sub_category) data.append('sub_category', formData.sub_category);
        if (formData.location_id) data.append('location_id', formData.location_id);
        data.append('is_full_card', formData.is_full_card);
        data.append('is_video', formData.is_video);
        data.append('language', formData.language);
        data.append('status', submitStatus);
        data.append('remarks', remarks);
        data.append('type', formData.type);
        data.append('redirect_url', formData.redirect_url);
        data.append('placement', formData.placement);

        if (formData.image) {
            data.append('image', formData.image);
        }

        try {
            await axios.post('http://localhost:3000/api/news', data, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setFormData({
                title: '',
                description: '',
                category_ids: [],
                sub_category: '',
                location_id: '',
                is_full_card: false,
                is_video: false,
                language: 'te',
                type: 'news',
                redirect_url: '',
                placement: 'trending',
                image: null
            });
            if (document.getElementById('imageInput')) {
                document.getElementById('imageInput').value = '';
            }
            onSuccess();
        } catch (err) {
            const errorMsg = err.response?.data?.error || 'Failed to create news';
            if (err.response?.status === 401 || err.response?.status === 403 || errorMsg === 'Invalid token') {
                alert('Session expired. Please logout and login again.');
            } else {
                alert(errorMsg);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <h3 style={styles.title}>Submit New Content</h3>
            <div style={styles.toggleRow}>
                <label style={styles.toggleLabel}>
                    <input
                        type="checkbox"
                        checked={phoneticEnabled}
                        onChange={e => setPhoneticEnabled(e.target.checked)}
                    /> Phonetic Typing (Eng → Tel)
                </label>
            </div>
            <form onSubmit={handleSubmit} style={styles.form}>
                <div style={styles.section}>
                    <label style={styles.sectionLabel}>Content Type:</label>
                    <div style={{ display: 'flex', gap: '20px', marginBottom: '1rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                            <input
                                type="radio"
                                name="type"
                                value="news"
                                checked={formData.type === 'news'}
                                onChange={e => setFormData({ ...formData, type: e.target.value })}
                            /> News Item
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                            <input
                                type="radio"
                                name="type"
                                value="ad"
                                checked={formData.type === 'ad'}
                                onChange={e => {
                                    // Auto-select 'ads' category if it exists
                                    const adCat = categories.find(c => c.slug === 'ads');
                                    setFormData({
                                        ...formData,
                                        type: e.target.value,
                                        category_ids: adCat ? [adCat._id] : formData.category_ids,
                                        is_full_card: true // Ads are usually full card
                                    });
                                }}
                            /> Advertisement / Sponsored
                        </label>
                    </div>
                </div>

                {formData.type === 'ad' && (
                    <div style={{ ...styles.section, background: '#fff9db', padding: '1rem', borderRadius: '4px', border: '1px solid #fab005', marginBottom: '1rem' }}>
                        <div style={styles.row}>
                            <input
                                type="url"
                                placeholder="Mandatory Redirect URL (e.g., https://example.com)"
                                value={formData.redirect_url}
                                onChange={e => setFormData({ ...formData, redirect_url: e.target.value })}
                                style={styles.input}
                                required={formData.type === 'ad'}
                            />
                        </div>
                        <div style={styles.row}>
                            <select
                                value={formData.placement}
                                onChange={e => setFormData({ ...formData, placement: e.target.value })}
                                style={styles.input}
                            >
                                <option value="trending">Placement: Trending Feed</option>
                                <option value="home">Placement: Home Screen</option>
                            </select>
                        </div>
                        <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.5rem' }}>
                            Note: Ads are automatically marked as "Sponsored" in the app.
                        </p>
                    </div>
                )}

                <div style={styles.row}>
                    <select
                        value={formData.language}
                        onChange={e => setFormData({ ...formData, language: e.target.value })}
                        style={styles.input}
                        required
                    >
                        <option value="te">🇮🇳 Telugu</option>
                        <option value="en">🇺🇸 English</option>
                        <option value="hi">🇮🇳 Hindi</option>
                    </select>
                </div>

                <div style={styles.row}>
                    {/* Debug Info */}
                    {/* {console.log("Cats:", categories, "Selected:", formData.category_ids)} */}
                    <input
                        id="imageInput"
                        type="file"
                        accept={
                            formData.category_ids.some(id => {
                                const cat = categories.find(c => String(c._id) === String(id));
                                return cat?.slug === 'digital_magazines';
                            })
                                ? ".pdf,.doc,.docx,image/*,video/*,application/pdf"
                                : "image/*,video/*"
                        }
                        onChange={e => {
                            const file = e.target.files[0];
                            if (file) {
                                const isVideo = file.type.startsWith('video/');
                                setFormData({
                                    ...formData,
                                    image: file,
                                    is_video: isVideo
                                });
                            }
                        }}
                        style={styles.input}
                    />
                </div>

                <div style={styles.row}>
                    <div style={{ flex: 1, position: 'relative' }}>
                        {phoneticEnabled ? (
                            <ReactTransliterate
                                value={formData.title}
                                onChangeText={text => {
                                    // Strictly preserve English digits - replace any Telugu digits if they appear
                                    const sanitized = text.replace(/[౦-౯]/g, d => "0123456789"["౦౧౨౩౪౫౬౭౮౯".indexOf(d)]);
                                    setFormData({ ...formData, title: sanitized });
                                }}
                                lang="te"
                                placeholder="Type in English (e.g., project k) to get Telugu..."
                                renderComponent={props => <input {...props} style={styles.input} />}
                            />
                        ) : (
                            <input
                                placeholder="News Title"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                style={styles.input}
                            />
                        )}
                        <button
                            type="button"
                            onClick={() => translateText(formData.title, 'title')}
                            style={styles.translateBtn}
                            disabled={translating.title}
                        >
                            {translating.title ? '...' : 'Batch Translate 🔄'}
                        </button>
                    </div>
                </div>
                <div style={styles.row}>
                    <div style={{ flex: 1, position: 'relative' }}>
                        {phoneticEnabled ? (
                            <ReactTransliterate
                                value={formData.description}
                                onChangeText={text => {
                                    // Strictly preserve English digits
                                    const sanitized = text.replace(/[౦-౯]/g, d => "0123456789"["౦౧౨౩౪౫౬౭౮౯".indexOf(d)]);
                                    setFormData({ ...formData, description: sanitized });
                                }}
                                lang="te"
                                placeholder="Phonetic Telugu description..."
                                renderComponent={props => (
                                    <textarea
                                        {...props}
                                        style={{ ...styles.input, minHeight: '120px' }}
                                    />
                                )}
                            />
                        ) : (
                            <textarea
                                placeholder="Description"
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                style={{ ...styles.input, minHeight: '120px' }}
                            />
                        )}
                        <button
                            type="button"
                            onClick={() => translateText(formData.description, 'description')}
                            style={{ ...styles.translateBtn, bottom: '10px' }}
                            disabled={translating.desc}
                        >
                            {translating.desc ? '...' : 'Batch Translate 🔄'}
                        </button>
                    </div>
                </div>
                <div style={styles.section}>
                    <label style={styles.sectionLabel}>Select Categories (One or More):</label>
                    <div style={styles.categoryGrid}>
                        {categories.map(c => (
                            <label key={c._id} style={styles.checkboxItem}>
                                <input
                                    type="checkbox"
                                    checked={formData.category_ids.includes(c._id)}
                                    onChange={e => {
                                        const newIds = e.target.checked
                                            ? [...formData.category_ids, c._id]
                                            : formData.category_ids.filter(id => id !== c._id);
                                        setFormData({ ...formData, category_ids: newIds });
                                    }}
                                /> {c.name}
                            </label>
                        ))}
                    </div>
                </div>

                {/* Sub Category Dropdown for Digital Magazines & Digital Marketing */}
                {formData.category_ids.some(id => {
                    const cat = categories.find(c => c._id === id);
                    return ['digital_marketing'].includes(cat?.slug);
                }) && (
                        <div style={styles.row}>
                            <select
                                value={formData.sub_category}
                                onChange={e => setFormData({ ...formData, sub_category: e.target.value })}
                                style={styles.input}
                                required
                            >
                                <option value="">Select Sub Category (For Magazines/Marketing)</option>
                                <option value="agriculture">Agriculture</option>
                                <option value="lifestyle">Jeevanashaili (Lifestyle)</option>
                                <option value="industries">Paarishramalu (Industries)</option>
                                <option value="automobiles">Automobiles</option>
                                <option value="science">Shasravethalu (Science/Tech)</option>
                                <option value="real_estate">Real Estate</option>
                                <option value="cricket">Cricket</option>
                                <option value="hyderabad">Hyderabad</option>
                            </select>
                        </div>
                    )}
                <div style={styles.row}>
                    <select
                        value={formData.location_id}
                        onChange={e => setFormData({ ...formData, location_id: e.target.value })}
                        style={styles.input}
                    >
                        <option value="">Select Location (Optional)</option>
                        {locations.map(l => <option key={l._id} value={l._id}>{l.name}</option>)}
                    </select>
                </div>
                <div style={styles.checkboxRow}>
                    <label>
                        <input
                            type="checkbox"
                            checked={formData.is_full_card}
                            onChange={e => setFormData({ ...formData, is_full_card: e.target.checked })}
                        /> Full Card
                    </label>
                    <label>
                        <input
                            type="checkbox"
                            checked={formData.is_video}
                            onChange={e => setFormData({ ...formData, is_video: e.target.checked })}
                        /> Video Item
                    </label>
                </div>
                <div style={styles.buttonGroup}>
                    <button
                        type="button"
                        onClick={(e) => handleSubmit(e, 'draft')}
                        disabled={loading}
                        style={{ ...styles.submitBtn, background: '#6c757d' }}
                    >
                        {loading ? '...' : 'Save Draft'}
                    </button>
                    <button
                        type="button"
                        onClick={(e) => handleSubmit(e, 'pending_review')}
                        disabled={loading}
                        style={styles.submitBtn}
                    >
                        {loading ? 'Submitting...' : 'Submit for Review'}
                    </button>
                </div>
            </form>
        </div>
    );
};

const styles = {
    container: { background: 'white', padding: '1.5rem', borderRadius: '8px', marginBottom: '1.5rem' },
    title: { marginTop: 0, marginBottom: '0.5rem', fontSize: '1.1rem' },
    toggleRow: { marginBottom: '1rem', background: '#f8f9fa', padding: '0.5rem', borderRadius: '4px' },
    toggleLabel: { fontSize: '0.85rem', color: '#666', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' },
    form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
    input: { padding: '0.6rem', borderRadius: '4px', border: '1px solid #ddd', width: '100%', boxSizing: 'border-box' },
    row: { display: 'flex', gap: '1rem' },
    checkboxRow: { display: 'flex', gap: '2rem', fontSize: '0.9rem' },
    buttonGroup: { display: 'flex', gap: '1rem' },
    submitBtn: { flex: 1, padding: '0.75rem', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },
    translateBtn: {
        position: 'absolute',
        right: '10px',
        top: '50%',
        transform: 'translateY(-50%)',
        padding: '0.2rem 0.5rem',
        fontSize: '0.75rem',
        background: '#e9ecef',
        border: '1px solid #ced4da',
        borderRadius: '4px',
        cursor: 'pointer',
        zIndex: 1
    },
    section: { marginBottom: '1rem' },
    sectionLabel: { fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '0.5rem', display: 'block' },
    categoryGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '0.5rem', background: '#f8f9fa', padding: '1rem', borderRadius: '4px' },
    checkboxItem: { fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }
};

export default NewsForm;
