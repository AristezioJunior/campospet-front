import { useEffect, useState } from "react";
import { IMaskInput } from "react-imask";
import validator from "validator";
import Layout from "../components/Layout";
import useCrud from "../hooks/useCrud";
import api from "../services/api";

export default function Profissionais() {
  const {
    items,
    loading,
    saving,
    search,
    create,
    update,
    remove,
  } = useCrud("/profissionais", "/profissionais/buscar");

  const [termo, setTermo] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState(null);
  const [cidades, setCidades] = useState([]);
  const [servicos, setServicos] = useState([]);

  const especialidades = [
    "VETERINARIO",
    "TOSADOR",
    "BANHISTA",
    "AUXILIAR_VETERINARIO",
    "ESTETICISTA",
    "BARBEIRO",
    "MANICURE",
    "OUTRO",
  ];

  const [form, setForm] = useState({
    nome: "",
    especialidade: "",
    telefoneFixo: "",
    celular: "",
    email: "",
    endereco: {
      cep: "",
      logradouro: "",
      numero: "",
      complemento: "",
      bairro: "",
      cidadeId: "",
    },
    servicoIds: [],
    observacoes: "",
  });

  // 🔹 Carregar cidades e serviços
  useEffect(() => {
    const loadAux = async () => {
      const [cidadesRes, servicosRes] = await Promise.all([
        api.get("/cidades"),
        api.get("/servicos"),
      ]);
      setCidades(cidadesRes.data?.content ?? cidadesRes.data ?? []);
      setServicos(servicosRes.data?.content ?? servicosRes.data ?? []);
    };
    loadAux();
  }, []);

  // 🔹 Atualizar formulário
  const onChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  const onEnderecoChange = (field, value) => {
    setForm({
      ...form,
      endereco: { ...form.endereco, [field]: value },
    });
  };

  const validate = () => {
    if (form.nome.trim().length < 3) {
      alert("O nome deve ter ao menos 3 caracteres.");
      return false;
    }
    if (!validator.isEmail(form.email)) {
      alert("E-mail inválido.");
      return false;
    }
    if (!form.especialidade) {
      alert("Selecione uma especialidade.");
      return false;
    }
    return true;
  };

  const resetForm = () => {
    setForm({
      nome: "",
      especialidade: "",
      telefoneFixo: "",
      celular: "",
      email: "",
      endereco: {
        cep: "",
        logradouro: "",
        numero: "",
        complemento: "",
        bairro: "",
        cidadeId: "",
      },
      servicoIds: [],
      observacoes: "",
    });
    setEditando(null);
  };

  // 🔹 Criar ou atualizar
  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const clean = {
      ...form,
      telefoneFixo: form.telefoneFixo.replace(/\D/g, ""),
      celular: form.celular.replace(/\D/g, ""),
      endereco: { ...form.endereco, cep: form.endereco.cep.replace(/\D/g, "") },
    };

    try {
      if (editando) {
        await update(editando.id, clean);
      } else {
        await create(clean);
      }
      await search(termo);
      resetForm();
      setModalOpen(false);
    } catch {
      alert("Erro ao salvar profissional.");
    }
  };

  const onEdit = (prof) => {
    setEditando(prof);
    setForm({
      ...prof,
      endereco: prof.endereco || {
        cep: "",
        logradouro: "",
        numero: "",
        complemento: "",
        bairro: "",
        cidadeId: "",
      },
      servicoIds: prof.servicos?.map((s) => s.id) ?? [],
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
        <h1 className="text-2xl font-bold text-slate-800">Profissionais</h1>
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
          placeholder="Buscar profissional..."
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
              <th className="px-4 py-3 border-b">Especialidade</th>
              <th className="px-4 py-3 border-b">E-mail</th>
              <th className="px-4 py-3 border-b">Celular</th>
              <th className="px-4 py-3 border-b w-32">Ações</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it.id} className="odd:bg-slate-50">
                <td className="px-4 py-3 border-b">{it.nome}</td>
                <td className="px-4 py-3 border-b">{it.especialidade}</td>
                <td className="px-4 py-3 border-b">{it.email}</td>
                <td className="px-4 py-3 border-b">{it.celular}</td>
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
          <div className="bg-white rounded-xl p-6 w-full max-w-3xl shadow-lg">
            <h2 className="text-lg font-bold mb-4">
              {editando ? "Editar Profissional" : "Cadastrar Profissional"}
            </h2>
            <form onSubmit={onSubmit} className="grid grid-cols-2 gap-4">
              <input
                placeholder="Nome"
                className="col-span-2 border rounded-lg px-3 py-2"
                value={form.nome}
                onChange={(e) => onChange("nome", e.target.value)}
                required
              />

              <select
                className="border rounded-lg px-3 py-2"
                value={form.especialidade}
                onChange={(e) => onChange("especialidade", e.target.value)}
                required
              >
                <option value="">Selecione a especialidade</option>
                {especialidades.map((esp) => (
                  <option key={esp} value={esp}>
                    {esp.replaceAll("_", " ")}
                  </option>
                ))}
              </select>

              <IMaskInput
                mask="(00) 0000-0000"
                placeholder="Telefone fixo"
                className="border rounded-lg px-3 py-2"
                value={form.telefoneFixo}
                onAccept={(v) => onChange("telefoneFixo", v)}
              />
              <IMaskInput
                mask="(00) 00000-0000"
                placeholder="Celular"
                className="border rounded-lg px-3 py-2"
                value={form.celular}
                onAccept={(v) => onChange("celular", v)}
                required
              />
              <input
                type="email"
                placeholder="E-mail"
                className="col-span-2 border rounded-lg px-3 py-2"
                value={form.email}
                onChange={(e) => onChange("email", e.target.value)}
                required
              />

              {/* Endereço */}
              <IMaskInput
                mask="00000-000"
                placeholder="CEP"
                className="border rounded-lg px-3 py-2"
                value={form.endereco.cep}
                onAccept={(v) => onEnderecoChange("cep", v)}
              />
              <input
                placeholder="Logradouro"
                className="col-span-2 border rounded-lg px-3 py-2"
                value={form.endereco.logradouro}
                onChange={(e) => onEnderecoChange("logradouro", e.target.value)}
              />
              <input
                placeholder="Número"
                className="border rounded-lg px-3 py-2"
                value={form.endereco.numero}
                onChange={(e) => onEnderecoChange("numero", e.target.value)}
              />
              <input
                placeholder="Complemento"
                className="border rounded-lg px-3 py-2"
                value={form.endereco.complemento}
                onChange={(e) =>
                  onEnderecoChange("complemento", e.target.value)
                }
              />
              <input
                placeholder="Bairro"
                className="border rounded-lg px-3 py-2"
                value={form.endereco.bairro}
                onChange={(e) => onEnderecoChange("bairro", e.target.value)}
              />

              <select
                className="border rounded-lg px-3 py-2"
                value={form.endereco.cidadeId}
                onChange={(e) => onEnderecoChange("cidadeId", e.target.value)}
                required
              >
                <option value="">Selecione a cidade</option>
                {cidades.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome} - {c.estado?.nome}
                  </option>
                ))}
              </select>

              {/* Serviços */}
              <select
                multiple
                className="col-span-2 border rounded-lg px-3 py-2 h-32"
                value={form.servicoIds}
                onChange={(e) =>
                  onChange(
                    "servicoIds",
                    Array.from(e.target.selectedOptions, (opt) => opt.value)
                  )
                }
              >
                {servicos.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nome}
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