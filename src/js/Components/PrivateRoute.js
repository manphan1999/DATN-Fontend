// src/js/Components/PrivateRoute.js
import { Navigate, Outlet } from 'react-router-dom';

export default function PrivateRoute() {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    // Đã đăng nhập -> render các route con
    // Chưa đăng nhập -> chuyển về /login
    return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}
