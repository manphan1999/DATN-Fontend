import axios from "axios";
import { toast } from '../js/ImportComponents/Imports';

const instance = axios.create({
    // baseURL: "",
    baseURL: "http://localhost:8080",
    // baseURL: "http://raspberrypi:8080",
    //baseURL: "http://192.168.10.245:8080",
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
            const status = error.response.status;

            if (status === 401) {
                localStorage.removeItem("accessToken");
                localStorage.removeItem("username");
                window.location.href = "/login";
            } else {
                toast.error(`Lỗi Server (${status})`);
            }

            return Promise.resolve({
                EC: status,
                EM: "Server Error",
                DT: null
            });
        }

        if (error.message === "Network Error") {
            toast.error("Không thể kết nối đến máy chủ!");

            return Promise.resolve({
                EC: -1,
                EM: "Network Error",
                DT: null
            });
        }

        if (error.code === "ECONNABORTED") {
            toast.error("Kết nối đến máy chủ quá thời gian chờ!");

            return Promise.resolve({
                EC: -2,
                EM: "Timeout",
                DT: null
            });
        }

        toast.error("Lỗi không xác định khi gọi API!");

        return Promise.resolve({
            EC: -99,
            EM: "Unknown Error",
            DT: null
        });
    }
);

export default instance;
