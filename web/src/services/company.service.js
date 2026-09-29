// src/services/company.service.js
import config from "../config";

const { apiClient } = config;

const CompanyService = {
  // ดึงข้อมูลร้าน
  getInfo: async () => {
    return await apiClient.get("/api/company/info");
  },

  // สร้างข้อมูลร้านใหม่
  create: async (payload) => {
    return await apiClient.post("/api/company/create", payload);
  },

  // แก้ไขข้อมูลร้านเดิม
  edit: async (id, payload) => {
    return await apiClient.put(`/api/company/edit/${id}`, payload);
  },
};

export default CompanyService;
