// src/services/auth.service.js
import config from "../config";

const { apiClient } = config;

const AuthService = {
  // 1. ส่งข้อมูลไป Login
  login: async (payload) => {
    return await apiClient.post("/api/user/login", payload);
  },

  // 2. ดึงข้อมูล User มาโชว์ที่ Sidebar (ในหน้า Home.jsx)
  getUserInfo: async () => {
    return await apiClient.get("/api/user/info");
  },
};

export default AuthService;
