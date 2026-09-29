// src/services/bill-sale.service.js
import config from "../config";

const { apiClient } = config;

const BillSaleService = {
  // ------------------------------------------
  // 🧾 1. สำหรับหน้า BillSale (รายการสั่งซื้อ)
  // ------------------------------------------
  getBillSales: async () => {
    return await apiClient.get("/api/lotto/billSale");
  },
  removeBill: async (id) => {
    return await apiClient.delete(`/api/lotto/removeBill/${id}`);
  },
  confirmPay: async (payload) => {
    return await apiClient.post("/api/lotto/ConfirmPay", payload);
  },

  // ------------------------------------------
  // 🏪 2. สำหรับหน้า LottoInShop (รายการฝากร้าน)
  // ------------------------------------------
  getLottoInShop: async () => {
    return await apiClient.get("/api/lotto/lottoInShop");
  },

  // ------------------------------------------
  // 🚚 3. สำหรับหน้า LottoForSend (รายการรอจัดส่ง)
  // ------------------------------------------
  getLottoForSend: async () => {
    return await apiClient.get("/api/lotto/lottoForSend");
  },
  sendSave: async (payload) => {
    return await apiClient.post("/api/lotto/sendSave", payload);
  },
};

export default BillSaleService;
