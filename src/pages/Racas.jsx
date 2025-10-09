import CrudPage from "../components/CrudPage";

export default function Racas() {
  return (
    <CrudPage
      title="Raças"
      basePath="/racas"
      searchPath="/racas/buscar"
      fields={[
        { name: "nome", label: "Nome da raça", required: true },
        {
          name: "especieId",
          label: "Espécie",
          type: "select",
          source: "/especies",
          optionLabel: "nome",
          optionValue: "id",
          required: true,
        },
      ]}
    />
  );
}