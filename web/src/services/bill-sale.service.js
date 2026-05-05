// src/services/bill-sale.service.js
import axios from "axios";
import config from "../config";

const getHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

const BillSaleService = {
  // ------------------------------------------
  // 🧾 1. สำหรับหน้า BillSale (รายการสั่งซื้อ)
  // ------------------------------------------
  getBillSales: async () => {
    return await axios.get(
      `${config.apiPath}/api/lotto/billSale`,
      getHeaders(),
    );
  },
  removeBill: async (id) => {
    return await axios.delete(
      `${config.apiPath}/api/lotto/removeBill/${id}`,
      getHeaders(),
    );
  },
  confirmPay: async (payload) => {
    return await axios.post(
      `${config.apiPath}/api/lotto/ConfirmPay`,
      payload,
      getHeaders(),
    );
  },

  // ------------------------------------------
  // 🏪 2. สำหรับหน้า LottoInShop (รายการฝากร้าน)
  // ------------------------------------------
  getLottoInShop: async () => {
    return await axios.get(
      `${config.apiPath}/api/lotto/lottoInShop`,
      getHeaders(),
    );
  },

  // ------------------------------------------
  // 🚚 3. สำหรับหน้า LottoForSend (รายการรอจัดส่ง)
  // ------------------------------------------
  getLottoForSend: async () => {
    return await axios.get(
      `${config.apiPath}/api/lotto/lottoForSend`,
      getHeaders(),
    );
  },
  sendSave: async (payload) => {
    return await axios.post(
      `${config.apiPath}/api/lotto/sendSave`,
      payload,
      getHeaders(),
    );
  },
};

export default BillSaleService;
