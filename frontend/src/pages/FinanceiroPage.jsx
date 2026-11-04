import { useEffect, useMemo, useState } from "react";
import {
    ArrowUpRight,
    CircleDollarSign,
    ReceiptText,
    Search,
    TrendingUp,
    Users
} from "lucide-react";
import { buscarFinanceiro } from "../services/PedidoService";

const moeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

function formatarPreco(valor) {
    return moeda.format(Number(valor || 0));
}

function formatarData(valor) {
    if (!valor) return "—";
    return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(valor));
}

function formatarMes(valor) {
    if (!valor) return "—";
    const [ano, mes] = String(valor).split("-").map(Number);
    if (!ano || !mes) return valor;
    return new Intl.DateTimeFormat("pt-BR", { month: "short" })
        .format(new Date(ano, mes - 1, 1))
        .replace(".", "");
}

function statusDoPedido(status) {
    return {
        indo_ate_voce: "Indo até você",
        recebido: "Recebido"
    }[status] || status || "Processando";
}

function formatarEixo(valor) {
    const numero = Number(valor || 0);
    if (numero >= 1000) return `R$ ${(numero / 1000).toFixed(1).replace(".", ",")}k`;
    return `R$ ${Math.round(numero)}`;
}

function GraficoFaturamento({ meses }) {
    const largura = 760;
    const altura = 286;
    const margem = { topo: 18, direita: 20, baixo: 44, esquerda: 76 };
    const larguraGrafico = largura - margem.esquerda - margem.direita;
    const alturaGrafico = altura - margem.topo - margem.baixo;
    const maiorValor = Math.max(...meses.map((mes) => Number(mes.faturamento || 0)), 1);
    const larguraBarra = Math.min(76, Math.max(38, (larguraGrafico / Math.max(meses.length, 1)) * 0.56));
    const barras = meses.map((mes, indice) => {
        const valor = Number(mes.faturamento || 0);
        const x = margem.esquerda + ((indice + 0.5) / Math.max(meses.length, 1)) * larguraGrafico - larguraBarra / 2;
        const alturaBarra = Math.max(valor > 0 ? 8 : 2, (valor / maiorValor) * alturaGrafico);
        return { ...mes, x, y: margem.topo + alturaGrafico - alturaBarra, altura: alturaBarra, valor };
    });
    const base = margem.topo + alturaGrafico;
    const linhasDeGuia = [0, 1, 2, 3, 4].map((indice) => ({
        y: margem.topo + (alturaGrafico / 4) * indice,
        valor: maiorValor - (maiorValor / 4) * indice
    }));

    if (!meses.length) {
        return <div className="mt-8 flex min-h-72 items-center justify-center rounded-2xl bg-[#F4E6D7] text-sm text-[#80634D]">Ainda não há dados mensais.</div>;
    }

    return (
        <div className="mt-8 rounded-2xl border border-[#8B4513]/10 bg-[#F4E6D7] p-3 md:p-5">
            <div className="mb-2 flex items-center justify-between px-2">
                <span className="text-xs text-[#9B8069]">Faturamento</span>
                <span className="rounded-full bg-[#5B3418] px-3 py-1 text-xs font-semibold text-[#FFF8EF]">{formatarPreco(barras[barras.length - 1].valor)}</span>
            </div>
            <svg className="h-auto w-full" viewBox={`0 0 ${largura} ${altura}`} role="img" aria-label="Gráfico de faturamento por mês">
                <defs>
                    <linearGradient id="financeiro-barras" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#9B5420" />
                        <stop offset="100%" stopColor="#5B3418" />
                    </linearGradient>
                </defs>
                {linhasDeGuia.map((guia) => <g key={guia.y}><line x1={margem.esquerda} x2={largura - margem.direita} y1={guia.y} y2={guia.y} stroke="#8B4513" strokeOpacity="0.14" strokeDasharray="4 7" /><text x="0" y={guia.y + 4} fill="#9B8069" fontSize="11">{formatarEixo(guia.valor)}</text></g>)}
                <line x1={margem.esquerda} x2={largura - margem.direita} y1={base} y2={base} stroke="#8B4513" strokeOpacity="0.24" />
                {barras.map((barra) => <g key={barra.mes}><rect x={barra.x} y={barra.y} width={larguraBarra} height={barra.altura} rx="10" fill="url(#financeiro-barras)" /><text x={barra.x + larguraBarra / 2} y={Math.max(margem.topo + 12, barra.y - 8)} textAnchor="middle" fill="#5B3418" fontSize="11" fontWeight="600">{formatarEixo(barra.valor)}</text><text x={barra.x + larguraBarra / 2} y={altura - 12} textAnchor="middle" fill="#80634D" fontSize="11">{formatarMes(barra.mes)}</text></g>)}
            </svg>
        </div>
    );
}

