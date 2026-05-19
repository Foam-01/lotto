import axios from "axios";
import config from "../config"; // 🌟 อย่าลืมเช็ค path config ของเจ้านายด้วยนะครับ

const BannerService = {
  list: async () => await axios.get(`${config.apiPath}/api/banner/list`),

  create: async (payload) =>
    await axios.post(`${config.apiPath}/api/banner/create`, payload),

  edit: async (id, payload) =>
    await axios.put(`${config.apiPath}/api/banner/edit/${id}`, payload),

  remove: async (id) =>
    await axios.delete(`${config.apiPath}/api/banner/remove/${id}`),
};

export default BannerService;
