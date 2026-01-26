import axios from 'axios';
import { useEffect, useState } from 'react';
import { ReactTransliterate } from 'react-transliterate';
import 'react-transliterate/dist/index.css';

const NewsForm = ({ onSuccess }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category_id: '',
        sub_category: '', // Added sub_category
        location_id: '',
        is_full_card: false,
        is_video: false,
        language: 'te',
        image: null
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
        data.append('category_id', formData.category_id);
        if (formData.sub_category) data.append('sub_category', formData.sub_category); // Append sub_category
        if (formData.location_id) data.append('location_id', formData.location_id);
        data.append('is_full_card', formData.is_full_card);
        data.append('is_video', formData.is_video);
        data.append('language', formData.language);
        data.append('status', submitStatus);
        data.append('remarks', remarks);
        if (formData.image) {
            data.append('image', formData.image);
        }

        try {
            await axios.post('http://localhost:3000/api/news', data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            setFormData({
                title: '',
                description: '',
                category_id: '',
                sub_category: '',
                location_id: '',
                is_full_card: false,
                is_video: false,
                language: 'te',
                image: null
            });
            if (document.getElementById('imageInput')) {
                document.getElementById('imageInput').value = '';
            }
            onSuccess();
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to create news');
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
            <form onSubmit={(e) => handleSubmit(e, 'draft')} style={styles.form}>
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
                    <input
                        id="imageInput"
                        type="file"
                        accept="image/*"
                        onChange={e => setFormData({ ...formData, image: e.target.files[0] })}
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
                                renderComponent={props => <input {...props} style={styles.input} required />}
                            />
                        ) : (
                            <input
                                placeholder="News Title"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                style={styles.input}
                                required
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
                                        required
                                    />
                                )}
                            />
                        ) : (
                            <textarea
                                placeholder="Description"
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                style={{ ...styles.input, minHeight: '120px' }}
                                required
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
                <div style={styles.row}>
                    <select
                        value={formData.category_id}
                        onChange={e => {
                            const selectedCat = categories.find(c => c._id === e.target.value);
                            // Reset sub_category if switching away from Digital Magazines
                            const isDigitalMag = selectedCat?.slug === 'digital_magazines';
                            setFormData({
                                ...formData,
                                category_id: e.target.value,
                                sub_category: isDigitalMag ? formData.sub_category : ''
                            });
                        }}
                        style={styles.input}
                        required
                    >
                        <option value="">Select Category</option>
                        {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </select>

                    {/* Sub Category Dropdown for Digital Magazines */}
                    {categories.find(c => c._id === formData.category_id)?.slug === 'digital_magazines' && (
                        <select
                            value={formData.sub_category}
                            onChange={e => setFormData({ ...formData, sub_category: e.target.value })}
                            style={styles.input}
                            required
                        >
                            <option value="">Select Sub Category</option>
                            <option value="agriculture">Agriculture</option>
                            <option value="lifestyle">Jeevanashaili (Lifestyle)</option>
                            <option value="industries">Paarishramalu (Industries)</option>
                            <option value="automobiles">Automobiles</option>
                            <option value="science">Shasravethalu (Science/Tech)</option>
                            <option value="real_estate">Real Estate</option>
                            <option value="cricket">Cricket</option>
                            <option value="hyderabad">Hyderabad</option>
                        </select>
                    )}
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
    }
};

export default NewsForm;
