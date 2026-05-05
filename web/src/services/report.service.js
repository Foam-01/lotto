// src/services/report.service.js
import axios from "axios";
import config from "../config";

const getHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

const ReportService = {
  // 📊 ส่งวันที่ไปดึงรายงานจาก Backend
  getIncome: async (startDate, endDate) => {
    return await axios.get(`${config.apiPath}/api/report/income`, {
      ...getHeaders(),
      params: {
        startDate: startDate,
        endDate: endDate,
      },
    });
  },
};

export default ReportService;
