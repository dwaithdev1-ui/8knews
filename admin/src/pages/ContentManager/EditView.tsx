import { addDoc, collection, doc, getDoc, getDocs, serverTimestamp, setDoc } from 'firebase/firestore';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { db } from '../../lib/firebase';

import { useRole } from '../../hooks/useRole';

export const EditView = () => {
    const { collectionType, id } = useParams<{ collectionType: string; id: string }>();
    const navigate = useNavigate();
    const { role, user } = useRole();
    const isNew = id === 'create';

    const [formData, setFormData] = useState<any>({});
    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);
    const [tags, setTags] = useState<any[]>([]);

    useEffect(() => {
        const init = async () => {
            // Fetch categories and tags if we are editing articles
            if (collectionType === 'articles') {
                try {
                     const catCol = collection(db, 'categories');
                     const catSnap = await getDocs(catCol); 
                     const cats = catSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                     setCategories(cats);

                     const tagCol = collection(db, 'tags');
                     const tagSnap = await getDocs(tagCol);
                     const tgs = tagSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                     setTags(tgs);
                } catch (err) {
                    console.error("Error fetching dependencies:", err);
                }
            }

            if (!isNew && id && collectionType) {
                const docRef = doc(db, collectionType, id);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setFormData(docSnap.data());
                } else {
                    alert('Document not found');
                    navigate(`/content-manager/${collectionType}`);
                }
            } else if (isNew && collectionType === 'articles') {
                 // Default status for new articles
                 setFormData({ status: 'draft', author: user?.email, tags: [] });
            }
            setLoading(false);
        };
        init();
    }, [id, collectionType, isNew, navigate, user]);

    const handleSave = async (newStatus?: string) => {
        setSaving(true);
        try {
            const dataToSave = {
                ...formData,
                updatedAt: serverTimestamp(),
            };
            
            // If status is provided (e.g. "publish" button clicked), use it.
            // Otherwise use existing form status.
            if (newStatus) {
                dataToSave.status = newStatus;
            }

            // Ensure author info is set for new docs
            if (isNew && !dataToSave.authorEmail && user) {
                dataToSave.authorEmail = user.email;
                dataToSave.authorId = user.uid;
                dataToSave.author = user.email; // Fallback display
            }

            if (isNew) {
                dataToSave.createdAt = serverTimestamp();
                await addDoc(collection(db, collectionType!), dataToSave);
            } else {
                await setDoc(doc(db, collectionType!, id!), dataToSave, { merge: true });
            }
            navigate(`/content-manager/${collectionType}`);
        } catch (error: any) {
            console.error(error);
            alert(`Error saving: ${error.message}`);
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (field: string, value: any) => {
        setFormData((prev: any) => ({ ...prev, [field]: value }));
    };

    const handleTagToggle = (tagId: string) => {
        setFormData((prev: any) => {
            const currentTags = prev.tags || [];
            if (currentTags.includes(tagId)) {
                return { ...prev, tags: currentTags.filter((id: string) => id !== tagId) };
            } else {
                return { ...prev, tags: [...currentTags, tagId] };
            }
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }
    
    // Status Badge Color
    const getStatusColor = (status: string) => {
        switch(status) {
            case 'published': return 'bg-green-100 text-green-800';
            case 'in_review': return 'bg-orange-100 text-orange-800';
            case 'draft': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    }

    return (
        <div className="p-8 pb-32">
            {/* Header */}
            <div className="flex justify-between items-center mb-8 sticky top-0 bg-gray-50 py-4 z-10 border-b border-gray-200">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-white rounded-full transition-colors">
                        <ArrowLeft className="h-5 w-5 text-gray-600" />
                    </button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold capitalize text-gray-900">
                                {isNew ? `Create ${collectionType}` : `Edit ${collectionType}`}
                            </h1>
                            {collectionType === 'articles' && (
                                <span className={`px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wide ${getStatusColor(formData.status)}`}>
                                    {formData.status || 'Draft'}
                                </span>
                            )}
                        </div>
                        <p className="text-gray-500 mt-1">API ID: {collectionType}</p>
                    </div>
                </div>
                
                <div className="flex gap-2">
                    {/* Workflow Buttons */}
                    {collectionType === 'articles' ? (
                        <>
                             {/* Writer Actions */}
                             {(role === 'writer' || role === 'admin') && formData.status !== 'published' && (
                                 <button
                                    onClick={() => handleSave('draft')}
                                    disabled={saving}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                                 >
                                     Save Draft
                                 </button>
                             )}
                             
                             {(role === 'writer' || role === 'admin') && formData.status === 'draft' && (
                                 <button
                                    onClick={() => handleSave('in_review')}
                                    disabled={saving}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                                 >
                                     Submit for Review
                                 </button>
                             )}

                            {/* Admin Actions */}
                            {role === 'admin' && formData.status === 'in_review' && (
                                <button
                                    onClick={() => handleSave('published')}
                                    disabled={saving}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center gap-2"
                                >
                                    <Save className="h-4 w-4" />
                                    Publish
                                </button>
                            )}
                            
                             {role === 'admin' && formData.status === 'published' && (
                                <button
                                    onClick={() => handleSave('draft')}
                                    disabled={saving}
                                    className="px-4 py-2 border border-red-200 text-red-700 hover:bg-red-50 rounded-lg font-medium"
                                >
                                    Unpublish
                                </button>
                            )}
                            
                            {/* Fallback Save for other states or just generic save without status change */}
                            <button
                                onClick={() => handleSave()}
                                disabled={saving}
                                className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-medium shadow-sm"
                            >
                                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => handleSave()}
                            disabled={saving}
                            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 font-medium shadow-sm"
                        >
                            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            Save
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-12 gap-8">
                {/* Main Content Column */}
                <div className="col-span-12 lg:col-span-8 space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <h2 className="text-lg font-semibold mb-4 text-gray-900">Content</h2>
                        <div className="space-y-4">
                            {/* Dynamic Fields based on Collection Type */}
                            {collectionType === 'articles' && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                        <input
                                            type="text"
                                            value={formData.title || ''}
                                            onChange={(e) => handleChange('title', e.target.value)}
                                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Content (Markdown/Blocks)</label>
                                        <textarea
                                            rows={15}
                                            value={formData.content || ''}
                                            onChange={(e) => handleChange('content', e.target.value)}
                                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-mono text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image URL</label>
                                        <input
                                            type="text"
                                            value={formData.image || ''}
                                            onChange={(e) => handleChange('image', e.target.value)}
                                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                            placeholder="https://..."
                                        />
                                        {formData.image && (
                                            <div className="mt-2 text-sm text-gray-500">
                                                 Preview:
                                                 <img src={formData.image} alt="Preview" className="h-40 w-auto object-cover rounded mt-1 border" />
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                            
                            {collectionType === 'categories' && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                        <input
                                            type="text"
                                            value={formData.name || ''}
                                            onChange={(e) => handleChange('name', e.target.value)}
                                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                        />
                                    </div>
                                     <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                        <textarea
                                            rows={4}
                                            value={formData.description || ''}
                                            onChange={(e) => handleChange('description', e.target.value)}
                                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                        />
                                    </div>
                                </>
                            )}
                            {collectionType === 'tags' && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                        <input
                                            type="text"
                                            value={formData.name || ''}
                                            onChange={(e) => handleChange('name', e.target.value)}
                                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                                        <input
                                            type="text"
                                            value={formData.slug || ''}
                                            onChange={(e) => handleChange('slug', e.target.value)}
                                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-gray-50 text-gray-500"
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar Column */}
                <div className="col-span-12 lg:col-span-4 space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                         <h2 className="text-lg font-semibold mb-4 text-gray-900">Settings</h2>
                         <div className="space-y-4">
                            {collectionType === 'articles' && (
                                <>
                                    {/* Location Settings */}
                                    <div className="border-b border-gray-100 pb-4 mb-4">
                                        <h3 className="text-sm font-semibold text-gray-900 mb-3">Location Targeting</h3>
                                        <div className="space-y-3">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 mb-1">City</label>
                                                <input
                                                    type="text"
                                                    value={formData.city || ''}
                                                    onChange={(e) => handleChange('city', e.target.value)}
                                                    className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-gray-400"
                                                    placeholder="e.g. San Francisco"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 mb-1">State / Province</label>
                                                <input
                                                    type="text"
                                                    value={formData.state || ''}
                                                    onChange={(e) => handleChange('state', e.target.value)}
                                                    className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-gray-400"
                                                    placeholder="e.g. California"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 mb-1">Country</label>
                                                <input
                                                    type="text"
                                                    value={formData.country || ''}
                                                    onChange={(e) => handleChange('country', e.target.value)}
                                                    className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-gray-400"
                                                    placeholder="e.g. USA"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Publish Status</label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                id="display"
                                                checked={formData.display || false}
                                                onChange={(e) => handleChange('display', e.target.checked)}
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                            />
                                            <label htmlFor="display" className="text-sm text-gray-700">Display / Published</label>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Publish Date</label>
                                        <input
                                            type="date"
                                            value={formData.publishDate || ''}
                                            onChange={(e) => handleChange('publishDate', e.target.value)}
                                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                        <select
                                            value={formData.category || ''}
                                            onChange={(e) => handleChange('category', e.target.value)}
                                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                        >
                                            <option value="">Select a category...</option>
                                            {categories.map(cat => (
                                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                                            ))}
                                        </select>
                                        <div className="mt-1 text-xs text-blue-600 hover:underline cursor-pointer" onClick={() => navigate('/content-manager/categories/create')}>
                                            + Create new category
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                                        <div className="flex flex-wrap gap-2">
                                            {tags.map(tag => (
                                                <button
                                                    key={tag.id}
                                                    onClick={() => handleTagToggle(tag.id)}
                                                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                                                        formData.tags?.includes(tag.id)
                                                            ? 'bg-blue-100 border-blue-200 text-blue-800'
                                                            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                                    }`}
                                                >
                                                    {tag.name}
                                                </button>
                                            ))}
                                            <button 
                                                onClick={() => navigate('/content-manager/tags/create')}
                                                className="px-3 py-1 rounded-full text-xs font-medium border border-dashed border-gray-300 text-gray-500 hover:border-blue-300 hover:text-blue-600 transition-colors"
                                            >
                                                + New Tag
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                                        <input
                                            type="text"
                                            value={formData.slug || ''}
                                            onChange={(e) => handleChange('slug', e.target.value)}
                                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-gray-50 text-gray-500"
                                        />
                                    </div>
                                </>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
                                <input
                                    type="text"
                                    value={formData.author || ''}
                                    onChange={(e) => handleChange('author', e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                />
                            </div>
                         </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
