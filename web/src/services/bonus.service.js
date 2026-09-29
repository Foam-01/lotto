// src/services/bonus.service.js
import config from "../config";

const { apiClient } = config;

const BonusService = {
  // ------------------------------------------
  // 🎁 1. สำหรับหน้า Bonus (ดึงผลรางวัลสลาก)
  // ------------------------------------------
  getList: async () => {
    return await apiClient.get("/api/bonus/list");
  },
  getLatestBonus: async () => {
    return await apiClient.get("/api/bonus/getBonus");
  },
  getDetail: async (bonusDate) => {
    return await apiClient.get(`/api/bonus/listDetail/${bonusDate}`);
  },

  // ------------------------------------------
  // 💸 2. สำหรับหน้า SaleBonus (จ่ายเงินคนถูกรางวัล)
  // ------------------------------------------
  getCheckBonus: async () => {
    return await apiClient.get("/api/bonus/checkBonus");
  },
  transferMoney: async (payload) => {
    return await apiClient.post("/api/billSale/TranferMoney", payload);
  },
  deliverMoney: async (payload) => {
    return await apiClient.post("/api/billSale/deliverMoney", payload);
  },
};

export default BonusService;
