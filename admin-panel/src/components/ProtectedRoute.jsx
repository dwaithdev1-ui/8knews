import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const token = localStorage.getItem('adminToken');
    const role = localStorage.getItem('adminRole');

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(role)) {
        // Redirect if role is not allowed (e.g. back to dashboard or unauthorized page)
        // For now, if they are admin, they likely have access, but explicit check above is strict.
        // Let's assume if role is 'admin' they have access to everything, 
        // OR strictly follow the array. The array in App.jsx includes 'admin' where needed.
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

export default ProtectedRoute;
