import { useEffect, useState } from "react";
import { CheckCircle2, Edit3, Mail, UserRound, X } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { isAdmin } from "../utils/auth";
import { atualizarPerfil, buscarPerfil } from "../services/PerfilService";

function iniciais(nome) {
    return String(nome || "U").split(" ").filter(Boolean).slice(0, 2).map((parte) => parte[0]).join("").toUpperCase();
}

function enderecoVazio() {
    return { cep: "", rua: "", numero: "", complemento: "", bairro: "", cidade: "Araraquara", estado: "SP" };
}

function formatarCep(valor) {
    const digits = String(valor || "").replace(/\D/g, "").slice(0, 8);
    return digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
}

function textoEndereco(endereco) {
    if (!endereco?.rua) return "Nenhum endereço salvo";
    const linha = `${endereco.rua}, ${endereco.numero || "s/n"}`;
    const local = [endereco.bairro, endereco.cidade && endereco.estado ? `${endereco.cidade}/${endereco.estado}` : endereco.cidade, endereco.cep && `CEP ${endereco.cep}`].filter(Boolean).join(" · ");
    return local ? `${linha} — ${local}` : linha;
}

export default function PerfilPage() {
    const { user, login } = useAuth();
    const [perfil, setPerfil] = useState(user);
    const [modalAberto, setModalAberto] = useState(false);
    const [form, setForm] = useState({ nome: user?.nome || "", email: user?.email || "", endereco: enderecoVazio() });
    const [carregando, setCarregando] = useState(true);
    const [salvando, setSalvando] = useState(false);
    const [consultandoCep, setConsultandoCep] = useState(false);
    const [erro, setErro] = useState("");
    const [sucesso, setSucesso] = useState("");

    useEffect(() => {
        let ativo = true;
        buscarPerfil(user.id)
            .then((data) => {
                if (!ativo) return;
                setPerfil(data);
                setForm({ nome: data.nome || "", email: data.email || "", endereco: data.endereco || enderecoVazio() });
                login(data);
            })
            .catch(() => {})
            .finally(() => { if (ativo) setCarregando(false); });

        return () => { ativo = false; };
    }, [user.id, login]);

    useEffect(() => {
        const cep = String(form.endereco?.cep || "").replace(/\D/g, "");
        if (cep.length !== 8) {
            setConsultandoCep(false);
            return undefined;
        }

        const controller = new AbortController();
        setConsultandoCep(true);

        fetch(`https://viacep.com.br/ws/${cep}/json/`, { signal: controller.signal })
            .then((response) => response.json())
            .then((data) => {
                if (data.erro) return;
                setForm((current) => ({
                    ...current,
                    endereco: {
                        ...current.endereco,
                        rua: data.logradouro || current.endereco.rua,
                        bairro: data.bairro || current.endereco.bairro,
                        cidade: data.localidade || current.endereco.cidade,
                        estado: data.uf || current.endereco.estado
                    }
                }));
            })
            .catch((error) => {
                if (error.name !== "AbortError") return;
            })
            .finally(() => {
                if (!controller.signal.aborted) setConsultandoCep(false);
            });

        return () => controller.abort();
    }, [form.endereco?.cep]);

    const abrirModal = () => {
        setForm({ nome: perfil?.nome || "", email: perfil?.email || "", endereco: perfil?.endereco || enderecoVazio() });
        setErro("");
        setSucesso("");
        setModalAberto(true);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSalvando(true);
        setErro("");
        setSucesso("");

        try {
            const temEndereco = ["cep", "rua", "numero", "complemento", "bairro"].some((campo) => String(form.endereco?.[campo] || "").trim());
            const data = await atualizarPerfil(user.id, { ...form, endereco: temEndereco ? form.endereco : null });
            const atualizado = { ...user, ...perfil, ...data.usuario };
            setPerfil(atualizado);
            login(atualizado);
            setModalAberto(false);
            setSucesso("Perfil atualizado com sucesso.");
        } catch (error) {
            setErro(error.message || "Não foi possível atualizar o perfil.");
        } finally {
            setSalvando(false);
        }
    };

    const administrador = isAdmin(perfil || user);

    return (
        <main className="min-h-screen px-6 pb-16 pt-28 text-[#6F370F] md:px-10">
            <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
                <div>
                    <p className="text-sm uppercase tracking-[0.35em] text-[#5B3418]">Conta</p>
                    <h1 className="mt-4 text-4xl font-semibold text-[#5B3418] md:text-5xl">Meu perfil</h1>
                    <p className="mt-3 text-sm leading-7 text-[#7A4A2A]">Gerencie seus dados e preferências da Brasa Branca.</p>
                </div>

                {sucesso ? <div className="flex items-center gap-2 rounded-2xl border border-emerald-500/25 bg-emerald-50/75 px-4 py-3 text-sm text-emerald-700"><CheckCircle2 size={17} /> {sucesso}</div> : null}
                {carregando ? <div className="rounded-3xl border border-[#8B4513]/18 bg-[#FAF3E7]/72 p-8 text-[#7A4A2A]">Carregando perfil...</div> : null}

                <section className="relative overflow-hidden rounded-[2rem] bg-[linear-gradient(135deg,#3a2117,#8e4b23)] p-6 text-[#FFF8EF] shadow-[0_22px_65px_rgba(76,39,17,0.2)] md:p-8">
                    <div className="absolute -right-24 -top-32 h-72 w-72 rounded-full border border-white/10" />
                    <div className="absolute -bottom-40 left-1/3 h-72 w-72 rounded-full border border-white/10" />
                    <div className="relative flex flex-col items-start gap-6 md:flex-row md:items-center">
                        <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full border-4 border-[#F8D9A0]/40 bg-[#F8D9A0] text-3xl font-bold text-[#5B3418]">{iniciais(perfil?.nome)}</div>
                        <div className="min-w-0 flex-1">
                            <p className="text-xs uppercase tracking-[0.25em] text-[#F8D9A0]/75">{administrador ? "Área administrativa" : "Cliente Brasa Branca"}</p>
                            <h2 className="mt-2 truncate text-3xl font-semibold">{perfil?.nome || user?.nome}</h2>
                            <p className="mt-2 flex items-center gap-2 text-sm text-[#FFF8EF]/75"><Mail size={15} /> {perfil?.email || user?.email}</p>
                        </div>
                        <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em]">{administrador ? "Funcionário" : "Cliente"}</span>
                    </div>
                </section>

                <div className="grid gap-5">
                    <section className="rounded-3xl border border-[#8B4513]/18 bg-[#FAF3E7]/72 p-6 shadow-[0_18px_60px_rgba(91,52,24,0.08)]">
                        <div className="flex items-start justify-between gap-4"><div><p className="text-xs uppercase tracking-[0.22em] text-[#9B8069]">Dados pessoais</p><h2 className="mt-2 text-xl font-semibold text-[#5B3418]">Informações da conta</h2></div><UserRound className="text-[#8B4513]" size={22} /></div>
                        <div className="mt-6 space-y-4 text-sm"><div><p className="text-xs uppercase tracking-[0.15em] text-[#A0846B]">Nome</p><p className="mt-1 font-medium text-[#5B3418]">{perfil?.nome}</p></div><div><p className="text-xs uppercase tracking-[0.15em] text-[#A0846B]">E-mail</p><p className="mt-1 font-medium text-[#5B3418]">{perfil?.email}</p></div>{!administrador ? <div><p className="text-xs uppercase tracking-[0.15em] text-[#A0846B]">Endereço</p><p className="mt-1 leading-6 font-medium text-[#5B3418]">{textoEndereco(perfil?.endereco)}</p></div> : null}</div>
                        <button type="button" onClick={abrirModal} className="mt-7 inline-flex items-center gap-2 rounded-full border border-[#8B4513]/25 px-4 py-2.5 text-sm font-semibold text-[#5B3418] transition hover:bg-[#8B4513]/10"><Edit3 size={15} /> Editar dados</button>
                    </section>

                </div>

            </div>

            {modalAberto ? (
                <div className="fixed inset-0 z-[120] flex items-end justify-center bg-[#29170d]/65 p-0 backdrop-blur-sm sm:items-center sm:p-5">
                    <section role="dialog" aria-modal="true" className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-t-[2rem] bg-[#FBF5ED] p-6 shadow-[0_28px_90px_rgba(49,24,8,0.32)] sm:rounded-[2rem] md:p-8">
                        <div className="flex items-start justify-between gap-4"><div><p className="text-xs uppercase tracking-[0.25em] text-[#9B8069]">Meu perfil</p><h2 className="mt-2 text-2xl font-semibold text-[#4C2A17]">Editar dados</h2></div><button type="button" onClick={() => setModalAberto(false)} className="rounded-full p-2 text-[#7A5A43] hover:bg-[#8B4513]/10"><X size={20} /></button></div>
                        {erro ? <p className="mt-5 rounded-xl border border-red-400/30 bg-red-50/70 px-4 py-3 text-sm text-red-700">{erro}</p> : null}
                        <form onSubmit={handleSubmit} className="mt-7 grid gap-4">
                            {!administrador ? <>
                            <div className="border-t border-[#8B4513]/12 pt-4"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9B8069]">Endereço de entrega</p></div>
                            <label><span className="mb-2 flex items-center justify-between gap-3 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#6F513B]"><span>CEP</span>{consultandoCep ? <span className="normal-case tracking-normal text-[#9B8069]">Consultando endereço...</span> : null}</span><input value={form.endereco.cep} onChange={(event) => setForm((current) => ({ ...current, endereco: { ...current.endereco, cep: formatarCep(event.target.value) } }))} inputMode="numeric" maxLength={9} placeholder="00000-000" className="w-full rounded-xl border border-[#8B4513]/18 bg-white/75 px-4 py-3 text-sm text-[#3F2415] outline-none focus:border-[#8B4513]/60" /></label>
                            <label><span className="mb-2 block text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#6F513B]">Rua</span><input value={form.endereco.rua} onChange={(event) => setForm((current) => ({ ...current, endereco: { ...current.endereco, rua: event.target.value } }))} placeholder="Nome da rua ou avenida" className="w-full rounded-xl border border-[#8B4513]/18 bg-white/75 px-4 py-3 text-sm text-[#3F2415] outline-none focus:border-[#8B4513]/60" /></label>
                            <div className="grid grid-cols-2 gap-4">
                                <label><span className="mb-2 block text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#6F513B]">Número</span><input value={form.endereco.numero} onChange={(event) => setForm((current) => ({ ...current, endereco: { ...current.endereco, numero: event.target.value } }))} placeholder="123" className="w-full rounded-xl border border-[#8B4513]/18 bg-white/75 px-4 py-3 text-sm text-[#3F2415] outline-none focus:border-[#8B4513]/60" /></label>
                                <label><span className="mb-2 block text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#6F513B]">Complemento</span><input value={form.endereco.complemento} onChange={(event) => setForm((current) => ({ ...current, endereco: { ...current.endereco, complemento: event.target.value } }))} placeholder="Apto, casa..." className="w-full rounded-xl border border-[#8B4513]/18 bg-white/75 px-4 py-3 text-sm text-[#3F2415] outline-none focus:border-[#8B4513]/60" /></label>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <label><span className="mb-2 block text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#6F513B]">Bairro</span><input value={form.endereco.bairro} onChange={(event) => setForm((current) => ({ ...current, endereco: { ...current.endereco, bairro: event.target.value } }))} placeholder="Seu bairro" className="w-full rounded-xl border border-[#8B4513]/18 bg-white/75 px-4 py-3 text-sm text-[#3F2415] outline-none focus:border-[#8B4513]/60" /></label>
                                <label><span className="mb-2 block text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#6F513B]">Cidade</span><input value={form.endereco.cidade} onChange={(event) => setForm((current) => ({ ...current, endereco: { ...current.endereco, cidade: event.target.value } }))} placeholder="Sua cidade" className="w-full rounded-xl border border-[#8B4513]/18 bg-white/75 px-4 py-3 text-sm text-[#3F2415] outline-none focus:border-[#8B4513]/60" /></label>
                            </div>
                            <label><span className="mb-2 block text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#6F513B]">Estado</span><input value={form.endereco.estado} onChange={(event) => setForm((current) => ({ ...current, endereco: { ...current.endereco, estado: event.target.value.toUpperCase().slice(0, 2) } }))} maxLength={2} placeholder="SP" className="w-full rounded-xl border border-[#8B4513]/18 bg-white/75 px-4 py-3 text-sm text-[#3F2415] outline-none focus:border-[#8B4513]/60" /></label>
                            </> : null}
                            <label><span className="mb-2 block text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#6F513B]">Nome completo</span><input required minLength={2} value={form.nome} onChange={(event) => setForm((current) => ({ ...current, nome: event.target.value }))} className="w-full rounded-xl border border-[#8B4513]/18 bg-white/75 px-4 py-3 text-sm text-[#3F2415] outline-none focus:border-[#8B4513]/60" /></label>
                            <label><span className="mb-2 block text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#6F513B]">E-mail</span><input required type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} className="w-full rounded-xl border border-[#8B4513]/18 bg-white/75 px-4 py-3 text-sm text-[#3F2415] outline-none focus:border-[#8B4513]/60" /></label>
                            <button type="submit" disabled={salvando} className="mt-3 rounded-xl bg-[#5B3418] px-5 py-3.5 text-sm font-semibold text-[#FFF8EF] transition hover:bg-[#7A401E] disabled:opacity-60">{salvando ? "Salvando..." : "Salvar alterações"}</button>
                        </form>
                    </section>
                </div>
            ) : null}
        </main>
    );
}
