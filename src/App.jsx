import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Login from "./pages/Login";
import Especies from "./pages/Especies";
import Racas from "./pages/Racas";
import Clientes from "./pages/Clientes";
import Servicos from "./pages/Servicos";
import Profissionais from "./pages/Profissionais";
import Pets from "./pages/Pets";
import Agendamentos from "./pages/Agendamentos";
import Faturamentos from "./pages/Faturamentos";

function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
}

function RedirectRoot() {
  const { user } = useAuth();
  return user ? <Navigate to="/especies" /> : <Navigate to="/login" />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* 👇 redireciona automaticamente se entrar em / */}
          <Route path="/" element={<RedirectRoot />} />

          <Route path="/login" element={<Login />} />

          <Route
            path="/especies"
            element={
              <PrivateRoute>
                <Especies />
              </PrivateRoute>
            }
          />

          <Route
            path="/racas"
            element={
              <PrivateRoute>
                <Racas />
              </PrivateRoute>
            }
          />

          <Route
            path="/clientes"
            element={
              <PrivateRoute>
                <Clientes />
              </PrivateRoute>
            }
          />

          <Route
            path="/servicos"
            element={
              <PrivateRoute>
                <Servicos />
              </PrivateRoute>
            }
          />

          <Route
            path="/profissionais"
            element={
              <PrivateRoute>
                <Profissionais />
              </PrivateRoute>
            }
          />

          <Route
            path="/pets"
            element={
              <PrivateRoute>
                <Pets />
              </PrivateRoute>
            }
          />

          <Route
            path="/agendamentos"
            element={
              <PrivateRoute>
                <Agendamentos />
              </PrivateRoute>
            }
          />
          
          <Route
            path="/faturamentos"
            element={
              <PrivateRoute>
                <Faturamentos />
              </PrivateRoute>
            }
          />

          {/* 👇 rota curinga para qualquer outro endereço */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}