import CrudPage from "../components/CrudPage";

export default function Especies() {
  return (
    <CrudPage
      title="Espécies"
      basePath="/especies"
      searchPath="/especies/buscar"
      fields={[{ name: "nome", label: "Nome da espécie", required: true }]}
    />
  );
}