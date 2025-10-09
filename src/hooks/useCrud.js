import { useState, useEffect } from "react";
import api from "../services/api";

/**
 * Hook genérico para CRUD
 * @param {string} basePath - endpoint base (ex: "/especies")
 * @param {string} searchPath - endpoint de busca (ex: "/especies/buscar")
 */
export default function useCrud(basePath, searchPath = null) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // 🔍 Carregar lista inicial
  const list = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(basePath);
      setItems(res.data?.content ?? res.data ?? []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  // 🔎 Buscar com termo
  const search = async (termo = "") => {
    if (!searchPath) return list();
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(searchPath, { params: { termo } });
      setItems(res.data?.content ?? res.data ?? []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  // ➕ Criar
  const create = async (payload) => {
    setSaving(true);
    setError(null);
    try {
      const res = await api.post(basePath, payload);
      await list();
      return res.data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setSaving(false);
    }
  };

  // ✏️ Atualizar
  const update = async (id, payload) => {
    setSaving(true);
    setError(null);
    try {
      const res = await api.put(`${basePath}/${id}`, payload);
      await list();
      return res.data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setSaving(false);
    }
  };

  // ❌ Remover
  const remove = async (id) => {
    setSaving(true);
    setError(null);
    try {
      await api.delete(`${basePath}/${id}`);
      await list();
    } catch (err) {
      setError(err);
    } finally {
      setSaving(false);
    }
  };

  // 🚀 Carrega na montagem
  useEffect(() => {
    list();
  }, [basePath]);

  return {
    items,
    loading,
    saving,
    error,
    list,
    search,
    create,
    update,
    remove,
    setItems,
  };
}