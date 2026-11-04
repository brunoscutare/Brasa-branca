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
        <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-10 text-brand-ink md:px-10">
            <div className="pointer-events-none absolute -left-32 -top-32 h-80 w-80 rounded-full border border-brand-border" />
            <div className="pointer-events-none absolute -bottom-44 -right-24 h-[28rem] w-[28rem] rounded-full border border-brand-border" />
            <section className="relative grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-brand-border bg-brand-surface shadow-[0_30px_90px_rgba(61,35,21,0.2)] lg:grid-cols-[0.9fr_1.1fr]">
                <div className="relative flex min-h-[34rem] flex-col justify-between overflow-hidden bg-brand-ink p-8 text-brand-surface md:p-12">
                    <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full border border-brand-on-dark/10" />
                    <div className="absolute -bottom-40 -left-24 h-80 w-80 rounded-full border border-brand-on-dark/10" />
                    <div className="relative"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-cream text-brand-primary"><UtensilsCrossed size={22} /></div><p className="mt-8 text-xs font-semibold uppercase tracking-[0.35em] text-brand-cream/75">Brasa Branca</p><h1 className="mt-4 max-w-sm text-4xl font-semibold leading-tight md:text-5xl">Sua mesa começa aqui.</h1><p className="mt-5 max-w-sm text-sm leading-7 text-brand-on-dark-muted">Crie sua conta para pedir com mais praticidade e acompanhar cada entrega.</p></div>
                    <button type="button" onClick={() => navigate("/login", { state: location.state })} className="relative inline-flex w-fit items-center gap-2 text-sm font-semibold text-brand-cream transition hover:text-brand-on-dark"><ArrowLeft size={16} /> Já tenho uma conta</button>
                </div>
                <div className="flex items-center p-8 md:p-12"><form onSubmit={handleSubmit} className="w-full max-w-md"><div className="mb-8"><p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-muted">Primeiro passo</p><h2 className="mt-3 text-3xl font-semibold text-brand-ink">Crie sua conta</h2><p className="mt-3 text-sm leading-6 text-brand-text">Preencha seus dados para começar.</p></div><div className="space-y-5"><label className="block"><span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-brand-text">Nome completo</span><span className="relative block"><UserRound className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted" size={18} /><input required minLength={2} className="w-full rounded-xl border border-brand-border bg-brand-field py-3.5 pl-11 pr-4 text-sm text-brand-ink outline-none transition placeholder:text-brand-placeholder focus:border-brand-accent focus:bg-brand-field focus:ring-4 focus:ring-brand-accent/10" placeholder="Seu nome" value={form.nome} onChange={(event) => atualizarCampo("nome", event.target.value)} /></span></label><label className="block"><span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-brand-text">E-mail</span><span className="relative block"><Mail className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted" size={18} /><input required type="email" autoComplete="email" className="w-full rounded-xl border border-brand-border bg-brand-field py-3.5 pl-11 pr-4 text-sm text-brand-ink outline-none transition placeholder:text-brand-placeholder focus:border-brand-accent focus:bg-brand-field focus:ring-4 focus:ring-brand-accent/10" placeholder="seu@email.com" value={form.email} onChange={(event) => atualizarCampo("email", event.target.value)} /></span></label><label className="block"><span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-brand-text">Senha</span><span className="relative block"><LockKeyhole className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted" size={18} /><input required minLength={6} type="password" autoComplete="new-password" className="w-full rounded-xl border border-brand-border bg-brand-field py-3.5 pl-11 pr-4 text-sm text-brand-ink outline-none transition placeholder:text-brand-placeholder focus:border-brand-accent focus:bg-brand-field focus:ring-4 focus:ring-brand-accent/10" placeholder="Mínimo de 6 caracteres" value={form.senha} onChange={(event) => atualizarCampo("senha", event.target.value)} /></span></label><label className="block"><span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-brand-text">Confirmar senha</span><span className="relative block"><LockKeyhole className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted" size={18} /><input required minLength={6} type="password" autoComplete="new-password" className="w-full rounded-xl border border-brand-border bg-brand-field py-3.5 pl-11 pr-4 text-sm text-brand-ink outline-none transition placeholder:text-brand-placeholder focus:border-brand-accent focus:bg-brand-field focus:ring-4 focus:ring-brand-accent/10" placeholder="Repita sua senha" value={form.confirmarSenha} onChange={(event) => atualizarCampo("confirmarSenha", event.target.value)} /></span></label></div>{erro ? <p role="alert" className="mt-5 rounded-xl border border-brand-danger/30 bg-brand-danger-surface px-4 py-3 text-sm leading-5 text-brand-danger">{erro}</p> : null}<button className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-primary px-5 py-3.5 text-sm font-semibold text-brand-surface shadow-[0_12px_25px_rgba(61,35,21,0.18)] transition hover:bg-brand-ink disabled:cursor-not-allowed disabled:opacity-60" type="submit" disabled={carregando}>{carregando ? "Criando conta..." : "Criar minha conta"}<ArrowRight size={17} /></button></form></div>
            </section>
        </main>
    );
}
