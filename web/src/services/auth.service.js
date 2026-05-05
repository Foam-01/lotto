// src/services/auth.service.js
import axios from "axios";
import config from "../config";

const AuthService = {
  // 1. ส่งข้อมูลไป Login
  login: async (payload) => {
    return await axios.post(`${config.apiPath}/api/user/login`, payload);
  },

  // 2. ดึงข้อมูล User มาโชว์ที่ Sidebar (ในหน้า Home.jsx)
  getUserInfo: async () => {
    const token = localStorage.getItem("token");
    return await axios.get(`${config.apiPath}/api/user/info`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },
};

export default AuthService;
