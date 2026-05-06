// src/services/report.service.js
import axios from "axios";
import config from "../config";

const getHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

const ReportService = {
  // 📊 ส่งวันที่ไปดึงรายงานจาก Backend
  getIncome: async (payload) => {
    // 🌟 ส่งตามสูตร: axios.post(URL, Body, Header)
    return await axios.post(
      `${config.apiPath}/api/billSale/income`,
      payload,
      getHeaders(),
    );
  },
};

export default ReportService;
