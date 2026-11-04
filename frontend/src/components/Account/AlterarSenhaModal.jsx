import { useState } from "react";
import { KeyRound, X } from "lucide-react";
import { alterarSenha } from "../../services/PerfilService";

export default function AlterarSenhaModal({ usuarioId, onClose, onSuccess }) {
    const [form, setForm] = useState({ senhaAtual: "", novaSenha: "", confirmarSenha: "" });
    const [erro, setErro] = useState("");
    const [salvando, setSalvando] = useState(false);

    const atualizarCampo = (campo, valor) => {
        setForm((current) => ({ ...current, [campo]: valor }));
        setErro("");
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (form.novaSenha.length < 6) {
            setErro("A nova senha deve ter pelo menos 6 caracteres.");
            return;
        }

        if (form.novaSenha !== form.confirmarSenha) {
            setErro("A confirmação não coincide com a nova senha.");
            return;
        }

        setSalvando(true);
        try {
            await alterarSenha(usuarioId, { senhaAtual: form.senhaAtual, novaSenha: form.novaSenha });
            onSuccess();
        } catch (error) {
            setErro(error.message || "Não foi possível alterar a senha.");
        } finally {
            setSalvando(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[130] flex items-end justify-center bg-brand-ink/60 p-0 backdrop-blur-sm sm:items-center sm:p-5">
            <section role="dialog" aria-modal="true" aria-labelledby="change-password-title" className="w-full max-w-md rounded-t-[2rem] bg-brand-surface p-6 shadow-[0_28px_90px_rgba(61,35,21,0.32)] sm:rounded-[2rem] md:p-8">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <p className="text-xs uppercase tracking-[0.25em] text-brand-muted">Segurança</p>
                        <h2 id="change-password-title" className="mt-2 text-2xl font-semibold text-brand-ink">Trocar senha</h2>
                    </div>
                    <button type="button" onClick={onClose} className="rounded-full p-2 text-brand-text hover:bg-brand-primary/10" aria-label="Fechar"><X size={20} /></button>
                </div>
                <p className="mt-3 text-sm leading-6 text-brand-text">Informe sua senha atual e escolha uma nova senha para proteger sua conta.</p>
                {erro ? <p className="mt-5 rounded-xl border border-brand-danger/30 bg-brand-danger-surface px-4 py-3 text-sm text-brand-danger">{erro}</p> : null}
                <form onSubmit={handleSubmit} className="mt-7 grid gap-4">
                    <label><span className="mb-2 block text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-brand-text">Senha atual</span><input required type="password" autoComplete="current-password" value={form.senhaAtual} onChange={(event) => atualizarCampo("senhaAtual", event.target.value)} className="w-full rounded-xl border border-brand-border bg-brand-field px-4 py-3 text-sm text-brand-ink outline-none focus:border-brand-accent" /></label>
                    <label><span className="mb-2 block text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-brand-text">Nova senha</span><input required minLength={6} type="password" autoComplete="new-password" value={form.novaSenha} onChange={(event) => atualizarCampo("novaSenha", event.target.value)} className="w-full rounded-xl border border-brand-border bg-brand-field px-4 py-3 text-sm text-brand-ink outline-none focus:border-brand-accent" /></label>
                    <label><span className="mb-2 block text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-brand-text">Confirmar nova senha</span><input required minLength={6} type="password" autoComplete="new-password" value={form.confirmarSenha} onChange={(event) => atualizarCampo("confirmarSenha", event.target.value)} className="w-full rounded-xl border border-brand-border bg-brand-field px-4 py-3 text-sm text-brand-ink outline-none focus:border-brand-accent" /></label>
                    <button type="submit" disabled={salvando} className="mt-3 inline-flex items-center justify-center gap-2 rounded-xl bg-brand-primary px-5 py-3.5 text-sm font-semibold text-brand-surface transition hover:bg-brand-ink disabled:opacity-60"><KeyRound size={16} />{salvando ? "Salvando..." : "Atualizar senha"}</button>
                </form>
            </section>
        </div>
    );
}
