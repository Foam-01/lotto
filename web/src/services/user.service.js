import config from "../config";

const { apiClient } = config;

const UserService = {
  list: async () => await apiClient.get("/api/user/list"),
  create: async (payload) => await apiClient.post("/api/user/create", payload),
  edit: async (id, payload) =>
    await apiClient.put(`/api/user/edit/${id}`, payload),
  remove: async (id) => await apiClient.delete(`/api/user/remove/${id}`),

  changePassword: async (id, payload) =>
    await apiClient.put(`/api/user/change-password/${id}`, payload),
};

export default UserService;
