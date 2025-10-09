import api from "../services/api";

export const especieService = {
  // Lista completa (paginação padrão do backend)
  list: () => api.get("/especies").then(r => r.data),

  // Busca com termo (usa endpoint /buscar)
  search: (termo = "") =>
    api
      .get("/especies/buscar", {
        params: { termo },
      })
      .then((r) => r.data),

  // Criação
  create: (payload) => api.post("/especies", payload).then(r => r.data),

  // Atualização
  update: (id, payload) => api.put(`/especies/${id}`, payload).then(r => r.data),

  // Exclusão
  remove: (id) => api.delete(`/especies/${id}`),
};