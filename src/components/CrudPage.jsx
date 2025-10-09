import { useEffect, useState } from "react";
import Layout from "./Layout";
import useCrud from "../hooks/useCrud";
import api from "../services/api";

/**
 * Componente genérico de CRUD
 * 
 * Props:
 * - title: título da página (string)
 * - basePath: endpoint base (ex: "/especies")
 * - searchPath: endpoint de busca (ex: "/especies/buscar")
 * - fields: configuração dos campos [{ name, label, type, required, source, optionLabel, optionValue }]
 */
export default function CrudPage({ title, basePath, searchPath, fields }) {
  const { items, loading, saving, search, create, update, remove } = useCrud(basePath, searchPath);

  const [termo, setTermo] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({});
  const [selectData, setSelectData] = useState({});

  // 🔹 Busca dados de selects (campos com source)
  useEffect(() => {
    fields
      .filter((f) => f.type === "select" && f.source)
      .forEach(async (f) => {
        try {
          const res = await api.get(f.source);
          setSelectData((prev) => ({
            ...prev,
            [f.name]: res.data?.content ?? res.data ?? [],
          }));
        } catch (err) {
          console.error(`Erro ao carregar ${f.name}:`, err);
        }
      });
  }, [fields]);

  const onSearch = async (e) => {
    e.preventDefault();
    await search(termo);
  };

  const onChange = (name, value) => setForm({ ...form, [name]: value });

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.nome && fields.find((f) => f.required)) {
      alert("Preencha todos os campos obrigatórios.");
      return;
    }

    try {
      if (form.id) await update(form.id, form);
      else await create(form);
      setModalOpen(false);
      setForm({});
      await search(termo);
    } catch (err) {
      console.error("Erro ao salvar:", err);
      alert("Erro ao salvar. Verifique os dados.");
    }
  };

  return (
    <Layout>
      {/* Cabeçalho */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
        <button
          onClick={() => {
            setForm({});
            setModalOpen(true);
          }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-lg transition"
        >
          + Adicionar
        </button>
      </div>

      {/* Buscar */}
      <form onSubmit={onSearch} className="flex gap-3 mb-6">
        <input
          type="text"
          placeholder={`Buscar ${title.toLowerCase()}...`}
          className="flex-1 border rounded-lg px-3 py-2"
          value={termo}
          onChange={(e) => setTermo(e.target.value)}
        />
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg">Buscar</button>
      </form>

      {/* Lista */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-4 py-2 border-b bg-slate-50 text-sm text-slate-600">
          {loading ? "Carregando..." : `${items.length} registro(s)`}
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="text-left bg-slate-100">
              {fields.map((f) => (
                <th key={f.name} className="px-4 py-3 border-b capitalize">
                  {f.label}
                </th>
              ))}
              <th className="px-4 py-3 border-b text-center w-40">Ações</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it.id} className="odd:bg-slate-50 hover:bg-slate-100 transition">
                {fields.map((f) => (
                  <td key={f.name} className="px-4 py-3 border-b">
                    {f.type === "select"
                      ? it[f.name.replace("Id", "")]?.[f.optionLabel] || "—"
                      : it[f.name]}
                  </td>
                ))}
                <td className="px-4 py-3 border-b text-center flex justify-center gap-2">
                  <button
                    onClick={() => {
                      setForm(it);
                      setModalOpen(true);
                    }}
                    className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded transition"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => remove(it.id)}
                    className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded transition"
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {items.length === 0 && !loading && (
          <div className="text-center py-6 text-slate-500">Nenhum registro encontrado</div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg">
            <h2 className="text-lg font-bold mb-4">
              {form.id ? `Editar ${title}` : `Cadastrar ${title}`}
            </h2>

            <form onSubmit={onSubmit} className="flex flex-col gap-4">
              {fields.map((f) =>
                f.type === "select" ? (
                  <select
                    key={f.name}
                    className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                    value={form[f.name] || ""}
                    onChange={(e) => onChange(f.name, e.target.value)}
                    required={f.required}
                  >
                    <option value="">Selecione {f.label.toLowerCase()}</option>
                    {selectData[f.name]?.map((opt) => (
                      <option key={opt[f.optionValue]} value={opt[f.optionValue]}>
                        {opt[f.optionLabel]}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    key={f.name}
                    type={f.type || "text"}
                    placeholder={f.label}
                    className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                    value={form[f.name] || ""}
                    onChange={(e) => onChange(f.name, e.target.value)}
                    required={f.required}
                  />
                )
              )}

              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
                >
                  {saving ? "Salvando..." : form.id ? "Atualizar" : "Salvar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}