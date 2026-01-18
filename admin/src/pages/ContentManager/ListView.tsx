import { useNavigate, useParams } from 'react-router-dom';
import { useCollection } from '../../hooks/useCollection';
import { Plus, Search, Pencil, Trash2, Loader2 } from 'lucide-react';
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export const ListView = () => {
  const { collectionType } = useParams<{ collectionType: string }>();
  const navigate = useNavigate();
  const { data, loading, error } = useCollection(collectionType || '');

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      try {
        await deleteDoc(doc(db, collectionType!, id));
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  const getDisplayName = (item: any) => {
    return item.title || item.name || item.slug || item.id;
  };

  if (loading) {
     return (
        <div className="flex items-center justify-center h-96">
           <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
     )
  }

  if (error) {
     return <div className="text-red-600 p-8">Error: {error}</div>
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold capitalize text-gray-900">{collectionType}</h1>
          <p className="text-gray-500 mt-1">{data.length} entries found</p>
        </div>
        <button
          onClick={() => navigate(`/content-manager/${collectionType}/create`)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Create new entry
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-t-lg border-b border-gray-200 flex justify-between items-center">
         <div className="relative">
             <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
             <input 
                type="text" 
                placeholder="Search..." 
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
             />
         </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-b-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Main Field
              </th>
              {collectionType === 'articles' && (
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
              )}
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  #{item.id.substring(0, 6)}...
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {getDisplayName(item)}
                </td>
                {collectionType === 'articles' && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium uppercase tracking-wide ${
                            item.status === 'published' ? 'bg-green-100 text-green-800' :
                            item.status === 'in_review' ? 'bg-orange-100 text-orange-800' :
                            'bg-gray-100 text-gray-800'
                        }`}>
                            {item.status || 'Draft'}
                        </span>
                    </td>
                )}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex gap-2">
                  <button 
                    onClick={() => navigate(`/content-manager/${collectionType}/${item.id}`)}
                    className="p-1 rounded-md hover:bg-gray-100 text-blue-600"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(item.id)}
                    className="p-1 rounded-md hover:bg-gray-100 text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
            {data.length === 0 && (
                <tr>
                    <td colSpan={collectionType === 'articles' ? 4 : 3} className="px-6 py-12 text-center text-gray-500">
                        No entries found. Create one to get started.
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
