import { createContext, useState, useContext } from "react";
import api from "../services/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  async function login(email, senha) {
    try {
      const response = await api.post("/auth/login", { email, senha });

      // a API retorna o token diretamente como texto
      const token = response.data;

      if (!token || typeof token !== "string") {
        alert("⚠️ Erro: resposta inválida do servidor!");
        return;
      }

      // salva o token e define usuário logado
      localStorage.setItem("token", token);
      setUser({ email });
    } catch (error) {
      console.error("Erro ao logar:", error);
      alert("Email ou senha inválidos");
    }
  }

  function logout() {
    localStorage.removeItem("token");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}