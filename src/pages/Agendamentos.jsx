import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import useCrud from "../hooks/useCrud";
import api from "../services/api";

export default function Agendamentos() {
  const {
    items,
    loading,
    saving,
    create,
    update,
    remove,
    setItems, // usado pra atualizar resultados após busca
  } = useCrud("/agendamentos", "/agendamentos/buscar");

  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState(null);

  // 🔍 Filtros
  const [profissionalId, setProfissionalId] = useState("");
  const [petId, setPetId] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");

  // Dados auxiliares
  const [profissionais, setProfissionais] = useState([]);
  const [pets, setPets] = useState([]);
  const [servicos, setServicos] = useState([]);

  // Formulário
  const [form, setForm] = useState({
    petId: "",
    profissionalId: "",
    servicoId: "",
    dataHoraInicio: "",
    dataHoraFim: "",
    statusAgendamento: "AGENDADO",
    observacao: "",
  });

  // Carregar listas auxiliares
  useEffect(() => {
    const loadAux = async () => {
      try {
        const [profRes, petRes, servRes] = await Promise.all([
          api.get("/profissionais"),
          api.get("/pets"),
          api.get("/servicos"),
        ]);
        setProfissionais(profRes.data?.content ?? profRes.data ?? []);
        setPets(petRes.data?.content ?? petRes.data ?? []);
        setServicos(servRes.data?.content ?? servRes.data ?? []);
      } catch (err) {
        console.error("Erro ao carregar dados auxiliares:", err);
      }
    };
    loadAux();
  }, []);

  const resetForm = () => {
    setForm({
      petId: "",
      profissionalId: "",
      servicoId: "",
      dataHoraInicio: "",
      dataHoraFim: "",
      statusAgendamento: "AGENDADO",
      observacao: "",
    });
    setEditando(null);
  };

  const onChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  const toISOWithTimezone = (localDateTime) => {
    const date = new Date(localDateTime);
    return date.toISOString(); // inclui offset UTC
  };

  const validate = () => {
    if (!form.petId || !form.profissionalId || !form.servicoId) {
      alert("Pet, profissional e serviço são obrigatórios.");
      return false;
    }
    if (!form.dataHoraInicio || !form.dataHoraFim) {
      alert("Informe o horário de início e término.");
      return false;
    }
    return true;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    // Converter horários para ISO (UTC)
    const payload = {
      ...form,
      dataHoraInicio: toISOWithTimezone(form.dataHoraInicio),
      dataHoraFim: toISOWithTimezone(form.dataHoraFim),
    };

    try {
      if (editando) {
        await update(editando.id, payload);
      } else {
        await create(payload);
      }
      setModalOpen(false);
      resetForm();
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar agendamento. Verifique os dados.");
    }
  };

  const onEdit = (a) => {
    setEditando(a);
    setForm({
      petId: a.pet?.id ?? "",
      profissionalId: a.profissional?.id ?? "",
      servicoId: a.servico?.id ?? "",
      dataHoraInicio: a.dataHoraInicio?.substring(0, 16) ?? "",
      dataHoraFim: a.dataHoraFim?.substring(0, 16) ?? "",
      statusAgendamento: a.statusAgendamento ?? "AGENDADO",
      observacao: a.observacao ?? "",
    });
    setModalOpen(true);
  };

  const onSearch = async (e) => {
    e.preventDefault();

    try {
      const res = await api.get("/agendamentos/buscar", {
        params: {
          profissionalId: profissionalId || null,
          petId: petId || null,
          dataInicio: dataInicio ? new Date(dataInicio).toISOString() : null,
          dataFim: dataFim ? new Date(dataFim).toISOString() : null,
        },
      });
      setItems(res.data?.content ?? res.data ?? []);
    } catch (err) {
      console.error("Erro ao buscar agendamentos:", err);
      alert("Erro ao buscar agendamentos.");
    }
  };

  return (
    <Layout>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Agendamentos</h1>
        <button
          onClick={() => {
            resetForm();
            setModalOpen(true);
          }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-lg"
        >
          + Agendar
        </button>
      </div>

      {/* 🔍 Filtros */}
      <form onSubmit={onSearch} className="grid grid-cols-5 gap-3 mb-6 items-end">
        <div>
          <label className="text-sm text-slate-600 block mb-1">Profissional</label>
          <select
            className="w-full border rounded-lg px-3 py-2"
            value={profissionalId}
            onChange={(e) => setProfissionalId(e.target.value)}
          >
            <option value="">Todos</option>
            {profissionais.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm text-slate-600 block mb-1">Pet</label>
          <select
            className="w-full border rounded-lg px-3 py-2"
            value={petId}
            onChange={(e) => setPetId(e.target.value)}
          >
            <option value="">Todos</option>
            {pets.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm text-slate-600 block mb-1">Data Início</label>
          <input
            type="datetime-local"
            className="w-full border rounded-lg px-3 py-2"
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm text-slate-600 block mb-1">Data Fim</label>
          <input
            type="datetime-local"
            className="w-full border rounded-lg px-3 py-2"
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
          />
        </div>

        <button
          type="submit"
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-lg"
        >
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
              <th className="px-4 py-3 border-b">Pet</th>
              <th className="px-4 py-3 border-b">Profissional</th>
              <th className="px-4 py-3 border-b">Serviço</th>
              <th className="px-4 py-3 border-b">Período</th>
              <th className="px-4 py-3 border-b">Status</th>
              <th className="px-4 py-3 border-b w-32">Ações</th>
            </tr>
          </thead>
          <tbody>
            {items.map((a) => (
              <tr key={a.id} className="odd:bg-slate-50">
                <td className="px-4 py-3 border-b">{a.pet?.nome}</td>
                <td className="px-4 py-3 border-b">{a.profissional?.nome}</td>
                <td className="px-4 py-3 border-b">{a.servico?.nome}</td>
                <td className="px-4 py-3 border-b">
                  {new Date(a.dataHoraInicio).toLocaleString("pt-BR")} <br />
                  <span className="text-slate-500">
                    até {new Date(a.dataHoraFim).toLocaleString("pt-BR")}
                  </span>
                </td>
                <td className="px-4 py-3 border-b">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      a.statusAgendamento === "AGENDADO"
                        ? "bg-blue-100 text-blue-700"
                        : a.statusAgendamento === "CONFIRMADO"
                        ? "bg-green-100 text-green-700"
                        : a.statusAgendamento === "CONCLUIDO"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-rose-100 text-rose-700"
                    }`}
                  >
                    {a.statusAgendamento}
                  </span>
                </td>
                <td className="px-4 py-3 border-b text-right">
                  <button
                    onClick={() => onEdit(a)}
                    className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded mr-2"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => remove(a.id)}
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
              {editando ? "Editar Agendamento" : "Novo Agendamento"}
            </h2>
            <form onSubmit={onSubmit} className="grid grid-cols-2 gap-4">
              <select
                className="border rounded-lg px-3 py-2"
                value={form.petId}
                onChange={(e) => onChange("petId", e.target.value)}
                required
              >
                <option value="">Selecione o Pet</option>
                {pets.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nome}
                  </option>
                ))}
              </select>

              <select
                className="border rounded-lg px-3 py-2"
                value={form.profissionalId}
                onChange={(e) => onChange("profissionalId", e.target.value)}
                required
              >
                <option value="">Selecione o Profissional</option>
                {profissionais.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nome}
                  </option>
                ))}
              </select>

              <select
                className="border rounded-lg px-3 py-2"
                value={form.servicoId}
                onChange={(e) => onChange("servicoId", e.target.value)}
                required
              >
                <option value="">Selecione o Serviço</option>
                {servicos.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nome}
                  </option>
                ))}
              </select>

              <select
                className="border rounded-lg px-3 py-2"
                value={form.statusAgendamento}
                onChange={(e) => onChange("statusAgendamento", e.target.value)}
              >
                {["AGENDADO", "CONFIRMADO", "CANCELADO", "CONCLUIDO"].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>

              <input
                type="datetime-local"
                className="border rounded-lg px-3 py-2"
                value={form.dataHoraInicio}
                onChange={(e) => onChange("dataHoraInicio", e.target.value)}
                required
              />
              <input
                type="datetime-local"
                className="border rounded-lg px-3 py-2"
                value={form.dataHoraFim}
                onChange={(e) => onChange("dataHoraFim", e.target.value)}
                required
              />

              <textarea
                placeholder="Observações"
                className="col-span-2 border rounded-lg px-3 py-2"
                value={form.observacao}
                onChange={(e) => onChange("observacao", e.target.value)}
              />

              <div className="col-span-2 flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
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