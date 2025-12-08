import axios from "axios";
import { toast } from '../js/ImportComponents/Imports';

const instance = axios.create({
    baseURL: "http://localhost:8080",
    // baseURL: "http://raspberrypi:8080",
    //baseURL: "http://192.168.1.23:8080",
    timeout: 10000,

});

instance.interceptors.request.use(
    function (config) {
        // Lấy token từ localStorage
        const token = localStorage.getItem("accessToken");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    function (error) {
        return Promise.reject(error);
    }
);

instance.interceptors.response.use(
    response => response.data,
    (error) => {
        if (error.response) {
            if (error.response.status === 401) {
                // toast.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!");
                // Xóa token cũ
                localStorage.removeItem("accessToken");
                localStorage.removeItem("username");

                // Redirect về login
                window.location.href = "/login"; // đơn giản nhất
            } else {
                toast.error(`Lỗi Server (${error.response.status})`);
            }
            return Promise.reject(error);
        }

        if (error.message === "Network Error") {
            toast.error("Không thể kết nối đến máy chủ!");
            return Promise.reject(error);
        }

        if (error.code === "ECONNABORTED") {
            toast.error("Kết nối đến máy chủ quá thời gian chờ!");
            return Promise.reject(error);
        }

        toast.error("Lỗi không xác định khi gọi API!");
        return Promise.reject(error);
    });

export default instance;
