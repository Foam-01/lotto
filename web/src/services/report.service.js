// src/services/report.service.js
import config from "../config";

const { apiClient } = config;

const ReportService = {
  getIncome: async (payload) => {
    return await apiClient.post("/api/billSale/income", payload);
  },

  getProfit: async (payload) =>
    await apiClient.post("/api/billSale/profit", payload),
};

export default ReportService;
