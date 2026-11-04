import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck, UtensilsCrossed } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { loginUsuario } from "../services/UsuarioService";
import { homePathFor } from "../utils/auth";

export default function LoginPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [mostrarSenha, setMostrarSenha] = useState(false);
    const [erro, setErro] = useState("");
    const [carregando, setCarregando] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErro("");
        setCarregando(true);

        try {
            const data = await loginUsuario(email, senha);

            login(data.usuario);
            const destino = location.state?.from || homePathFor(data.usuario);
            navigate(destino, {
                replace: true,
                state: location.state?.abrirPagamento ? { abrirPagamento: true } : undefined
            });
        } catch (error) {
            setErro(error.message || "Erro ao conectar com o servidor.");
        } finally {
            setCarregando(false);
        }
    };

    return (
        <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-10 text-[#4C2A17] md:px-10">
            <div className="pointer-events-none absolute -left-32 -top-32 h-80 w-80 rounded-full border border-[#8B4513]/10" />
            <div className="pointer-events-none absolute -bottom-44 -right-24 h-[28rem] w-[28rem] rounded-full border border-[#8B4513]/10" />

            <section className="relative grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-[#8B4513]/15 bg-[#FBF5ED]/75 shadow-[0_30px_90px_rgba(76,39,17,0.2)] lg:grid-cols-[0.9fr_1.1fr]">
                <div className="relative flex min-h-[28rem] flex-col justify-between overflow-hidden bg-[linear-gradient(145deg,#3a2117,#75401f_58%,#a96635)] p-8 text-[#FFF8EF] md:p-12">
                    <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full border border-white/10" />
                    <div className="absolute -bottom-40 -left-24 h-80 w-80 rounded-full border border-white/10" />
                    <div className="relative">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F8D9A0] text-[#5B3418] shadow-[0_10px_25px_rgba(38,18,7,0.2)]"><UtensilsCrossed size={22} /></div>
                        <p className="mt-8 text-xs font-semibold uppercase tracking-[0.35em] text-[#F8D9A0]/75">Brasa Branca</p>
                        <h1 className="mt-4 max-w-sm text-4xl font-semibold leading-tight md:text-5xl">Sabor que chega até você.</h1>
                        <p className="mt-5 max-w-sm text-sm leading-7 text-[#FFF8EF]/72">Entre para acompanhar seus pedidos, salvar seus cartões e deixar sua próxima experiência ainda mais simples.</p>
                    </div>
                    <div className="relative mt-10 flex items-center gap-3 text-xs text-[#FFF8EF]/70"><ShieldCheck size={17} className="text-[#F8D9A0]" /> Seus dados ficam protegidos na sua conta.</div>
                </div>

                <div className="flex items-center p-8 md:p-12">
                    <form onSubmit={handleSubmit} className="w-full max-w-md">
                        <div className="mb-8">
                            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#9B8069]">Bem-vindo de volta</p>
                            <h2 className="mt-3 text-3xl font-semibold text-[#4C2A17]">Acesse sua conta</h2>
                            <p className="mt-3 text-sm leading-6 text-[#80634D]">Continue de onde parou e acompanhe tudo pelo seu perfil.</p>
                        </div>

                        <div className="space-y-5">
                            <label className="block"><span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[#6F513B]">E-mail</span><span className="relative block"><Mail className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#A0846B]" size={18} /><input className="w-full rounded-xl border border-[#8B4513]/18 bg-white/70 py-3.5 pl-11 pr-4 text-sm text-[#24150E] outline-none transition placeholder:text-[#B8A18C] focus:border-[#8B4513]/60 focus:bg-white focus:ring-4 focus:ring-[#8B4513]/10" placeholder="seu@email.com" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></span></label>
                            <label className="block"><span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[#6F513B]">Senha</span><span className="relative block"><LockKeyhole className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#A0846B]" size={18} /><input className="w-full rounded-xl border border-[#8B4513]/18 bg-white/70 py-3.5 pl-11 pr-12 text-sm text-[#24150E] outline-none transition placeholder:text-[#B8A18C] focus:border-[#8B4513]/60 focus:bg-white focus:ring-4 focus:ring-[#8B4513]/10" placeholder="Digite sua senha" type={mostrarSenha ? "text" : "password"} autoComplete="current-password" value={senha} onChange={(e) => setSenha(e.target.value)} required /><button type="button" onClick={() => setMostrarSenha((current) => !current)} aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"} title={mostrarSenha ? "Ocultar senha" : "Mostrar senha"} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-[#A0846B] transition hover:bg-[#8B4513]/10 hover:text-[#5B3418]">{mostrarSenha ? <EyeOff size={18} /> : <Eye size={18} />}</button></span></label>
                        </div>

                        {erro ? <p role="alert" className="mt-5 rounded-xl border border-red-400/30 bg-red-50/70 px-4 py-3 text-sm leading-5 text-red-700">{erro}</p> : null}
                        <button className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#5B3418] px-5 py-3.5 text-sm font-semibold text-[#FFF8EF] shadow-[0_12px_25px_rgba(91,52,24,0.18)] transition hover:bg-[#7A401E] hover:shadow-[0_15px_30px_rgba(91,52,24,0.24)] disabled:cursor-not-allowed disabled:opacity-60" type="submit" disabled={carregando}>{carregando ? "Entrando..." : "Entrar na conta"}<ArrowRight size={17} /></button>
                        <div className="mt-7 flex items-center gap-3"><span className="h-px flex-1 bg-[#8B4513]/15" /><span className="text-[0.68rem] uppercase tracking-[0.16em] text-[#A0846B]">ou</span><span className="h-px flex-1 bg-[#8B4513]/15" /></div>
                        <button type="button" onClick={() => navigate("/cadastro", { state: location.state })} className="mt-5 w-full rounded-xl border border-[#8B4513]/30 px-5 py-3.5 text-sm font-semibold text-[#5B3418] transition hover:bg-[#8B4513]/8">Criar sua conta</button>
                        <p className="mt-6 text-center text-xs text-[#9B8069]">Ao entrar, você concorda com uma experiência mais prática e segura.</p>
                    </form>
                </div>
            </section>
        </main>
    );
}
