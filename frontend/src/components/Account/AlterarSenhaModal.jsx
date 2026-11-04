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
        <div className="fixed inset-0 z-[130] flex items-end justify-center bg-[#29170d]/65 p-0 backdrop-blur-sm sm:items-center sm:p-5">
            <section role="dialog" aria-modal="true" aria-labelledby="change-password-title" className="w-full max-w-md rounded-t-[2rem] bg-[#FBF5ED] p-6 shadow-[0_28px_90px_rgba(49,24,8,0.32)] sm:rounded-[2rem] md:p-8">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <p className="text-xs uppercase tracking-[0.25em] text-[#9B8069]">Segurança</p>
                        <h2 id="change-password-title" className="mt-2 text-2xl font-semibold text-[#4C2A17]">Trocar senha</h2>
                    </div>
                    <button type="button" onClick={onClose} className="rounded-full p-2 text-[#7A5A43] hover:bg-[#8B4513]/10" aria-label="Fechar"><X size={20} /></button>
                </div>
                <p className="mt-3 text-sm leading-6 text-[#7A5A43]">Informe sua senha atual e escolha uma nova senha para proteger sua conta.</p>
                {erro ? <p className="mt-5 rounded-xl border border-red-400/30 bg-red-50/70 px-4 py-3 text-sm text-red-700">{erro}</p> : null}
                <form onSubmit={handleSubmit} className="mt-7 grid gap-4">
                    <label><span className="mb-2 block text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#6F513B]">Senha atual</span><input required type="password" autoComplete="current-password" value={form.senhaAtual} onChange={(event) => atualizarCampo("senhaAtual", event.target.value)} className="w-full rounded-xl border border-[#8B4513]/18 bg-white/75 px-4 py-3 text-sm text-[#3F2415] outline-none focus:border-[#8B4513]/60" /></label>
                    <label><span className="mb-2 block text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#6F513B]">Nova senha</span><input required minLength={6} type="password" autoComplete="new-password" value={form.novaSenha} onChange={(event) => atualizarCampo("novaSenha", event.target.value)} className="w-full rounded-xl border border-[#8B4513]/18 bg-white/75 px-4 py-3 text-sm text-[#3F2415] outline-none focus:border-[#8B4513]/60" /></label>
                    <label><span className="mb-2 block text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#6F513B]">Confirmar nova senha</span><input required minLength={6} type="password" autoComplete="new-password" value={form.confirmarSenha} onChange={(event) => atualizarCampo("confirmarSenha", event.target.value)} className="w-full rounded-xl border border-[#8B4513]/18 bg-white/75 px-4 py-3 text-sm text-[#3F2415] outline-none focus:border-[#8B4513]/60" /></label>
                    <button type="submit" disabled={salvando} className="mt-3 inline-flex items-center justify-center gap-2 rounded-xl bg-[#5B3418] px-5 py-3.5 text-sm font-semibold text-[#FFF8EF] transition hover:bg-[#7A401E] disabled:opacity-60"><KeyRound size={16} />{salvando ? "Salvando..." : "Atualizar senha"}</button>
                </form>
            </section>
        </div>
    );
}
