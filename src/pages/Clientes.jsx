import { useState, useEffect } from "react";
import { IMaskInput } from "react-imask";
import validator from "validator";
import Layout from "../components/Layout";
import useCrud from "../hooks/useCrud";
import api from "../services/api";

export default function Clientes() {
  const { items, loading, saving, search, create, update, remove } = useCrud("/clientes", "/clientes/buscar");

  const [termo, setTermo] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [cidades, setCidades] = useState([]);

  const [form, setForm] = useState({
    id: null,
    nome: "",
    cpf: "",
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
  });

  // 🏙️ Carregar cidades ao abrir modal
  useEffect(() => {
    if (modalOpen) {
      api
        .get("/cidades")
        .then((res) => setCidades(res.data?.content ?? res.data ?? []))
        .catch((err) => console.error("Erro ao carregar cidades:", err));
    }
  }, [modalOpen]);

  // 🧹 Resetar formulário ao abrir modal (novo cadastro)
  useEffect(() => {
    if (modalOpen && !form.id) {
      setForm({
        id: null,
        nome: "",
        cpf: "",
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
      });
    }
  }, [modalOpen]);

  const onChange = (field, value) => setForm({ ...form, [field]: value });

  const onEnderecoChange = (field, value) =>
    setForm({
      ...form,
      endereco: { ...form.endereco, [field]: value },
    });

  const validate = () => {
    if (form.nome.trim().length < 3 || form.nome.trim().length > 100) {
      alert("O nome deve ter entre 3 e 100 caracteres.");
      return false;
    }
    if (!validator.isEmail(form.email)) {
      alert("E-mail inválido.");
      return false;
    }
    const cpfNum = form.cpf.replace(/\D/g, "");
    if (!validator.isNumeric(cpfNum) || cpfNum.length !== 11) {
      alert("CPF deve conter 11 dígitos numéricos.");
      return false;
    }
    if (!form.endereco.cidadeId) {
      alert("Selecione uma cidade.");
      return false;
    }
    return true;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!validate()) return;

    const clean = {
      ...form,
      cpf: form.cpf.replace(/\D/g, ""),
      telefoneFixo: form.telefoneFixo.replace(/\D/g, ""),
      celular: form.celular.replace(/\D/g, ""),
      endereco: {
        ...form.endereco,
        cep: form.endereco.cep.replace(/\D/g, ""),
      },
    };

    try {
      if (form.id) {
        await update(form.id, clean);
        console.log("✅ Cliente atualizado");
      } else {
        await create(clean);
        console.log("✅ Cliente criado");
      }
      setModalOpen(false);
      await search(termo);
    } catch (err) {
      console.error("❌ Erro ao salvar:", err);
      alert("Erro ao salvar cliente. Verifique os dados e tente novamente.");
    }
  };

  const onSearch = async (e) => {
    e.preventDefault();
    await search(termo);
  };

  return (
    <Layout>
      {/* Cabeçalho */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Clientes</h1>
        <button
          onClick={() => {
            setForm({ id: null }); // limpa o id para novo cadastro
            setModalOpen(true);
          }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-lg transition"
        >
          + Adicionar
        </button>
      </div>

      {/* Busca */}
      <form onSubmit={onSearch} className="flex gap-3 mb-6">
        <input
          type="text"
          placeholder="Buscar cliente..."
          className="flex-1 border border-slate-300 focus:ring-2 focus:ring-indigo-500 rounded-lg px-3 py-2 outline-none"
          value={termo}
          onChange={(e) => setTermo(e.target.value)}
        />
        <button
          type="submit"
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition"
        >
          Buscar
        </button>
      </form>

      {/* Lista */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-4 py-2 border-b bg-slate-50 text-sm text-slate-600">
          {loading ? "Carregando..." : `${items.length} registro(s)`}
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="text-left bg-slate-100">
              <th className="px-4 py-3 border-b">Nome</th>
              <th className="px-4 py-3 border-b">CPF</th>
              <th className="px-4 py-3 border-b">E-mail</th>
              <th className="px-4 py-3 border-b">Celular</th>
              <th className="px-4 py-3 border-b text-center w-40">Ações</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it.id} className="odd:bg-slate-50 hover:bg-slate-100 transition">
                <td className="px-4 py-3 border-b">{it.nome}</td>
                <td className="px-4 py-3 border-b">{it.cpf}</td>
                <td className="px-4 py-3 border-b">{it.email}</td>
                <td className="px-4 py-3 border-b">{it.celular}</td>
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
          <div className="text-center py-6 text-slate-500">Nenhum cliente encontrado</div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 overflow-auto">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl shadow-lg animate-fade-in">
            <h2 className="text-lg font-bold mb-4">
              {form.id ? "Editar Cliente" : "Cadastrar Cliente"}
            </h2>

            <form onSubmit={onSubmit} className="grid grid-cols-2 gap-4">
              <input
                placeholder="Nome"
                className="col-span-2 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                value={form.nome}
                onChange={(e) => onChange("nome", e.target.value)}
                required
              />
              <IMaskInput
                mask="000.000.000-00"
                placeholder="CPF"
                className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                value={form.cpf}
                onAccept={(v) => onChange("cpf", v)}
                required
              />
              <IMaskInput
                mask="(00) 0000-0000"
                placeholder="Telefone fixo"
                className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                value={form.telefoneFixo}
                onAccept={(v) => onChange("telefoneFixo", v)}
              />
              <IMaskInput
                mask="(00) 00000-0000"
                placeholder="Celular"
                className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                value={form.celular}
                onAccept={(v) => onChange("celular", v)}
                required
              />
              <input
                type="email"
                placeholder="E-mail"
                className="col-span-2 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                value={form.email}
                onChange={(e) => onChange("email", e.target.value)}
                required
              />
              <IMaskInput
                mask="00000-000"
                placeholder="CEP"
                className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                value={form.endereco.cep}
                onAccept={(v) => onEnderecoChange("cep", v)}
                required
              />
              <input
                placeholder="Logradouro"
                className="col-span-2 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                value={form.endereco.logradouro}
                onChange={(e) => onEnderecoChange("logradouro", e.target.value)}
              />
              <input
                placeholder="Número"
                className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                value={form.endereco.numero}
                onChange={(e) => onEnderecoChange("numero", e.target.value)}
              />
              <input
                placeholder="Complemento"
                className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                value={form.endereco.complemento}
                onChange={(e) => onEnderecoChange("complemento", e.target.value)}
              />
              <input
                placeholder="Bairro"
                className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                value={form.endereco.bairro}
                onChange={(e) => onEnderecoChange("bairro", e.target.value)}
              />

              {/* Select de cidade */}
              <select
                className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 col-span-2"
                value={form.endereco.cidadeId}
                onChange={(e) => onEnderecoChange("cidadeId", e.target.value)}
                required
              >
                <option value="">Selecione uma cidade</option>
                {cidades.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome} - {c.estado?.nome}
                  </option>
                ))}
              </select>

              <div className="col-span-2 flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 rounded-lg transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition"
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