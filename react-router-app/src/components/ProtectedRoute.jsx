import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function ProtectedRoute({ children, requireAdmin }) {
    const { user, loading } = useContext(AuthContext);

    if (loading) return <div>Жүктелуде...</div>;

    if (!user) {
        return <Navigate to="/login" />;
    }

    if (requireAdmin && user.role !== 'admin') {
        return (
            <div style={{ textAlign: 'center', marginTop: '50px', padding: '20px' }}>
                <h2 style={{ color: 'red' }}>Access Denied</h2>
                <p>Бұл бетке кіруге сіздің рұқсатыңыз жоқ.</p>
            </div>
        );
    }

    return children;
}

export default ProtectedRoute;
