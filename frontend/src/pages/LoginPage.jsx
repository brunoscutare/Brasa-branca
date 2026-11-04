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
        <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-10 text-brand-ink md:px-10">
            <div className="pointer-events-none absolute -left-32 -top-32 h-80 w-80 rounded-full border border-brand-border" />
            <div className="pointer-events-none absolute -bottom-44 -right-24 h-[28rem] w-[28rem] rounded-full border border-brand-border" />

            <section className="relative grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-brand-border bg-brand-surface shadow-[0_30px_90px_rgba(61,35,21,0.2)] lg:grid-cols-[0.9fr_1.1fr]">
                <div className="relative flex min-h-[28rem] flex-col justify-between overflow-hidden bg-brand-ink p-8 text-brand-surface md:p-12">
                    <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full border border-brand-on-dark/10" />
                    <div className="absolute -bottom-40 -left-24 h-80 w-80 rounded-full border border-brand-on-dark/10" />
                    <div className="relative">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-cream text-brand-primary shadow-[0_10px_25px_rgba(61,35,21,0.2)]"><UtensilsCrossed size={22} /></div>
                        <p className="mt-8 text-xs font-semibold uppercase tracking-[0.35em] text-brand-cream/75">Brasa Branca</p>
                        <h1 className="mt-4 max-w-sm text-4xl font-semibold leading-tight md:text-5xl">Sabor que chega até você.</h1>
                        <p className="mt-5 max-w-sm text-sm leading-7 text-brand-on-dark-muted">Entre para acompanhar seus pedidos, salvar seus cartões e deixar sua próxima experiência ainda mais simples.</p>
                    </div>
                    <div className="relative mt-10 flex items-center gap-3 text-xs text-brand-surface/70"><ShieldCheck size={17} className="text-brand-cream" /> Seus dados ficam protegidos na sua conta.</div>
                </div>

                <div className="flex items-center p-8 md:p-12">
                    <form onSubmit={handleSubmit} className="w-full max-w-md">
                        <div className="mb-8">
                            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-muted">Bem-vindo de volta</p>
                            <h2 className="mt-3 text-3xl font-semibold text-brand-ink">Acesse sua conta</h2>
                            <p className="mt-3 text-sm leading-6 text-brand-text">Continue de onde parou e acompanhe tudo pelo seu perfil.</p>
                        </div>

                        <div className="space-y-5">
                            <label className="block"><span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-brand-text">E-mail</span><span className="relative block"><Mail className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted" size={18} /><input className="w-full rounded-xl border border-brand-border bg-brand-field py-3.5 pl-11 pr-4 text-sm text-brand-ink outline-none transition placeholder:text-brand-placeholder focus:border-brand-accent focus:bg-brand-field focus:ring-4 focus:ring-brand-accent/10" placeholder="seu@email.com" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></span></label>
                            <label className="block"><span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-brand-text">Senha</span><span className="relative block"><LockKeyhole className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted" size={18} /><input className="w-full rounded-xl border border-brand-border bg-brand-field py-3.5 pl-11 pr-12 text-sm text-brand-ink outline-none transition placeholder:text-brand-placeholder focus:border-brand-accent focus:bg-brand-field focus:ring-4 focus:ring-brand-accent/10" placeholder="Digite sua senha" type={mostrarSenha ? "text" : "password"} autoComplete="current-password" value={senha} onChange={(e) => setSenha(e.target.value)} required /><button type="button" onClick={() => setMostrarSenha((current) => !current)} aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"} title={mostrarSenha ? "Ocultar senha" : "Mostrar senha"} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-brand-muted transition hover:bg-brand-primary/10 hover:text-brand-primary">{mostrarSenha ? <EyeOff size={18} /> : <Eye size={18} />}</button></span></label>
                        </div>

                        {erro ? <p role="alert" className="mt-5 rounded-xl border border-brand-danger/30 bg-brand-danger-surface px-4 py-3 text-sm leading-5 text-brand-danger">{erro}</p> : null}
                        <button className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-primary px-5 py-3.5 text-sm font-semibold text-brand-surface shadow-[0_12px_25px_rgba(61,35,21,0.18)] transition hover:bg-brand-ink hover:shadow-[0_15px_30px_rgba(61,35,21,0.24)] disabled:cursor-not-allowed disabled:opacity-60" type="submit" disabled={carregando}>{carregando ? "Entrando..." : "Entrar na conta"}<ArrowRight size={17} /></button>
                        <div className="mt-7 flex items-center gap-3"><span className="h-px flex-1 bg-brand-primary/15" /><span className="text-[0.68rem] uppercase tracking-[0.16em] text-brand-muted">ou</span><span className="h-px flex-1 bg-brand-primary/15" /></div>
                        <button type="button" onClick={() => navigate("/cadastro", { state: location.state })} className="mt-5 w-full rounded-xl border border-brand-border px-5 py-3.5 text-sm font-semibold text-brand-primary transition hover:bg-brand-primary/8">Criar sua conta</button>
                        <p className="mt-6 text-center text-xs text-brand-muted">Ao entrar, você concorda com uma experiência mais prática e segura.</p>
                    </form>
                </div>
            </section>
        </main>
    );
}
