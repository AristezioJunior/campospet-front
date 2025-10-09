import { useAuth } from "../contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";

export default function Layout({ children }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Função para destacar o botão ativo
  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Esquerda: logo + menu */}
          <div className="flex items-center gap-6">
            <h1
              onClick={() => navigate("/especies")}
              className="font-semibold text-indigo-700 cursor-pointer text-lg"
            >
              🐾 CamposPet
            </h1>

            <button
              onClick={() => navigate("/especies")}
              className={`font-medium ${
                isActive("/especies")
                  ? "text-indigo-600 border-b-2 border-indigo-600 pb-1"
                  : "text-slate-700 hover:text-indigo-600"
              }`}
            >
              Espécies
            </button>

            <button
              onClick={() => navigate("/racas")}
              className={`font-medium ${
                isActive("/racas")
                  ? "text-indigo-600 border-b-2 border-indigo-600 pb-1"
                  : "text-slate-700 hover:text-indigo-600"
              }`}
            >
              Raças
            </button>

            <button
              onClick={() => navigate("/clientes")}
              className={`font-medium ${
                isActive("/clientes")
                  ? "text-indigo-600 border-b-2 border-indigo-600 pb-1"
                  : "text-slate-700 hover:text-indigo-600"
              }`}
            >
              Clientes
            </button>

            <button
              onClick={() => navigate("/servicos")}
              className={`font-medium ${
                isActive("/servicos")
                  ? "text-indigo-600 border-b-2 border-indigo-600 pb-1"
                  : "text-slate-700 hover:text-indigo-600"
              }`}
            >
              Serviços
            </button>
            
            <button
              onClick={() => navigate("/profissionais")}
              className={`font-medium ${
                isActive("/profissionais")
                  ? "text-indigo-600 border-b-2 border-indigo-600 pb-1"
                  : "text-slate-700 hover:text-indigo-600"
              }`}
            >
              Profissionais
            </button>

            <button
              onClick={() => navigate("/pets")}
              className={`font-medium ${
                isActive("/pets")
                  ? "text-indigo-600 border-b-2 border-indigo-600 pb-1"
                  : "text-slate-700 hover:text-indigo-600"
              }`}
            >
              Pets
            </button>

            <button
              onClick={() => navigate("/agendamentos")}
              className={`font-medium ${
                isActive("/agendamentos")
                  ? "text-indigo-600 border-b-2 border-indigo-600 pb-1"
                  : "text-slate-700 hover:text-indigo-600"
              }`}
            >
              Agendamentos
            </button>

            <button
              onClick={() => navigate("/faturamentos")}
              className={`font-medium ${
                isActive("/faturamentos")
                  ? "text-indigo-600 border-b-2 border-indigo-600 pb-1"
                  : "text-slate-700 hover:text-indigo-600"
              }`}
            >
              Faturamentos
            </button>
          </div>

          {/* Direita: botão de sair */}
          <button
            onClick={handleLogout}
            className="text-sm bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Sair
          </button>
        </div>
      </nav>

      {/* Conteúdo principal */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}