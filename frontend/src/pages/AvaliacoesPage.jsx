import { useEffect, useMemo, useState } from "react";
import { Mail, MessageSquareText, Search, ShoppingBag, Star, Users } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { listarAvaliacoes } from "../services/PedidoService";

function formatarPreco(valor) {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(valor || 0));
}

function formatarData(valor) {
    if (!valor) return "";
    return new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(valor));
}

function Estrelas({ nota, tamanho = 18 }) {
    return <div className="flex items-center gap-1" aria-label={`${nota} de 5 estrelas`}>{[1, 2, 3, 4, 5].map((estrela) => <Star key={estrela} size={tamanho} fill={estrela <= nota ? "var(--color-brand-accent)" : "transparent"} className={estrela <= nota ? "text-brand-accent" : "text-brand-placeholder"} />)}</div>;
}

export default function AvaliacoesPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [avaliacoes, setAvaliacoes] = useState([]);
    const [busca, setBusca] = useState("");
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");

    useEffect(() => {
        let ativo = true;
        listarAvaliacoes()
            .then((data) => { if (ativo) setAvaliacoes(data); })
            .catch((error) => { if (ativo) setErro(error.message || "Erro ao carregar as avaliações."); })
            .finally(() => { if (ativo) setCarregando(false); });
        return () => { ativo = false; };
    }, []);

    useEffect(() => {
        const avaliacaoId = Number(location.state?.abrirAvaliacaoId || 0);
        if (!avaliacaoId || !avaliacoes.length) return;

        const indice = avaliacoes.findIndex((avaliacao) => Number(avaliacao.id) === avaliacaoId);
        requestAnimationFrame(() => {
            document.querySelectorAll("article[role='button']")[indice]?.scrollIntoView({ behavior: "smooth", block: "center" });
        });
        navigate(location.pathname, { replace: true, state: {} });
    }, [avaliacoes, location.pathname, location.state, navigate]);

    const filtradas = useMemo(() => {
        const termo = busca.trim().toLowerCase();
        if (!termo) return avaliacoes;
        return avaliacoes.filter((avaliacao) => `${avaliacao.usuario_nome} ${avaliacao.usuario_email} ${avaliacao.comentario || ""} ${avaliacao.pedido_id}`.toLowerCase().includes(termo));
    }, [avaliacoes, busca]);

    const media = avaliacoes.length ? avaliacoes.reduce((total, avaliacao) => total + avaliacao.nota, 0) / avaliacoes.length : 0;

    return (
        <main className="min-h-screen px-6 pb-16 pt-28 text-brand-primary md:px-10">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
                <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-sm uppercase tracking-[0.35em] text-brand-primary">Gestão do sistema</p><h1 className="mt-4 text-4xl font-semibold text-brand-primary md:text-5xl">Avaliações</h1><p className="mt-3 text-sm leading-7 text-brand-text">Veja o que os clientes estão achando dos pedidos.</p></div><div className="flex items-center gap-3 rounded-2xl border border-brand-border bg-brand-surface px-4 py-3"><Star size={19} className="text-brand-accent" fill="var(--color-brand-accent)" /><span className="text-sm font-semibold text-brand-primary">{media.toFixed(1).replace(".", ",")} média</span></div></div>
                {carregando ? <div className="rounded-3xl border border-brand-border bg-brand-surface p-8 text-brand-text">Carregando avaliações...</div> : null}
                {erro ? <div className="rounded-3xl border border-red-400/30 bg-red-50/70 p-5 text-sm text-red-700">{erro}</div> : null}
                {!carregando && !erro ? <><div className="grid gap-4 md:grid-cols-3"><div className="rounded-3xl border border-brand-border bg-brand-surface p-5"><p className="text-xs uppercase tracking-[0.18em] text-brand-muted">Avaliações recebidas</p><p className="mt-3 text-3xl font-semibold text-brand-primary">{avaliacoes.length}</p></div><div className="rounded-3xl border border-brand-border bg-brand-surface p-5"><p className="text-xs uppercase tracking-[0.18em] text-brand-muted">Nota média</p><div className="mt-3 flex items-center gap-3"><p className="text-3xl font-semibold text-brand-primary">{media.toFixed(1).replace(".", ",")}</p><Estrelas nota={Math.round(media)} /></div></div><div className="rounded-3xl border border-brand-border bg-brand-surface p-5"><p className="text-xs uppercase tracking-[0.18em] text-brand-muted">Clientes avaliando</p><p className="mt-3 flex items-center gap-2 text-3xl font-semibold text-brand-primary"><Users size={25} className="text-brand-primary" />{new Set(avaliacoes.map((avaliacao) => avaliacao.usuario_id)).size}</p></div></div><div className="relative"><Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted" size={18} /><input value={busca} onChange={(event) => setBusca(event.target.value)} placeholder="Buscar por cliente, comentário ou pedido" className="w-full rounded-2xl border border-brand-border bg-brand-surface py-3.5 pl-11 pr-4 text-sm text-brand-ink outline-none transition placeholder:text-brand-placeholder focus:border-brand-accent focus:bg-brand-surface" /></div><div className="grid gap-4">{filtradas.map((avaliacao) => <article key={avaliacao.id} role="button" tabIndex={0} onClick={() => navigate("/pedidos", { state: { abrirPedidoId: avaliacao.pedido_id } })} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") navigate("/pedidos", { state: { abrirPedidoId: avaliacao.pedido_id } }); }} className="cursor-pointer rounded-3xl border border-brand-border bg-brand-surface p-5 shadow-[0_18px_60px_rgba(91,52,24,0.08)] transition hover:-translate-y-0.5 hover:bg-brand-surface"><div className="flex flex-col justify-between gap-4 md:flex-row md:items-start"><div><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary text-brand-cream"><MessageSquareText size={18} /></span><div><h2 className="font-semibold text-brand-primary">{avaliacao.usuario_nome}</h2><p className="mt-1 text-xs text-brand-text">{avaliacao.usuario_email}</p></div></div><div className="mt-4 flex items-center gap-3"><Estrelas nota={avaliacao.nota} /><span className="text-xs font-semibold text-brand-primary">{avaliacao.nota}/5</span></div></div><div className="flex items-start gap-4 text-left text-xs text-brand-text md:text-right"><div><p className="flex items-center gap-2 md:justify-end"><ShoppingBag size={14} /> Pedido #{avaliacao.pedido_id}</p><p className="mt-2">{formatarData(avaliacao.criado_em)} · {formatarPreco(avaliacao.pedido_total)}</p></div><a href={`mailto:${avaliacao.usuario_email}?subject=${encodeURIComponent(`Sobre seu pedido #${avaliacao.pedido_id}`)}`} onClick={(event) => event.stopPropagation()} className="inline-flex items-center gap-2 rounded-xl border border-brand-border px-3 py-2 text-xs font-semibold text-brand-primary transition hover:bg-brand-primary/10" title="Enviar e-mail ao cliente"><Mail size={15} /> E-mail</a></div></div><p className="mt-5 border-t border-brand-border pt-4 text-sm leading-7 text-brand-primary">{avaliacao.comentario || "O cliente não deixou um comentário."}</p></article>)}</div>{filtradas.length === 0 ? <div className="rounded-3xl border border-brand-border bg-brand-surface px-8 py-12 text-center text-sm text-brand-text">Nenhuma avaliação encontrada.</div> : null}</> : null}
            </div>
        </main>
    );
}
