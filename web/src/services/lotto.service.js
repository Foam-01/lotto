// src/services/lotto.service.js
import axios from "axios";
import config from "../config";

const getHeaders = () => {
  const token = localStorage.getItem("token");
  // ใส่ Token เฉพาะถ้ามี (ลูกค้าทั่วไปจะไม่มี Token)
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

const LottoService = {
  // 🔒 โซนแอดมิน (ต้องมี Token)
  getList: async () =>
    await axios.get(`${config.apiPath}/api/lotto/list`, getHeaders()),
  create: async (payload) =>
    await axios.post(
      `${config.apiPath}/api/lotto/create`,
      payload,
      getHeaders(),
    ),
  edit: async (id, payload) =>
    await axios.put(
      `${config.apiPath}/api/lotto/edit/${id}`,
      payload,
      getHeaders(),
    ),
  remove: async (id) =>
    await axios.delete(
      `${config.apiPath}/api/lotto/remove/${id}`,
      getHeaders(),
    ),

  // 🔓 โซนหน้าร้าน ลูกค้าทั่วไป (ไม่ต้องใช้ Token)
  getListForSale: async () =>
    await axios.get(`${config.apiPath}/api/lotto/listForSale`),
  confirmBuy: async (payload) =>
    await axios.post(`${config.apiPath}/api/lotto/ConfirmBuy`, payload),

  changePrice: async (lottos) =>
    await axios.put(
      `${config.apiPath}/api/lotto/changePrice`,
      { lottos },
      getHeaders(),
    ),

  lottoIsBonus: async () =>
    await axios.get(`${config.apiPath}/api/lotto/lottoIsBonus`),

  lottoIsBonuslist: async () =>
    await axios.get(`${config.apiPath}/api/lotto/lottoIsBonuslist`),
}; 

export default LottoService;
