import axios from "axios";
import config from "../config";

const UserService = {
  list: async () => await axios.get(`${config.apiPath}/api/user/list`),
  create: async (payload) =>
    await axios.post(`${config.apiPath}/api/user/create`, payload),
  edit: async (id, payload) =>
    await axios.put(`${config.apiPath}/api/user/edit/${id}`, payload),
  remove: async (id) =>
    await axios.delete(`${config.apiPath}/api/user/remove/${id}`),

  // 🌟 เพิ่มคำสั่งสำหรับเปลี่ยนรหัสผ่านเข้าไปตรงนี้ครับ!
  changePassword: async (id, payload) =>
    await axios.put(
      `${config.apiPath}/api/user/change-password/${id}`,
      payload,
    ),
};

export default UserService;
