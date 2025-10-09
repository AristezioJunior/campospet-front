import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import useCrud from "../hooks/useCrud";
import api from "../services/api";

export default function Pets() {
  const {
    items,
    loading,
    saving,
    search,
    create,
    update,
    remove,
  } = useCrud("/pets", "/pets/buscar");

  const [termo, setTermo] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState(null);

  const [especies, setEspecies] = useState([]);
  const [racas, setRacas] = useState([]);
  const [clientes, setClientes] = useState([]);

  const sexos = ["MACHO", "FEMEA"];

  const [form, setForm] = useState({
    nome: "",
    especieId: "",
    racaId: "",
    sexo: "",
    peso: "",
    dataNascimento: "",
    observacoes: "",
    clienteId: "",
  });

  // 🔹 Carregar espécies e clientes (racas serão carregadas dinamicamente)
  useEffect(() => {
    const loadAux = async () => {
      const [especiesRes, clientesRes] = await Promise.all([
        api.get("/especies"),
        api.get("/clientes"),
      ]);
      setEspecies(especiesRes.data?.content ?? especiesRes.data ?? []);
      setClientes(clientesRes.data?.content ?? clientesRes.data ?? []);
    };
    loadAux();
  }, []);

  // 🔹 Carregar raças quando espécie for alterada (usando endpoint correto)
  useEffect(() => {
    if (!form.especieId) {
      setRacas([]);
      return;
    }

    const loadRacas = async () => {
      try {
        const res = await api.get(`/racas/especie/${form.especieId}`);
        setRacas(res.data ?? []);
      } catch (error) {
        console.error("Erro ao carregar raças:", error);
        setRacas([]);
      }
    };

    loadRacas();
  }, [form.especieId]);

  const onChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  const resetForm = () => {
    setForm({
      nome: "",
      especieId: "",
      racaId: "",
      sexo: "",
      peso: "",
      dataNascimento: "",
      observacoes: "",
      clienteId: "",
    });
    setEditando(null);
  };

  const validate = () => {
    if (!form.nome.trim()) {
      alert("Informe o nome do pet.");
      return false;
    }
    if (!form.especieId) {
      alert("Selecione a espécie.");
      return false;
    }
    if (!form.racaId) {
      alert("Selecione a raça.");
      return false;
    }
    if (!form.clienteId) {
      alert("Selecione o dono (cliente).");
      return false;
    }
    return true;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      if (editando) {
        await update(editando.id, form);
      } else {
        await create(form);
      }
      await search(termo);
      resetForm();
      setModalOpen(false);
    } catch (error) {
      alert("Erro ao salvar pet. Verifique os dados.");
    }
  };

  const onEdit = (pet) => {
    setEditando(pet);
    setForm({
      nome: pet.nome,
      especieId: pet.especie?.id ?? "",
      racaId: pet.raca?.id ?? "",
      sexo: pet.sexo ?? "",
      peso: pet.peso ?? "",
      dataNascimento: pet.dataNascimento ?? "",
      observacoes: pet.observacoes ?? "",
      clienteId: pet.cliente?.id ?? "",
    });
    setModalOpen(true);
  };

  const onSearch = async (e) => {
    e.preventDefault();
    await search(termo);
  };

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Pets</h1>
        <button
          onClick={() => {
            resetForm();
            setModalOpen(true);
          }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-lg"
        >
          + Adicionar
        </button>
      </div>

      {/* 🔍 Buscar */}
      <form onSubmit={onSearch} className="flex gap-3 mb-6">
        <input
          type="text"
          placeholder="Buscar pet..."
          className="flex-1 border rounded-lg px-3 py-2"
          value={termo}
          onChange={(e) => setTermo(e.target.value)}
        />
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg">
          Buscar
        </button>
      </form>

      {/* 📋 Lista */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-4 py-2 border-b bg-slate-50 text-sm text-slate-600">
          {loading ? "Carregando..." : `${items.length} registro(s)`}
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="text-left">
              <th className="px-4 py-3 border-b">Nome</th>
              <th className="px-4 py-3 border-b">Espécie</th>
              <th className="px-4 py-3 border-b">Raça</th>
              <th className="px-4 py-3 border-b">Sexo</th>
              <th className="px-4 py-3 border-b">Cliente</th>
              <th className="px-4 py-3 border-b w-32">Ações</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it.id} className="odd:bg-slate-50">
                <td className="px-4 py-3 border-b">{it.nome}</td>
                <td className="px-4 py-3 border-b">{it.especie?.nome}</td>
                <td className="px-4 py-3 border-b">{it.raca?.nome}</td>
                <td className="px-4 py-3 border-b">{it.sexo}</td>
                <td className="px-4 py-3 border-b">{it.cliente?.nome}</td>
                <td className="px-4 py-3 border-b text-right">
                  <button
                    onClick={() => onEdit(it)}
                    className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded mr-2"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => remove(it.id)}
                    className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded"
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 🧾 Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 overflow-auto">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl shadow-lg">
            <h2 className="text-lg font-bold mb-4">
              {editando ? "Editar Pet" : "Cadastrar Pet"}
            </h2>
            <form onSubmit={onSubmit} className="grid grid-cols-2 gap-4">
              <input
                placeholder="Nome do pet"
                className="col-span-2 border rounded-lg px-3 py-2"
                value={form.nome}
                onChange={(e) => onChange("nome", e.target.value)}
                required
              />

              <select
                className="border rounded-lg px-3 py-2"
                value={form.especieId}
                onChange={(e) => onChange("especieId", e.target.value)}
                required
              >
                <option value="">Selecione a espécie</option>
                {especies.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.nome}
                  </option>
                ))}
              </select>

              <select
                className="border rounded-lg px-3 py-2"
                value={form.racaId}
                onChange={(e) => onChange("racaId", e.target.value)}
                required
                disabled={!form.especieId}
              >
                <option value="">
                  {form.especieId
                    ? "Selecione a raça"
                    : "Selecione uma espécie primeiro"}
                </option>
                {racas.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.nome}
                  </option>
                ))}
              </select>

              <select
                className="border rounded-lg px-3 py-2"
                value={form.sexo}
                onChange={(e) => onChange("sexo", e.target.value)}
                required
              >
                <option value="">Selecione o sexo</option>
                {sexos.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>

              <input
                type="number"
                step="0.01"
                placeholder="Peso (kg)"
                className="border rounded-lg px-3 py-2"
                value={form.peso}
                onChange={(e) => onChange("peso", e.target.value)}
              />

              <input
                type="date"
                placeholder="Data de nascimento"
                className="border rounded-lg px-3 py-2"
                value={form.dataNascimento}
                onChange={(e) => onChange("dataNascimento", e.target.value)}
              />

              <select
                className="col-span-2 border rounded-lg px-3 py-2"
                value={form.clienteId}
                onChange={(e) => onChange("clienteId", e.target.value)}
                required
              >
                <option value="">Selecione o dono (cliente)</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </select>

              <textarea
                placeholder="Observações"
                className="col-span-2 border rounded-lg px-3 py-2"
                value={form.observacoes}
                onChange={(e) => onChange("observacoes", e.target.value)}
              />

              <div className="col-span-2 flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setModalOpen(false);
                    resetForm();
                  }}
                  className="px-4 py-2 bg-slate-200 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
                >
                  {saving ? "Salvando..." : "Salvar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}