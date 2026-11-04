import { useState } from "react";
import { ArrowLeft, ArrowRight, LockKeyhole, Mail, UserRound, UtensilsCrossed } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { registrarUsuario } from "../services/UsuarioService";

export default function CadastroPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();
    const [form, setForm] = useState({ nome: "", email: "", senha: "", confirmarSenha: "" });
    const [erro, setErro] = useState("");
    const [carregando, setCarregando] = useState(false);

    const atualizarCampo = (campo, valor) => {
        setForm((current) => ({ ...current, [campo]: valor }));
        setErro("");
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (form.senha.length < 6) {
            setErro("A senha deve ter pelo menos 6 caracteres.");
            return;
        }
        if (form.senha !== form.confirmarSenha) {
            setErro("A confirmação não coincide com a senha.");
            return;
        }

        try {
            setCarregando(true);
            const data = await registrarUsuario({ nome: form.nome, email: form.email, senha: form.senha });
            login(data.usuario);
            navigate(location.state?.from || "/homepage", {
                replace: true,
                state: location.state?.abrirPagamento ? { abrirPagamento: true } : undefined
            });
        } catch (error) {
            setErro(error.message || "Não foi possível criar sua conta.");
        } finally {
            setCarregando(false);
        }
    };

    return (
        <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-10 text-[#4C2A17] md:px-10">
            <div className="pointer-events-none absolute -left-32 -top-32 h-80 w-80 rounded-full border border-[#8B4513]/10" />
            <div className="pointer-events-none absolute -bottom-44 -right-24 h-[28rem] w-[28rem] rounded-full border border-[#8B4513]/10" />
            <section className="relative grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-[#8B4513]/15 bg-[#FBF5ED]/75 shadow-[0_30px_90px_rgba(76,39,17,0.2)] lg:grid-cols-[0.9fr_1.1fr]">
                <div className="relative flex min-h-[34rem] flex-col justify-between overflow-hidden bg-[linear-gradient(145deg,#3a2117,#75401f_58%,#a96635)] p-8 text-[#FFF8EF] md:p-12">
                    <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full border border-white/10" />
                    <div className="absolute -bottom-40 -left-24 h-80 w-80 rounded-full border border-white/10" />
                    <div className="relative"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F8D9A0] text-[#5B3418]"><UtensilsCrossed size={22} /></div><p className="mt-8 text-xs font-semibold uppercase tracking-[0.35em] text-[#F8D9A0]/75">Brasa Branca</p><h1 className="mt-4 max-w-sm text-4xl font-semibold leading-tight md:text-5xl">Sua mesa começa aqui.</h1><p className="mt-5 max-w-sm text-sm leading-7 text-[#FFF8EF]/72">Crie sua conta para pedir com mais praticidade e acompanhar cada entrega.</p></div>
                    <button type="button" onClick={() => navigate("/login", { state: location.state })} className="relative inline-flex w-fit items-center gap-2 text-sm font-semibold text-[#F8D9A0] transition hover:text-white"><ArrowLeft size={16} /> Já tenho uma conta</button>
                </div>
                <div className="flex items-center p-8 md:p-12"><form onSubmit={handleSubmit} className="w-full max-w-md"><div className="mb-8"><p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#9B8069]">Primeiro passo</p><h2 className="mt-3 text-3xl font-semibold text-[#4C2A17]">Crie sua conta</h2><p className="mt-3 text-sm leading-6 text-[#80634D]">Preencha seus dados para começar.</p></div><div className="space-y-5"><label className="block"><span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[#6F513B]">Nome completo</span><span className="relative block"><UserRound className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#A0846B]" size={18} /><input required minLength={2} className="w-full rounded-xl border border-[#8B4513]/18 bg-white/70 py-3.5 pl-11 pr-4 text-sm text-[#24150E] outline-none transition placeholder:text-[#B8A18C] focus:border-[#8B4513]/60 focus:bg-white focus:ring-4 focus:ring-[#8B4513]/10" placeholder="Seu nome" value={form.nome} onChange={(event) => atualizarCampo("nome", event.target.value)} /></span></label><label className="block"><span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[#6F513B]">E-mail</span><span className="relative block"><Mail className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#A0846B]" size={18} /><input required type="email" autoComplete="email" className="w-full rounded-xl border border-[#8B4513]/18 bg-white/70 py-3.5 pl-11 pr-4 text-sm text-[#24150E] outline-none transition placeholder:text-[#B8A18C] focus:border-[#8B4513]/60 focus:bg-white focus:ring-4 focus:ring-[#8B4513]/10" placeholder="seu@email.com" value={form.email} onChange={(event) => atualizarCampo("email", event.target.value)} /></span></label><label className="block"><span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[#6F513B]">Senha</span><span className="relative block"><LockKeyhole className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#A0846B]" size={18} /><input required minLength={6} type="password" autoComplete="new-password" className="w-full rounded-xl border border-[#8B4513]/18 bg-white/70 py-3.5 pl-11 pr-4 text-sm text-[#24150E] outline-none transition placeholder:text-[#B8A18C] focus:border-[#8B4513]/60 focus:bg-white focus:ring-4 focus:ring-[#8B4513]/10" placeholder="Mínimo de 6 caracteres" value={form.senha} onChange={(event) => atualizarCampo("senha", event.target.value)} /></span></label><label className="block"><span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[#6F513B]">Confirmar senha</span><span className="relative block"><LockKeyhole className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#A0846B]" size={18} /><input required minLength={6} type="password" autoComplete="new-password" className="w-full rounded-xl border border-[#8B4513]/18 bg-white/70 py-3.5 pl-11 pr-4 text-sm text-[#24150E] outline-none transition placeholder:text-[#B8A18C] focus:border-[#8B4513]/60 focus:bg-white focus:ring-4 focus:ring-[#8B4513]/10" placeholder="Repita sua senha" value={form.confirmarSenha} onChange={(event) => atualizarCampo("confirmarSenha", event.target.value)} /></span></label></div>{erro ? <p role="alert" className="mt-5 rounded-xl border border-red-400/30 bg-red-50/70 px-4 py-3 text-sm leading-5 text-red-700">{erro}</p> : null}<button className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#5B3418] px-5 py-3.5 text-sm font-semibold text-[#FFF8EF] shadow-[0_12px_25px_rgba(91,52,24,0.18)] transition hover:bg-[#7A401E] disabled:cursor-not-allowed disabled:opacity-60" type="submit" disabled={carregando}>{carregando ? "Criando conta..." : "Criar minha conta"}<ArrowRight size={17} /></button></form></div>
            </section>
        </main>
    );
}