function CartaoResumo({ rotulo, valor, detalhe, icone: Icon }) {
    return (
        <article className="rounded-3xl border border-[#8B4513]/15 bg-[#FAF3E7] p-5 shadow-[0_18px_60px_rgba(91,52,24,0.07)]">
            <div className="flex items-center justify-between gap-4">
                <p className="text-xs uppercase tracking-[0.18em] text-[#9B8069]">{rotulo}</p>
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#5B3418] text-[#F8D9A0]"><Icon size={19} /></span>
            </div>
            <p className="mt-5 text-3xl font-semibold text-[#5B3418]">{valor}</p>
            <p className="mt-2 text-sm text-[#80634D]">{detalhe}</p>
        </article>
    );
}

export default function FinanceiroPage() {
    const [dados, setDados] = useState({ resumo: {}, porMes: [], pedidosRecentes: [] });
    const [busca, setBusca] = useState("");
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");

    useEffect(() => {
        let ativo = true;
        buscarFinanceiro()
            .then((resposta) => { if (ativo) setDados(resposta); })
            .catch((error) => { if (ativo) setErro(error.message || "Erro ao carregar o financeiro."); })
            .finally(() => { if (ativo) setCarregando(false); });
        return () => { ativo = false; };
    }, []);

    const pedidosFiltrados = useMemo(() => {
        const termo = busca.trim().toLowerCase();
        if (!termo) return dados.pedidosRecentes;
        return dados.pedidosRecentes.filter((pedido) => (
            `${pedido.id} ${pedido.usuario_nome || ""} ${pedido.usuario_email || ""}`.toLowerCase().includes(termo)
        ));
    }, [busca, dados.pedidosRecentes]);

    const resumo = dados.resumo || {};
    const pedidosEmAndamento = Number(resumo.pedidos_em_andamento || 0);

    return (
        <main className="min-h-screen px-6 pb-16 pt-28 text-[#6F370F] md:px-10">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
                <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
                    <div>
                        <p className="text-sm uppercase tracking-[0.35em] text-[#5B3418]">Gestão do sistema</p>
                        <h1 className="mt-4 text-4xl font-semibold text-[#5B3418] md:text-5xl">Financeiro</h1>
                        <p className="mt-3 text-sm leading-7 text-[#7A4A2A]">Acompanhe o faturamento e o desempenho dos pedidos da Brasa Branca.</p>
                    </div>
                    <div className="flex items-center gap-2 rounded-2xl border border-[#8B4513]/15 bg-[#FAF3E7]/72 px-4 py-3 text-sm text-[#80634D]"><TrendingUp size={17} className="text-[#8B4513]" /> Dados atualizados dos pedidos</div>
                </div>

                {carregando ? <div className="rounded-3xl border border-[#8B4513]/18 bg-[#FAF3E7]/72 p-8 text-[#7A4A2A]">Carregando financeiro...</div> : null}
                {erro ? <div className="rounded-3xl border border-red-400/30 bg-red-50/70 p-5 text-sm text-red-700">{erro}</div> : null}

                {!carregando && !erro ? <>
                    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <CartaoResumo rotulo="Faturamento total" valor={formatarPreco(resumo.faturamento)} detalhe={`${formatarPreco(resumo.faturamento_recebido)} em pedidos recebidos`} icone={CircleDollarSign} />
                        <CartaoResumo rotulo="Pedidos" valor={resumo.quantidade_pedidos || 0} detalhe="Pedidos registrados" icone={ReceiptText} />
                        <CartaoResumo rotulo="Ticket médio" valor={formatarPreco(resumo.ticket_medio)} detalhe="Valor médio por pedido" icone={ArrowUpRight} />
                        <CartaoResumo rotulo="Clientes atendidos" valor={resumo.clientes_atendidos || 0} detalhe="Clientes com pedidos" icone={Users} />
                    </section>

                    <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
                        <article className="rounded-3xl border border-[#8B4513]/15 bg-[#FAF3E7] p-6 shadow-[0_18px_60px_rgba(91,52,24,0.07)]">
                            <div className="flex items-start justify-between gap-4"><div><p className="text-xs uppercase tracking-[0.18em] text-[#9B8069]">Desempenho</p><h2 className="mt-2 text-xl font-semibold text-[#5B3418]">Faturamento por mês</h2></div><TrendingUp className="text-[#8B4513]" size={21} /></div>
                            <GraficoFaturamento meses={dados.porMes} />
                        </article>
                        <article className="rounded-3xl border border-[#8B4513]/15 bg-[#FAF3E7] p-6 shadow-[0_18px_60px_rgba(91,52,24,0.07)]"><p className="text-xs uppercase tracking-[0.18em] text-[#9B8069]">Resumo operacional</p><h2 className="mt-2 text-xl font-semibold text-[#5B3418]">Visão dos pedidos</h2><div className="mt-7 space-y-5"><div className="flex items-center justify-between border-b border-[#8B4513]/12 pb-4"><span className="text-sm text-[#80634D]">Faturamento recebido</span><strong className="text-[#5B3418]">{formatarPreco(resumo.faturamento_recebido)}</strong></div><div className="flex items-center justify-between border-b border-[#8B4513]/12 pb-4"><span className="text-sm text-[#80634D]">Em andamento</span><strong className="text-[#5B3418]">{pedidosEmAndamento} pedidos</strong></div><div className="rounded-2xl bg-[#F1E2D0] p-4 text-sm leading-6 text-[#80634D]">Os valores são calculados diretamente a partir dos pedidos registrados no banco de dados.</div></div></article>
                    </section>

                    <section className="rounded-3xl border border-[#8B4513]/15 bg-[#FAF3E7] p-6 shadow-[0_18px_60px_rgba(91,52,24,0.07)]">
                        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center"><div><p className="text-xs uppercase tracking-[0.18em] text-[#9B8069]">Movimentações</p><h2 className="mt-2 text-xl font-semibold text-[#5B3418]">Pedidos recentes</h2></div><div className="relative w-full md:w-72"><Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#A0846B]" size={17} /><input value={busca} onChange={(event) => setBusca(event.target.value)} placeholder="Buscar pedido ou cliente" style={{ paddingLeft: "3rem" }} className="w-full rounded-2xl border border-[#8B4513]/18 bg-[#FFF8EF]/70 py-3 pr-3 text-sm text-[#3F2415] outline-none transition placeholder:text-[#B8A18C] focus:border-[#8B4513]/60" /></div></div>
                        <div className="mt-5 overflow-x-auto"><table className="w-full min-w-[680px] text-left"><thead><tr className="border-b border-[#8B4513]/12 text-xs uppercase tracking-[0.16em] text-[#9B8069]"><th className="px-3 py-3 font-medium">Pedido</th><th className="px-3 py-3 font-medium">Cliente</th><th className="px-3 py-3 font-medium">Data</th><th className="px-3 py-3 font-medium">Status</th><th className="px-3 py-3 text-right font-medium">Total</th></tr></thead><tbody>{pedidosFiltrados.map((pedido) => <tr key={pedido.id} className="border-b border-[#8B4513]/10 last:border-0"><td className="px-3 py-4 font-semibold text-[#5B3418]">#{pedido.id}</td><td className="px-3 py-4"><p className="font-medium text-[#5B3418]">{pedido.usuario_nome || "Cliente"}</p><p className="mt-1 text-xs text-[#80634D]">{pedido.usuario_email || "—"}</p></td><td className="px-3 py-4 text-sm text-[#80634D]">{formatarData(pedido.criado_em)}</td><td className="px-3 py-4"><span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${pedido.status === "recebido" ? "bg-emerald-100 text-emerald-800" : "bg-[#F1E2D0] text-[#7A4A2A]"}`}>{statusDoPedido(pedido.status)}</span></td><td className="px-3 py-4 text-right font-semibold text-[#5B3418]">{formatarPreco(pedido.total)}</td></tr>)}</tbody></table>{pedidosFiltrados.length === 0 ? <div className="py-10 text-center text-sm text-[#80634D]">Nenhum pedido encontrado.</div> : null}</div>
                    </section>
                </> : null}
            </div>
        </main>
    );
}
