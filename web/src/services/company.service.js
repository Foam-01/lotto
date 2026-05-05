// src/services/company.service.js
import axios from "axios";
import config from "../config";

const getHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

const CompanyService = {
  // ดึงข้อมูลร้าน
  getInfo: async () => {
    return await axios.get(`${config.apiPath}/api/company/info`, getHeaders());
  },

  // สร้างข้อมูลร้านใหม่
  create: async (payload) => {
    return await axios.post(
      `${config.apiPath}/api/company/create`,
      payload,
      getHeaders(),
    );
  },

  // แก้ไขข้อมูลร้านเดิม
  edit: async (id, payload) => {
    return await axios.put(
      `${config.apiPath}/api/company/edit/${id}`,
      payload,
      getHeaders(),
    );
  },
};

export default CompanyService;
