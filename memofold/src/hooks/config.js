const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const socketUrl = apiUrl.replace(/\/api\/?$/, "");

const config = {
    apiUrl,
    socketUrl,
};

export default config;
