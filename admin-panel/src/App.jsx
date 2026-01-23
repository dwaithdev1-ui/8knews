import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLogin from './pages/AdminLogin';
import Dashboard from './pages/Dashboard';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<AdminLogin />} />
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />

                {/* Role-Based Routes */}
                <Route
                    path="/inputter"
                    element={
                        <ProtectedRoute allowedRoles={['content_inputter', 'admin']}>
                            <Dashboard />{/* Replace with specific component if exists */}
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/editor"
                    element={
                        <ProtectedRoute allowedRoles={['sub_editor', 'senior_editor', 'admin']}>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/legal"
                    element={
                        <ProtectedRoute allowedRoles={['legal', 'admin']}>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/publisher"
                    element={
                        <ProtectedRoute allowedRoles={['publisher', 'admin']}>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />

                <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Routes>
        </Router>
    );
}

export default App;
