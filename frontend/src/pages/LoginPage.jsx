import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { loginUsuario } from "../services/UsuarioService";

export default function LoginPage() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [erro, setErro] = useState("");
    const [carregando, setCarregando] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErro("");
        setCarregando(true);

        try {
            const data = await loginUsuario(email, senha);

            login(data.usuario);
            navigate("/homepage");
        } catch (error) {
            setErro(error.message || "Erro ao conectar com o servidor.");
        } finally {
            setCarregando(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center">
            <form onSubmit={handleSubmit} className="w-96 bg-[#24150E] rounded-2xl shadow-2xl p-8 flex flex-col gap-5">
                <h1 className="text-3xl font-bold text-center text-[#FAF3E7]">
                    Brasa Branca
                </h1>
                <p className="text-center text-[#D6BFA5] text-sm">
                    Acesse sua conta
                </p>
                <input
                    className="w-full px-4 py-3 bg-[#FAF3E7] border border-[#8B4513] rounded-lg text-[#24150E] placeholder:text-[#8B7B70] outline-none focus:ring-2 focus:ring-[#8B4513]"
                    placeholder="Digite seu email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    className="w-full px-4 py-3 bg-[#FAF3E7] border border-[#8B4513] rounded-lg text-[#24150E] placeholder:text-[#8B7B70] outline-none focus:ring-2 focus:ring-[#8B4513]"
                    placeholder="Digite sua senha"
                    type="password"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    required
                />
                {erro ? (
                    <p className="text-sm text-[#F2B8A0] text-center">{erro}</p>
                ) : null}
                <button
                    className="w-full bg-[#8B4513] text-[#FAF3E7] py-3 rounded-lg font-semibold hover:bg-[#6F370F] transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                    type="submit"
                    disabled={carregando}
                >
                    {carregando ? "Entrando..." : "Entrar"}
                </button>
            </form>
        </div>
    );
}
