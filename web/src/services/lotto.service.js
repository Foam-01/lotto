// src/services/lotto.service.js
import config from "../config";

const { apiClient } = config;

const LottoService = {
  // 🔒 โซนแอดมิน (ต้องมี Token)
  getList: async () => await apiClient.get("/api/lotto/list"),
  create: async (payload) => await apiClient.post("/api/lotto/create", payload),
  edit: async (id, payload) =>
    await apiClient.put(`/api/lotto/edit/${id}`, payload),
  remove: async (id) => await apiClient.delete(`/api/lotto/remove/${id}`),

  // 🔓 โซนหน้าร้าน ลูกค้าทั่วไป (ไม่ต้องใช้ Token)
  getListForSale: async () => await apiClient.get("/api/lotto/listForSale"),
  confirmBuy: async (payload) =>
    await apiClient.post("/api/lotto/ConfirmBuy", payload),

  changePrice: async (lottos) =>
    await apiClient.put("/api/lotto/changePrice", { lottos }),

  // 🔒 ใช้เฉพาะหน้าแอดมิน "รางวัลของร้าน" ต้องมี Token
  lottoIsBonus: async () => await apiClient.get("/api/lotto/lottoIsBonus"),

  lottoIsBonuslist: async () =>
    await apiClient.get("/api/lotto/lottoIsBonuslist"),

  // ตรวจ + ดึงรายการในคำขอเดียว (แทนการเรียก lottoIsBonus แล้วค่อย lottoIsBonuslist ทีละครั้ง)
  lottoIsBonusCheckAndList: async () =>
    await apiClient.get("/api/lotto/lottoIsBonusCheckAndList"),
};

export default LottoService;
