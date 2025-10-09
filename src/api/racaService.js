import api from "../services/api";

export const racaService = {
  list: () => api.get("/racas").then(r => r.data),
  create: (payload) => api.post("/racas", payload).then(r => r.data),
  update: (id, payload) => api.put(`/racas/${id}`, payload).then(r => r.data),
  remove: (id) => api.delete(`/racas/${id}`),
};