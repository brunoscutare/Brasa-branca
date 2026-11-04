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
    return <div className="flex items-center gap-1" aria-label={`${nota} de 5 estrelas`}>{[1, 2, 3, 4, 5].map((estrela) => <Star key={estrela} size={tamanho} fill={estrela <= nota ? "#D98C3F" : "transparent"} className={estrela <= nota ? "text-[#D98C3F]" : "text-[#B99B80]"} />)}</div>;
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
        <main className="min-h-screen px-6 pb-16 pt-28 text-[#6F370F] md:px-10">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
                <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-sm uppercase tracking-[0.35em] text-[#5B3418]">Gestão do sistema</p><h1 className="mt-4 text-4xl font-semibold text-[#5B3418] md:text-5xl">Avaliações</h1><p className="mt-3 text-sm leading-7 text-[#7A4A2A]">Veja o que os clientes estão achando dos pedidos.</p></div><div className="flex items-center gap-3 rounded-2xl border border-[#8B4513]/15 bg-[#FAF3E7]/72 px-4 py-3"><Star size={19} className="text-[#D98C3F]" fill="#D98C3F" /><span className="text-sm font-semibold text-[#5B3418]">{media.toFixed(1).replace(".", ",")} média</span></div></div>
                {carregando ? <div className="rounded-3xl border border-[#8B4513]/18 bg-[#FAF3E7]/72 p-8 text-[#7A4A2A]">Carregando avaliações...</div> : null}
                {erro ? <div className="rounded-3xl border border-red-400/30 bg-red-50/70 p-5 text-sm text-red-700">{erro}</div> : null}
                {!carregando && !erro ? <><div className="grid gap-4 md:grid-cols-3"><div className="rounded-3xl border border-[#8B4513]/15 bg-[#FAF3E7]/72 p-5"><p className="text-xs uppercase tracking-[0.18em] text-[#9B8069]">Avaliações recebidas</p><p className="mt-3 text-3xl font-semibold text-[#5B3418]">{avaliacoes.length}</p></div><div className="rounded-3xl border border-[#8B4513]/15 bg-[#FAF3E7]/72 p-5"><p className="text-xs uppercase tracking-[0.18em] text-[#9B8069]">Nota média</p><div className="mt-3 flex items-center gap-3"><p className="text-3xl font-semibold text-[#5B3418]">{media.toFixed(1).replace(".", ",")}</p><Estrelas nota={Math.round(media)} /></div></div><div className="rounded-3xl border border-[#8B4513]/15 bg-[#FAF3E7]/72 p-5"><p className="text-xs uppercase tracking-[0.18em] text-[#9B8069]">Clientes avaliando</p><p className="mt-3 flex items-center gap-2 text-3xl font-semibold text-[#5B3418]"><Users size={25} className="text-[#8B4513]" />{new Set(avaliacoes.map((avaliacao) => avaliacao.usuario_id)).size}</p></div></div><div className="relative"><Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#A0846B]" size={18} /><input value={busca} onChange={(event) => setBusca(event.target.value)} placeholder="Buscar por cliente, comentário ou pedido" className="w-full rounded-2xl border border-[#8B4513]/18 bg-[#FAF3E7]/72 py-3.5 pl-11 pr-4 text-sm text-[#3F2415] outline-none transition placeholder:text-[#B8A18C] focus:border-[#8B4513]/60 focus:bg-[#FFF8EF]" /></div><div className="grid gap-4">{filtradas.map((avaliacao) => <article key={avaliacao.id} role="button" tabIndex={0} onClick={() => navigate("/pedidos", { state: { abrirPedidoId: avaliacao.pedido_id } })} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") navigate("/pedidos", { state: { abrirPedidoId: avaliacao.pedido_id } }); }} className="cursor-pointer rounded-3xl border border-[#8B4513]/18 bg-[#FAF3E7]/72 p-5 shadow-[0_18px_60px_rgba(91,52,24,0.08)] transition hover:-translate-y-0.5 hover:bg-[#FAF3E7]/90"><div className="flex flex-col justify-between gap-4 md:flex-row md:items-start"><div><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#5B3418] text-[#F8D9A0]"><MessageSquareText size={18} /></span><div><h2 className="font-semibold text-[#5B3418]">{avaliacao.usuario_nome}</h2><p className="mt-1 text-xs text-[#80634D]">{avaliacao.usuario_email}</p></div></div><div className="mt-4 flex items-center gap-3"><Estrelas nota={avaliacao.nota} /><span className="text-xs font-semibold text-[#8B4513]">{avaliacao.nota}/5</span></div></div><div className="flex items-start gap-4 text-left text-xs text-[#8D7159] md:text-right"><div><p className="flex items-center gap-2 md:justify-end"><ShoppingBag size={14} /> Pedido #{avaliacao.pedido_id}</p><p className="mt-2">{formatarData(avaliacao.criado_em)} · {formatarPreco(avaliacao.pedido_total)}</p></div><a href={`mailto:${avaliacao.usuario_email}?subject=${encodeURIComponent(`Sobre seu pedido #${avaliacao.pedido_id}`)}`} onClick={(event) => event.stopPropagation()} className="inline-flex items-center gap-2 rounded-xl border border-[#8B4513]/25 px-3 py-2 text-xs font-semibold text-[#5B3418] transition hover:bg-[#8B4513]/10" title="Enviar e-mail ao cliente"><Mail size={15} /> E-mail</a></div></div><p className="mt-5 border-t border-[#8B4513]/12 pt-4 text-sm leading-7 text-[#5B3418]">{avaliacao.comentario || "O cliente não deixou um comentário."}</p></article>)}</div>{filtradas.length === 0 ? <div className="rounded-3xl border border-[#8B4513]/18 bg-[#FAF3E7]/72 px-8 py-12 text-center text-sm text-[#7A4A2A]">Nenhuma avaliação encontrada.</div> : null}</> : null}
            </div>
        </main>
    );
}
