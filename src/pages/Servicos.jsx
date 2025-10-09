import CrudPage from "../components/CrudPage";

export default function Servicos() {
  return (
    <CrudPage
      title="Serviços"
      basePath="/servicos"
      searchPath="/servicos/buscar"
      fields={[
        { name: "nome", label: "Nome do serviço", required: true },
        { name: "descricao", label: "Descrição", type: "text", required: true },
        { name: "precoBase", label: "Preço base (R$)", type: "number", required: true },
        { name: "duracaoMinutos", label: "Duração (minutos)", type: "number", required: true },
      ]}
    />
  );
}