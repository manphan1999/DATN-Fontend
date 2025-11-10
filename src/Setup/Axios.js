import axios from "axios";
import { toast } from '../js/ImportComponents/Imports';

const instance = axios.create({
    baseURL: "http://localhost:8080",
    timeout: 10000,
    // baseURL: "http://100.75.114.18:8080",
});

instance.interceptors.request.use(
    function (config) {
        return config;
    },
    function (error) {
        return Promise.reject(error);
    }
);

instance.interceptors.response.use(
    response => response.data,
    error => {
        if (error.message === "Network Error") {
            toast.error("Không thể kết nối đến máy chủ!");
            return { EC: -1, EM: "Không thể kết nối đến máy chủ!", DT: null };
        }

        if (error.code === "ECONNABORTED") {
            toast.error("Kết nối đến máy chủ quá thời gian chờ!");
            return { EC: -1, EM: "Kết nối đến máy chủ quá thời gian chờ!", DT: null };
        }

        if (error.response) {
            toast.error(`Lỗi Server (${error.response.status})`);
            return { EC: error.response.status, EM: "Lỗi server!", DT: null };
        }

        toast.error("Lỗi không xác định khi gọi API!");
        return { EC: -1, EM: "Lỗi không xác định khi gọi API!", DT: null };
    }
);


export default instance;
