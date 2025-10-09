import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import api from "../services/api";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function Faturamentos() {
  const [faturamentos, setFaturamentos] = useState([]);
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [resumo, setResumo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    agendamentoId: "",
    dataReferencia: "",
    valorServico: 0,
    desconto: 0,
    valorFinal: 0,
    formaPagamento: "DINHEIRO",
  });
  const [agendamentos, setAgendamentos] = useState([]);

  const formas = ["DINHEIRO", "CARTAO_CREDITO", "CARTAO_DEBITO", "PIX", "BOLETO"];

  const onChange = (field, value) => {
    setForm({ ...form, [field]: value });
    if (field === "valorServico" || field === "desconto") {
      const vs = Number(field === "valorServico" ? value : form.valorServico);
      const desc = Number(field === "desconto" ? value : form.desconto);
      setForm((prev) => ({ ...prev, valorFinal: Math.max(vs - desc, 0) }));
    }
  };

  const buscar = async (e) => {
    e?.preventDefault();
    if (!dataInicio || !dataFim) {
      alert("Selecione o período para buscar faturamentos.");
      return;
    }
    setLoading(true);
    try {
      const [resFaturamentos, resResumo] = await Promise.all([
        api.get("/faturamentos/buscar", { params: { inicio: dataInicio, fim: dataFim } }),
        api.get("/faturamentos/resumo", { params: { inicio: dataInicio, fim: dataFim } }),
      ]);
      setFaturamentos(resFaturamentos.data);
      setResumo(resResumo.data);
    } catch (err) {
      console.error(err);
      alert("Erro ao buscar faturamentos.");
    } finally {
      setLoading(false);
    }
  };

  const carregarAgendamentosConcluidos = async () => {
    try {
      const res = await api.get("/agendamentos/buscar", { params: { } });
      const concluidos = res.data.content?.filter(
        (a) => a.statusAgendamento === "CONCLUIDO"
      );
      setAgendamentos(concluidos || []);
    } catch (err) {
      console.error("Erro ao buscar agendamentos concluídos", err);
    }
  };

  const abrirModal = () => {
    carregarAgendamentosConcluidos();
    setForm({
      agendamentoId: "",
      dataReferencia: new Date().toISOString().split("T")[0],
      valorServico: 0,
      desconto: 0,
      valorFinal: 0,
      formaPagamento: "DINHEIRO",
    });
    setModalOpen(true);
  };

  const salvar = async (e) => {
    e.preventDefault();
    try {
      await api.post("/faturamentos", form);
      alert("Faturamento cadastrado com sucesso!");
      setModalOpen(false);
      buscar();
    } catch (err) {
      console.error(err);
      alert("Erro ao cadastrar faturamento. Verifique os dados.");
    }
  };

  const atualizarStatus = async (id, novoStatus) => {
    try {
      await api.put(`/faturamentos/${id}/status`, null, { params: { novoStatus } });
      alert(`Status atualizado para ${novoStatus}`);
      buscar();
    } catch (err) {
      alert("Erro ao atualizar status.");
    }
  };

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Faturamentos</h1>
        <button
          onClick={abrirModal}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-lg"
        >
          + Novo Faturamento
        </button>
      </div>

      {/* 🔍 Filtro por período */}
      <form onSubmit={buscar} className="flex gap-3 mb-6">
        <input
          type="date"
          value={dataInicio}
          onChange={(e) => setDataInicio(e.target.value)}
          className="border rounded-lg px-3 py-2"
        />
        <input
          type="date"
          value={dataFim}
          onChange={(e) => setDataFim(e.target.value)}
          className="border rounded-lg px-3 py-2"
        />
        <button
          type="submit"
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg"
        >
          Buscar
        </button>
      </form>

      {/* 📊 Resumo Financeiro */}
      {resumo && (
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="p-4 bg-white rounded-lg shadow text-center">
            <h3 className="text-sm text-slate-500">Total Faturado</h3>
            <p className="text-2xl font-bold text-green-600">
              R$ {Number(resumo.totalFaturado).toFixed(2)}
            </p>
          </div>
          <div className="p-4 bg-white rounded-lg shadow text-center">
            <h3 className="text-sm text-slate-500">Atendimentos</h3>
            <p className="text-2xl font-bold">{resumo.quantidade}</p>
          </div>
          <div className="p-4 bg-white rounded-lg shadow">
            <ResponsiveContainer width="100%" height={150}>
              <PieChart>
                <Pie
                  data={Object.entries(resumo.porFormaPagamento).map(([fp, v]) => ({
                    name: fp,
                    value: v,
                  }))}
                  dataKey="value"
                  outerRadius={60}
                >
                  <Cell fill="#6366F1" />
                  <Cell fill="#22C55E" />
                  <Cell fill="#EAB308" />
                  <Cell fill="#F43F5E" />
                  <Cell fill="#3B82F6" />
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* 📋 Lista */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-4 py-2 border-b bg-slate-50 text-sm text-slate-600">
          {loading ? "Carregando..." : `${faturamentos.length} registro(s)`}
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left bg-slate-50">
              <th className="px-4 py-3 border-b">Data</th>
              <th className="px-4 py-3 border-b">Agendamento</th>
              <th className="px-4 py-3 border-b">Valor</th>
              <th className="px-4 py-3 border-b">Forma de Pagamento</th>
              <th className="px-4 py-3 border-b">Status</th>
              <th className="px-4 py-3 border-b w-48 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {faturamentos.map((f) => (
              <tr key={f.id} className="odd:bg-slate-50">
                <td className="px-4 py-3 border-b">
                  {new Date(f.dataReferencia).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 border-b">{f.agendamento?.id}</td>
                <td className="px-4 py-3 border-b">
                  R$ {Number(f.valorFinal).toFixed(2)}
                </td>
                <td className="px-4 py-3 border-b">{f.formaPagamento}</td>
                <td
                  className={`px-4 py-3 border-b font-medium ${
                    f.statusPagamento === "PAGO"
                      ? "text-green-600"
                      : f.statusPagamento === "CANCELADO"
                      ? "text-rose-600"
                      : "text-yellow-600"
                  }`}
                >
                  {f.statusPagamento}
                </td>
                <td className="px-4 py-3 border-b text-right space-x-2">
                  {f.statusPagamento === "PENDENTE" && (
                    <>
                      <button
                        onClick={() => atualizarStatus(f.id, "PAGO")}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
                      >
                        Marcar Pago
                      </button>
                      <button
                        onClick={() => atualizarStatus(f.id, "CANCELADO")}
                        className="bg-rose-600 hover:bg-rose-700 text-white px-3 py-1 rounded"
                      >
                        Cancelar
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 🧾 Modal de Faturamento */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg">
            <h2 className="text-lg font-bold mb-4">Novo Faturamento</h2>
            <form onSubmit={salvar} className="grid gap-3">
              <select
                className="border rounded-lg px-3 py-2"
                value={form.agendamentoId}
                onChange={(e) => onChange("agendamentoId", e.target.value)}
                required
              >
                <option value="">Selecione um agendamento concluído</option>
                {agendamentos.map((a) => (
                  <option key={a.id} value={a.id}>
                    #{a.id} - {a.pet?.nome} / {a.servico?.nome}
                  </option>
                ))}
              </select>

              <input
                type="date"
                className="border rounded-lg px-3 py-2"
                value={form.dataReferencia}
                onChange={(e) => onChange("dataReferencia", e.target.value)}
                required
              />

              <input
                type="number"
                placeholder="Valor do serviço"
                className="border rounded-lg px-3 py-2"
                value={form.valorServico}
                onChange={(e) => onChange("valorServico", e.target.value)}
                required
              />

              <input
                type="number"
                placeholder="Desconto"
                className="border rounded-lg px-3 py-2"
                value={form.desconto}
                onChange={(e) => onChange("desconto", e.target.value)}
              />

              <input
                type="number"
                readOnly
                className="border rounded-lg px-3 py-2 bg-slate-100"
                value={form.valorFinal}
              />

              <select
                className="border rounded-lg px-3 py-2"
                value={form.formaPagamento}
                onChange={(e) => onChange("formaPagamento", e.target.value)}
              >
                {formas.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>

              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-slate-200 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}