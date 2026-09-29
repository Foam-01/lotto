import config from "../config";

const { apiClient } = config;

const BannerService = {
  // 🔓 หน้าร้านลูกค้าก็เรียกอันนี้ ไม่ต้องมี Token
  list: async () => await apiClient.get("/api/banner/list"),

  // 🔒 เฉพาะแอดมิน
  create: async (payload) => await apiClient.post("/api/banner/create", payload),

  edit: async (id, payload) =>
    await apiClient.put(`/api/banner/edit/${id}`, payload),

  remove: async (id) => await apiClient.delete(`/api/banner/remove/${id}`),
};

export default BannerService;
