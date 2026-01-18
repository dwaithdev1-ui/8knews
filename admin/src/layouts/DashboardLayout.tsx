import { signOut } from 'firebase/auth';
import { Outlet } from 'react-router-dom';
import { auth } from '../lib/firebase';

export const DashboardLayout = () => {
    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r flex flex-col">
                <div className="p-6 border-b flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg flex items-center justify-center overflow-hidden">
                         <img src="/logo.png" alt="8K News" className="h-full w-full object-cover" />
                    </div>
                    <h1 className="text-lg font-bold tracking-tight">8K Admin</h1>
                </div>
                
                <nav className="flex-1 overflow-y-auto py-4">
                    <div className="px-4 mb-2">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">General</p>
                        <a href="/" className="flex items-center gap-2 block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md font-medium text-sm transition-colors">
                            Dashboard
                        </a>
                    </div>

                    <div className="px-4 mt-6">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Content Manager</p>
                        <div className="space-y-1">
                            <a href="/content-manager/articles" className="flex items-center gap-2 block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md font-medium text-sm transition-colors">
                                Articles
                            </a>
                            <a href="/content-manager/categories" className="flex items-center gap-2 block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md font-medium text-sm transition-colors">
                                Categories
                            </a>
                            <a href="/content-manager/tags" className="flex items-center gap-2 block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md font-medium text-sm transition-colors">
                                Tags
                            </a>
                        </div>
                    </div>
                </nav>

                <div className="p-4 border-t bg-white">
                    <button onClick={() => signOut(auth)} className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-md transition-colors">
                        Sign Out
                    </button>
                </div>
            </aside>
            {/* Main Content */}
            <main className="flex-1 overflow-y-auto bg-gray-100">
                <Outlet />
            </main>
        </div>
    )
}
