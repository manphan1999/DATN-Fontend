import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('accessToken');
    const location = useLocation();
    console.log('check', token)
    if (!token) {
        // Nếu chưa login, chuyển hướng đến login và ghi nhớ đường dẫn gốc
        return <Navigate to="/login" state={{ from: location }} replace />;
    }
    return children;
};

export default ProtectedRoute;
