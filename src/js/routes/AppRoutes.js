import { BrowserRouter as Router, Routes, Route, Navigate, } from "react-router-dom";
import DashboardLayout from "../Layout/DashboardLayout";
import NotFound from '../Components/NotFound';
import Login from "../Login/Login";

const AppRoutes = (props) => {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/home" element={<DashboardLayout />} />
            <Route path="/device" element={<DashboardLayout />} />
            <Route path="/tagname" element={<DashboardLayout />} />
            <Route path="/funcSettings" element={<DashboardLayout />} />
            <Route path="/historical" element={<DashboardLayout />} />
            <Route path="/servers" element={<DashboardLayout />} />
            <Route path="/users" element={<DashboardLayout />} />
            <Route path="/configuration" element={<DashboardLayout />} />
            <Route path="/setting" element={<DashboardLayout />} />
            <Route path="/user" element={<DashboardLayout />} />
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<NotFound />} />
        </Routes>
    )
}

export default AppRoutes;