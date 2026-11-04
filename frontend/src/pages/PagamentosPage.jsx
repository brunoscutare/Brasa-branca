import { useCallback, useEffect, useState } from "react";
import { CreditCard, Pencil, Plus, ShieldCheck, Trash2, X } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { atualizarCartao, listarCartoes, removerCartao, salvarCartao } from "../services/CartaoService";

function formatarNumero(valor) {
    return valor.replace(/\D/g, "").slice(0, 19).replace(/(.{4})/g, "$1 ").trim();
}

function BrandMark({ brand }) {
    if (brand === "mastercard") return <span className="font-black tracking-[-0.08em]">mastercard</span>;
    if (brand === "amex") return <span className="text-xs font-black tracking-[-0.06em]">AMERICAN EXPRESS</span>;
    return <span className="font-black italic">{brand}</span>;
}

const vazio = { bandeira: "visa", numero: "", nome: "", validade: "" };
const BRAND_OPTIONS = [
    { id: "visa", name: "Visa", detail: "Crédito e débito", tone: "border-brand-border bg-brand-surface text-brand-primary" },
    { id: "mastercard", name: "Mastercard", detail: "Crédito e débito", tone: "border-brand-border bg-brand-surface text-brand-primary" },
    { id: "elo", name: "Elo", detail: "Crédito e débito", tone: "border-brand-border bg-brand-surface text-brand-primary" },
    { id: "amex", name: "American Express", detail: "Crédito", tone: "border-brand-border bg-brand-surface text-brand-primary" }
];

