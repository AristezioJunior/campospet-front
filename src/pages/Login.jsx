import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, senha);
      const token = localStorage.getItem("token");
      if (token) navigate("/especies");
      else alert("Email ou senha inválidos");
    } catch {
      alert("Erro ao fazer login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-blue-500 to-emerald-400 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/20">
          <div className="text-center mb-8">
            <div className="text-3xl font-semibold text-white">🐾 CamposPet</div>
            <div className="text-white/80 mt-1">Acesse sua conta</div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm text-white/90 mb-1">Email</label>
              <input
                type="email"
                className="w-full rounded-xl bg-white/20 text-white placeholder-white/60 border border-white/30 outline-none px-4 py-3 focus:ring-2 focus:ring-white/50"
                placeholder="ex: admin@campospet.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
                required
              />
            </div>

            <div>
              <label className="block text-sm text-white/90 mb-1">Senha</label>
              <input
                type="password"
                className="w-full rounded-xl bg-white/20 text-white placeholder-white/60 border border-white/30 outline-none px-4 py-3 focus:ring-2 focus:ring-white/50"
                placeholder="••••••••"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 transition-transform active:scale-[0.98] disabled:opacity-70"
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </div>

        <p className="text-center text-white/80 text-sm mt-6">
          Dica: use <span className="font-medium">admin@campospet.com</span> / <span className="font-medium">123456</span>
        </p>
      </div>
    </div>
  );
}