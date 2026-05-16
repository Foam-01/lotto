// src/services/bonus.service.js
import axios from "axios";
import config from "../config";

const getHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

const BonusService = {
  // ------------------------------------------
  // 🎁 1. สำหรับหน้า Bonus (ดึงผลรางวัลสลาก)
  // ------------------------------------------
  getList: async () => {
    return await axios.get(`${config.apiPath}/api/bonus/list`, getHeaders());
  },
  getLatestBonus: async () => {
    return await axios.get(
      `${config.apiPath}/api/bonus/getBonus`,
      getHeaders(),
    );
  },
  getDetail: async (bonusDate) => {
    return await axios.get(
      `${config.apiPath}/api/bonus/listDetail/${bonusDate}`,
      getHeaders(),
    );
  },

  // ------------------------------------------
  // 💸 2. สำหรับหน้า SaleBonus (จ่ายเงินคนถูกรางวัล)
  // ------------------------------------------
  getCheckBonus: async () => {
    return await axios.get(
      `${config.apiPath}/api/bonus/checkBonus`,
      getHeaders(),
    );
  },
  transferMoney: async (payload) => {
    return await axios.post(
      `${config.apiPath}/api/billSale/TranferMoney`,
      payload,
      getHeaders(),
    );
  },
  deliverMoney: async (payload) => {
    return await axios.post(
      `${config.apiPath}/api/billSale/deliverMoney`,
      payload,
      getHeaders(),
    );
  },

  
};

export default BonusService;