export default function PagamentosPage() {
    const { user } = useAuth();
    const [cartoes, setCartoes] = useState([]);
    const [form, setForm] = useState(vazio);
    const [editando, setEditando] = useState(null);
    const [aberto, setAberto] = useState(false);
    const [carregando, setCarregando] = useState(true);
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState("");
    const [cartaoSelecionado, setCartaoSelecionado] = useState(null);

    const carregar = useCallback(async () => {
        try {
            setCarregando(true);
            setErro("");
            setCartoes(await listarCartoes(user.id));
        } catch (error) {
            setErro(error.message || "Erro ao carregar cartões.");
        } finally {
            setCarregando(false);
        }
    }, [user.id]);

    useEffect(() => { carregar(); }, [carregar]);

    const abrirNovo = () => {
        setEditando(null);
        setForm(vazio);
        setErro("");
        setAberto(true);
    };

    const abrirEdicao = (cartao) => {
        setCartaoSelecionado(null);
        setEditando(cartao.id);
        setForm({ bandeira: cartao.bandeira, numero: "", nome: cartao.nome, validade: cartao.validade });
        setErro("");
        setAberto(true);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSalvando(true);
        setErro("");

        try {
            if (editando) {
                await atualizarCartao(user.id, editando, { nome: form.nome, validade: form.validade });
            } else {
                await salvarCartao(user.id, form);
            }
            setAberto(false);
            await carregar();
        } catch (error) {
            setErro(error.message || "Não foi possível salvar o cartão.");
        } finally {
            setSalvando(false);
        }
    };

    const handleRemove = async (cartao) => {
        if (!window.confirm(`Remover o cartão ${cartao.bandeira} •••• ${cartao.ultimos_digitos}?`)) return;
        try {
            await removerCartao(user.id, cartao.id);
            setCartoes((current) => current.filter((item) => item.id !== cartao.id));
            setCartaoSelecionado(null);
        } catch (error) {
            setErro(error.message || "Não foi possível remover o cartão.");
        }
    };

    return (
        <main className="min-h-screen px-6 pb-16 pt-28 text-brand-primary md:px-10">
            <div className="mx-auto flex w-full max-w-5xl flex-col gap-10">
                <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
                    <div>
                        <p className="text-sm uppercase tracking-[0.35em] text-brand-primary">Carteira</p>
                        <h1 className="mt-4 text-4xl font-semibold text-brand-primary md:text-5xl">Pagamentos</h1>
                        <p className="mt-3 max-w-2xl text-sm leading-7 text-brand-text">Gerencie seus cartões para finalizar pedidos com mais rapidez.</p>
                    </div>
                    <button type="button" onClick={abrirNovo} className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-primary px-5 py-3 text-sm font-semibold text-brand-surface transition hover:bg-brand-ink"><Plus size={17} /> Adicionar cartão</button>
                </div>

                <div className="flex items-start gap-3 rounded-3xl border border-brand-border bg-brand-surface p-5 text-sm leading-6 text-brand-text">
                    <ShieldCheck size={20} className="mt-0.5 shrink-0 text-brand-primary" />
                    <p>Seus dados de cartão são protegidos no banco. O número completo e o código de segurança não ficam armazenados.</p>
                </div>

                {erro ? <div className="rounded-2xl border border-brand-danger/30 bg-brand-danger-surface p-4 text-sm text-brand-danger">{erro}</div> : null}
                {carregando ? <div className="rounded-3xl border border-brand-border bg-brand-surface p-8 text-brand-text">Carregando cartões...</div> : null}

                {!carregando && cartoes.length === 0 ? <div className="rounded-3xl border border-brand-border bg-brand-surface px-8 py-14 text-center"><CreditCard className="mx-auto text-brand-primary" size={36} strokeWidth={1.5} /><h2 className="mt-5 text-xl font-semibold text-brand-primary">Nenhum cartão salvo</h2><p className="mt-2 text-sm text-brand-text">Adicione um cartão para agilizar seu próximo pedido.</p></div> : null}

                <div className="mx-auto grid w-full max-w-[900px] grid-cols-1 gap-7 md:grid-cols-2">
                    {cartoes.map((cartao) => (
                        <button
                            type="button"
                            key={cartao.id}
                            onClick={() => setCartaoSelecionado(cartao)}
                            className="group mx-auto w-full max-w-[420px] text-left"
                        >
                            <div className="relative flex aspect-[1.75] flex-col rounded-2xl bg-brand-ink p-6 text-brand-surface shadow-[0_14px_30px_rgba(61,35,21,0.2)] transition duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_20px_38px_rgba(61,35,21,0.28)]">
                                <div className="flex items-start justify-between"><CreditCard size={24} /><BrandMark brand={cartao.bandeira} /></div>
                                <p className="mt-auto pt-10 font-mono text-lg tracking-[0.18em] md:text-xl">•••• •••• •••• {cartao.ultimos_digitos}</p>
                                <div className="mt-5 flex items-end justify-between gap-4 text-[0.62rem] uppercase tracking-[0.14em] text-brand-on-dark-muted"><span className="min-w-0 truncate">{cartao.nome}</span><span className="shrink-0">{cartao.validade}</span></div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {cartaoSelecionado ? (
                <div className="fixed inset-0 z-[120] flex items-end justify-center bg-brand-ink/60 p-0 backdrop-blur-sm sm:items-center sm:p-5" onMouseDown={(event) => { if (event.target === event.currentTarget) setCartaoSelecionado(null); }}>
                    <section role="dialog" aria-modal="true" className="w-full max-w-md rounded-t-[2rem] bg-brand-surface p-6 shadow-[0_28px_90px_rgba(61,35,21,0.32)] sm:rounded-[2rem] md:p-8">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-xs uppercase tracking-[0.25em] text-brand-muted">Cartão selecionado</p>
                                <h2 className="mt-2 text-2xl font-semibold text-brand-ink">O que deseja fazer?</h2>
                                <p className="mt-2 text-sm text-brand-text">{cartaoSelecionado.bandeira} •••• {cartaoSelecionado.ultimos_digitos}</p>
                            </div>
                            <button type="button" onClick={() => setCartaoSelecionado(null)} className="rounded-full p-2 text-brand-text hover:bg-brand-primary/10"><X size={20} /></button>
                        </div>
                        <div className="mt-7 grid gap-3">
                            <button type="button" onClick={() => abrirEdicao(cartaoSelecionado)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-brand-border bg-brand-surface px-5 py-3.5 text-sm font-semibold text-brand-primary transition hover:border-brand-accent hover:bg-brand-surface"><Pencil size={17} /> Editar cartão</button>
                            <button type="button" onClick={() => handleRemove(cartaoSelecionado)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-brand-danger/50 bg-brand-danger-surface px-5 py-3.5 text-sm font-semibold text-brand-danger transition hover:bg-brand-danger-surface"><Trash2 size={17} /> Remover cartão</button>
                        </div>
                    </section>
                </div>
            ) : null}

            {aberto ? (
                <div className="fixed inset-0 z-[120] flex items-end justify-center bg-brand-ink/60 p-0 backdrop-blur-sm sm:items-center sm:p-5">
                    <section role="dialog" aria-modal="true" className="w-full max-w-xl rounded-t-[2rem] bg-brand-surface p-6 shadow-[0_28px_90px_rgba(61,35,21,0.32)] sm:rounded-[2rem] md:p-8">
                        <div className="flex items-center justify-between"><div><p className="text-xs uppercase tracking-[0.25em] text-brand-muted">Carteira</p><h2 className="mt-2 text-2xl font-semibold text-brand-ink">{editando ? "Editar cartão" : "Adicionar cartão"}</h2></div><button type="button" onClick={() => setAberto(false)} className="rounded-full p-2 text-brand-text hover:bg-brand-primary/10"><X size={20} /></button></div>
                        <form onSubmit={handleSubmit} className="mt-7 grid gap-4" autoComplete="off">
                            {!editando ? (
                                <div>
                                    <span className="mb-2 block text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-brand-text">Bandeira</span>
                                    <div className="grid grid-cols-2 gap-3">
                                        {BRAND_OPTIONS.map((brand) => {
                                            const selecionada = form.bandeira === brand.id;
                                            return (
                                                <button
                                                    type="button"
                                                    key={brand.id}
                                                    onClick={() => setForm((current) => ({ ...current, bandeira: brand.id }))}
                                                    className={`flex items-center justify-between gap-3 rounded-xl border p-3 text-left transition hover:-translate-y-0.5 ${selecionada ? "border-brand-border shadow-[0_8px_18px_rgba(61,35,21,0.12)]" : "hover:border-brand-accent"} ${brand.tone}`}
                                                >
                                                    <span>
                                                        <span className="flex h-7 items-center"><BrandMark brand={brand.id} /></span>
                                                        <span className="mt-1 block text-[0.68rem] opacity-70">{brand.detail}</span>
                                                    </span>
                                                    <span className={`h-4 w-4 rounded-full border ${selecionada ? "border-brand-border bg-brand-primary" : "border-current/25"}`} />
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ) : null}
                            {!editando ? <label className="block"><span className="mb-2 block text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-brand-text">Número do cartão</span><input required value={form.numero} onChange={(event) => setForm((current) => ({ ...current, numero: formatarNumero(event.target.value) }))} inputMode="numeric" autoComplete="new-password" maxLength={23} placeholder="0000 0000 0000 0000" className="w-full rounded-xl border border-brand-border bg-brand-field px-4 py-3 text-sm text-brand-ink outline-none focus:border-brand-accent" /></label> : null}
                            <label className="block"><span className="mb-2 block text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-brand-text">Nome no cartão</span><input required value={form.nome} onChange={(event) => setForm((current) => ({ ...current, nome: event.target.value.toUpperCase().slice(0, 40) }))} autoComplete="new-password" placeholder="Como aparece no cartão" className="w-full rounded-xl border border-brand-border bg-brand-field px-4 py-3 text-sm text-brand-ink outline-none focus:border-brand-accent" /></label>
                            <label className="block"><span className="mb-2 block text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-brand-text">Validade</span><input required value={form.validade} onChange={(event) => setForm((current) => ({ ...current, validade: event.target.value.replace(/\D/g, "").slice(0, 4).replace(/^(\d{2})(\d)/, "$1/$2") }))} inputMode="numeric" autoComplete="new-password" maxLength={5} placeholder="MM/AA" className="w-full rounded-xl border border-brand-border bg-brand-field px-4 py-3 text-sm text-brand-ink outline-none focus:border-brand-accent" /></label>
                            <button type="submit" disabled={salvando} className="mt-3 rounded-xl bg-brand-primary px-5 py-3.5 text-sm font-semibold text-brand-surface transition hover:bg-brand-ink disabled:opacity-60">{salvando ? "Salvando..." : editando ? "Salvar alterações" : "Salvar cartão"}</button>
                        </form>
                    </section>
                </div>
            ) : null}
        </main>
    );
}
