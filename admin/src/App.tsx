import { onAuthStateChanged, type User } from 'firebase/auth';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Navigate, Outlet, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { DashboardLayout } from './layouts/DashboardLayout';
import { auth } from './lib/firebase';
import { EditView } from './pages/ContentManager/EditView';
import { ListView } from './pages/ContentManager/ListView';
import { DashboardHome } from './pages/DashboardHome';
import { Login } from './pages/Login';

// --- Auth Context / Hook ---
function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
  }, []);

  return { user, loading };
}

// --- Protected Route ---
const ProtectedRoute = ({ children }: { children: any }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
      return (
          <div className="flex h-screen w-full items-center justify-center bg-gray-50">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
      );
  }
  
  if (!user) return <Navigate to="/login" />;
  return children ? children : <Outlet />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route path="/" element={<DashboardHome />} />
            <Route path="/content-manager/:collectionType" element={<ListView />} />
            <Route path="/content-manager/:collectionType/:id" element={<EditView />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
