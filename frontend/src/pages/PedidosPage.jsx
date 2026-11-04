import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Bike, CheckCircle2, ChevronDown, ChevronUp, Clock3, Mail, MapPin, PackageCheck, Send, ShoppingBag, Star, UserRound } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { avaliarPedido, listarPedidos, listarTodosPedidos, marcarPedidoRecebido } from "../services/PedidoService";
import { isAdmin } from "../utils/auth";

function formatarPreco(valor) {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(valor || 0));
}

function formatarData(valor) {
    if (!valor) return "";
    return new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(valor));
}

function rotuloStatus(status) {
    if (status === "recebido") return "Recebido";
    if (status === "indo_ate_voce") return "Indo até você";
    return status;
}

function classeStatus(status) {
    return status === "recebido"
        ? "bg-emerald-100 text-emerald-700"
        : "bg-[#F8D9A0]/60 text-[#8B4513]";
}

function formatarEndereco(endereco) {
    if (!endereco) return "Endereço de entrega não informado";
    return `${endereco.rua}, ${endereco.numero} — ${endereco.bairro}, ${endereco.cidade}/${endereco.estado}`;
}

function gerarVariacao(cidade = "") {
    return [...cidade].reduce((total, caractere) => total + caractere.charCodeAt(0), 0) % 22 - 11;
}

function MapaEntrega({ endereco }) {
    const cidade = endereco?.cidade || "Cidade da entrega";
    const estado = endereco?.estado || "--";
    const variacao = gerarVariacao(cidade);

    return (
        <div className="relative mt-6 min-h-[270px] overflow-hidden rounded-3xl border border-[#8B4513]/15 bg-[#EFD1AC] shadow-[0_18px_50px_rgba(91,52,24,0.12)]">
            <svg viewBox="0 0 900 400" className="absolute inset-0 h-full w-full" role="img" aria-label={`Mapa estilizado de ${cidade} com motoboy parado`}>
                <rect width="900" height="400" fill="#EFD1AC" />
                <g transform={`translate(${variacao} ${variacao / 2})`}>
                    <path d="M-40 105 C 120 65, 205 125, 330 95 S 560 10, 940 75" fill="none" stroke="#D4AB80" strokeWidth="34" strokeLinecap="round" />
                    <path d="M-40 105 C 120 65, 205 125, 330 95 S 560 10, 940 75" fill="none" stroke="#FAE9D5" strokeWidth="22" strokeLinecap="round" />
                    <path d="M40 360 C 150 275, 180 210, 282 198 S 490 230, 590 170 S 765 122, 940 190" fill="none" stroke="#D0A477" strokeWidth="28" strokeLinecap="round" />
                    <path d="M40 360 C 150 275, 180 210, 282 198 S 490 230, 590 170 S 765 122, 940 190" fill="none" stroke="#FBEBD8" strokeWidth="17" strokeLinecap="round" />
                    <path d="M230 -30 C 260 80, 218 150, 270 214 S 400 315, 450 440" fill="none" stroke="#C7986A" strokeWidth="22" strokeLinecap="round" />
                    <path d="M230 -30 C 260 80, 218 150, 270 214 S 400 315, 450 440" fill="none" stroke="#F9E6CF" strokeWidth="13" strokeLinecap="round" />
                    <path d="M600 -30 C 560 62, 610 126, 574 190 S 540 320, 625 430" fill="none" stroke="#C7986A" strokeWidth="20" strokeLinecap="round" />
                    <path d="M600 -30 C 560 62, 610 126, 574 190 S 540 320, 625 430" fill="none" stroke="#F9E6CF" strokeWidth="12" strokeLinecap="round" />
                    <path d="M-20 260 C 120 220, 185 270, 302 254 S 505 220, 640 275 S 820 310, 930 270" fill="none" stroke="#C7986A" strokeWidth="13" strokeLinecap="round" />
                    <path d="M-20 260 C 120 220, 185 270, 302 254 S 505 220, 640 275 S 820 310, 930 270" fill="none" stroke="#F9E6CF" strokeWidth="7" strokeLinecap="round" />
                    <path d="M370 0 L390 90 L355 160 L390 245 L365 405" fill="none" stroke="#D9B58F" strokeWidth="8" strokeLinecap="round" />
                    <path d="M770 20 L725 110 L752 195 L704 270 L735 410" fill="none" stroke="#D9B58F" strokeWidth="8" strokeLinecap="round" />
                    <path d="M80 165 L190 150 L298 168 L390 145 L500 158 L680 135" fill="none" stroke="#D9B58F" strokeWidth="7" strokeLinecap="round" />
                    <path d="M460 332 C 500 285, 525 256, 574 190" fill="none" stroke="#8B4513" strokeWidth="4" strokeDasharray="10 10" opacity="0.55" />
                </g>
            </svg>

            <div className="pointer-events-none absolute left-5 top-5 rounded-full border border-[#8B4513]/15 bg-[#FAF3E7]/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#6F4A2E] shadow-sm backdrop-blur-sm">
                Entrega em {cidade} · {estado}
            </div>
            <div className="pointer-events-none absolute right-[35%] top-[43%] flex -translate-x-1/2 -translate-y-1/2 items-center">
                <span className="flex h-11 w-11 items-center justify-center rounded-full border-4 border-[#FAF3E7] bg-[#5B3418] text-[#F8D9A0] shadow-[0_8px_22px_rgba(91,52,24,0.3)]">
                    <Bike size={21} strokeWidth={1.8} />
                </span>
            </div>
        </div>
    );
}

function AvaliacaoPedido({ pedido, usuarioId, onSaved }) {
    const [nota, setNota] = useState(Number(pedido.avaliacao_nota || 0));
    const [comentario, setComentario] = useState(pedido.avaliacao_comentario || "");
    const [salvando, setSalvando] = useState(false);
    const [mensagem, setMensagem] = useState("");
    const [confirmacaoAberta, setConfirmacaoAberta] = useState(false);

    const enviarAvaliacao = async (event) => {
        event.preventDefault();
        if (!nota) {
            setMensagem("Escolha uma nota de 1 a 5 estrelas.");
            return;
        }

        setMensagem("");
        setConfirmacaoAberta(true);
    };

    const confirmarEnvio = async () => {
        try {
            setSalvando(true);
            const data = await avaliarPedido(usuarioId, pedido.id, { nota, comentario });
            onSaved(data.pedido);
            setConfirmacaoAberta(false);
        } catch (error) {
            setMensagem(error.message || "Não foi possível salvar sua avaliação.");
        } finally {
            setSalvando(false);
        }
    };

    if (pedido.avaliacao_id) return null;

    return (
        <>
            <form onSubmit={enviarAvaliacao} className="mt-6 rounded-2xl border border-[#8B4513]/15 bg-[#FFF8EF]/65 p-5">
                <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9B8069]">Pedido recebido</p><h3 className="mt-2 text-lg font-semibold text-[#5B3418]">Como foi sua experiência?</h3></div><Star className="text-[#B97842]" size={22} /></div>
                <div className="mt-5 flex items-center gap-1" role="radiogroup" aria-label="Nota do pedido">
                    {[1, 2, 3, 4, 5].map((estrela) => <button key={estrela} type="button" role="radio" aria-checked={nota === estrela} aria-label={`${estrela} estrela${estrela > 1 ? "s" : ""}`} onClick={() => setNota(estrela)} className="p-1 transition hover:scale-110 focus:outline-none focus-visible:outline-none"><Star size={29} fill={estrela <= nota ? "#D98C3F" : "transparent"} className={estrela <= nota ? "text-[#D98C3F]" : "text-[#B99B80]"} /></button>)}
                </div>
                <label className="mt-5 block"><span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[#6F513B]">Comentário <span className="font-normal normal-case tracking-normal text-[#9B8069]">(opcional)</span></span><textarea value={comentario} onChange={(event) => setComentario(event.target.value.slice(0, 1000))} rows={3} placeholder="Conte como foi seu pedido..." className="w-full resize-y rounded-xl border border-[#8B4513]/18 bg-white/75 px-4 py-3 text-sm text-[#3F2415] outline-none transition placeholder:text-[#B8A18C] focus:border-[#8B4513]/60 focus:bg-white" /></label>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3"><span className="text-xs text-red-600">{mensagem}</span><button type="submit" disabled={salvando || !nota} className="inline-flex items-center gap-2 rounded-xl bg-[#5B3418] px-5 py-3 text-sm font-semibold text-[#FFF8EF] transition hover:bg-[#7A401E] disabled:cursor-not-allowed disabled:opacity-55"><Send size={15} />Enviar avaliação</button></div>
            </form>
            {confirmacaoAberta ? <div className="fixed inset-0 z-[140] flex items-center justify-center bg-[#29170d]/65 p-5 backdrop-blur-sm"><section role="dialog" aria-modal="true" aria-labelledby="confirm-review-title" className="w-full max-w-sm rounded-[2rem] bg-[#FBF5ED] p-6 shadow-[0_28px_90px_rgba(49,24,8,0.32)]"><h2 id="confirm-review-title" className="text-xl font-semibold text-[#4C2A17]">Tem certeza?</h2><p className="mt-3 text-sm leading-6 text-[#7A5A43]">Sua avaliação será enviada para este pedido.</p>{mensagem ? <p className="mt-4 rounded-xl border border-red-400/30 bg-red-50/70 px-3 py-2 text-xs text-red-700">{mensagem}</p> : null}<div className="mt-6 flex justify-end gap-3"><button type="button" onClick={() => setConfirmacaoAberta(false)} disabled={salvando} className="rounded-xl border border-[#8B4513]/25 px-4 py-3 text-sm font-semibold text-[#5B3418] transition hover:bg-[#8B4513]/10">Não</button><button type="button" onClick={confirmarEnvio} disabled={salvando} className="rounded-xl bg-[#5B3418] px-4 py-3 text-sm font-semibold text-[#FFF8EF] transition hover:bg-[#7A401E] disabled:opacity-60">{salvando ? "Enviando..." : "Sim, enviar"}</button></div></section></div> : null}
        </>
    );
}

function AvaliacaoResumo({ pedido }) {
    const navigate = useNavigate();
    const possuiAvaliacao = Boolean(pedido.avaliacao_id);

    const abrirAvaliacao = () => {
        if (possuiAvaliacao) navigate("/avaliacoes", { state: { abrirAvaliacaoId: pedido.avaliacao_id } });
    };

    return (
        <div role={possuiAvaliacao ? "button" : undefined} tabIndex={possuiAvaliacao ? 0 : undefined} onClick={abrirAvaliacao} onKeyDown={(event) => { if (possuiAvaliacao && (event.key === "Enter" || event.key === " ")) abrirAvaliacao(); }} className={`mt-6 rounded-2xl border border-[#8B4513]/15 bg-[#FFF8EF]/65 p-4 ${possuiAvaliacao ? "cursor-pointer transition hover:border-[#D98C3F]/60 hover:bg-[#FFF8EF]" : ""}`}>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9B8069]">Avaliação do cliente</p>
            {pedido.avaliacao_id ? <><div className="mt-3 flex items-center gap-1">{[1, 2, 3, 4, 5].map((estrela) => <Star key={estrela} size={19} fill={estrela <= pedido.avaliacao_nota ? "#D98C3F" : "transparent"} className={estrela <= pedido.avaliacao_nota ? "text-[#D98C3F]" : "text-[#B99B80]"} />)}</div><p className="mt-3 text-sm leading-6 text-[#5B3418]">{pedido.avaliacao_comentario || "O cliente não deixou um comentário."}</p></> : <p className="mt-3 text-sm text-[#8D7159]">Ainda não avaliado.</p>}
        </div>
    );
}

function AdminPedidosView({ pedidos, carregando, erro, pedidoInicial }) {
    const [aberto, setAberto] = useState(Number(pedidoInicial) || null);

    useEffect(() => {
        if (pedidoInicial) setAberto(Number(pedidoInicial));
    }, [pedidoInicial]);

    return (
        <main className="min-h-screen px-6 pb-16 pt-28 text-[#6F370F] md:px-10">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-10">
                <div><p className="text-sm uppercase tracking-[0.35em] text-[#5B3418]">Gestão do sistema</p><h1 className="mt-4 text-4xl font-semibold text-[#5B3418] md:text-5xl">Pedidos</h1><p className="mt-3 max-w-2xl text-sm leading-7 text-[#7A4A2A]">Acompanhe os pedidos de todos os clientes em um só lugar.</p></div>
                {carregando ? <div className="rounded-3xl border border-[#8B4513]/18 bg-[#FAF3E7]/72 p-8 text-[#7A4A2A]">Carregando pedidos...</div> : null}
                {erro ? <div className="rounded-3xl border border-red-400/30 bg-red-50/70 p-5 text-sm text-red-700">{erro}</div> : null}
                {!carregando && !erro && pedidos.length === 0 ? <div className="rounded-3xl border border-[#8B4513]/18 bg-[#FAF3E7]/72 px-8 py-14 text-center"><ShoppingBag className="mx-auto text-[#8B4513]" size={34} strokeWidth={1.5} /><h2 className="mt-5 text-xl font-semibold text-[#5B3418]">Nenhum pedido encontrado</h2></div> : null}
                <div className="flex flex-col gap-4">
                    {pedidos.map((pedido) => {
                        const expandido = aberto === pedido.id;
                        return <article key={pedido.id} className="overflow-hidden rounded-3xl border border-[#8B4513]/18 bg-[#FAF3E7]/72 shadow-[0_18px_60px_rgba(91,52,24,0.08)]"><button type="button" onClick={() => setAberto(expandido ? null : pedido.id)} className="flex w-full items-center gap-4 px-5 py-5 text-left transition hover:bg-[#FAF3E7]/80 md:px-6"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#5B3418] text-[#F8D9A0]"><PackageCheck size={21} /></span><span className="min-w-0 flex-1"><span className="flex flex-wrap items-center gap-2 text-sm font-semibold text-[#5B3418]">Pedido #{pedido.id}<span className={`rounded-full px-2.5 py-1 text-[0.65rem] uppercase tracking-[0.12em] ${classeStatus(pedido.status)}`}>{rotuloStatus(pedido.status)}</span></span><span className="mt-1 flex items-center gap-2 text-xs text-[#8D7159]"><UserRound size={13} /> {pedido.usuario_nome} · {pedido.usuario_email}</span></span><span className="hidden text-right sm:block"><span className="block text-xs text-[#8D7159]">Total</span><span className="font-semibold text-[#5B3418]">{formatarPreco(pedido.total)}</span></span>{expandido ? <ChevronUp size={19} className="text-[#8B4513]" /> : <ChevronDown size={19} className="text-[#8B4513]" />}</button>{expandido ? <div className="border-t border-[#8B4513]/12 px-5 py-5 md:px-6"><div className="grid gap-6 md:grid-cols-2"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9B8069]">Itens do pedido</p><div className="mt-4 flex flex-col gap-3">{pedido.itens.map((item) => <div key={item.id} className="flex items-center justify-between gap-4 text-sm text-[#725943]"><span>{item.quantidade}x {item.nome}</span><span className="shrink-0">{formatarPreco(Number(item.preco) * item.quantidade)}</span></div>)}</div></div><div className="space-y-4"><div><p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#9B8069]"><MapPin size={14} /> Entrega</p><p className="mt-2 text-sm leading-6 text-[#5B3418]">{formatarEndereco(pedido.endereco)}</p></div><div><p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#9B8069]"><Mail size={14} /> Cliente</p><p className="mt-2 text-sm text-[#5B3418]">{pedido.usuario_email}</p></div></div></div><AvaliacaoResumo pedido={pedido} /><div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[#8B4513]/12 pt-4 text-sm"><span className="flex items-center gap-2 text-[#8D7159]"><Clock3 size={14} /> {formatarData(pedido.criado_em)} · Pagamento: {pedido.bandeira} •••• {pedido.ultimos_digitos}</span><strong className="text-lg text-[#5B3418]">{formatarPreco(pedido.total)}</strong></div></div> : null}</article>;
                    })}
                </div>
            </div>
        </main>
    );
}

export default function PedidosPage() {
    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const administrador = isAdmin(user);
    const [pedidos, setPedidos] = useState([]);
    const [aberto, setAberto] = useState(null);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");
    const [confirmandoId, setConfirmandoId] = useState(null);

    useEffect(() => {
        let ativo = true;
        const carregar = async () => {
            try {
                setCarregando(true);
                setErro("");
                const data = administrador ? await listarTodosPedidos() : await listarPedidos(user.id);
                if (ativo) setPedidos(data);
            } catch (error) {
                if (ativo) setErro(error.message || "Erro ao carregar seus pedidos.");
            } finally {
                if (ativo) setCarregando(false);
            }
        };
        carregar();
        return () => { ativo = false; };
    }, [user.id, administrador]);

    useEffect(() => {
        if (!administrador || !location.state?.abrirPedidoId) return;
        navigate(location.pathname, { replace: true, state: {} });
    }, [administrador, location.pathname, location.state, navigate]);

    const confirmarRecebimento = async (pedidoId) => {
        try {
            setConfirmandoId(pedidoId);
            setErro("");
            const data = await marcarPedidoRecebido(user.id, pedidoId);
            setPedidos((current) => current.map((pedido) => pedido.id === pedidoId ? data.pedido : pedido));
        } catch (error) {
            setErro(error.message || "Não foi possível confirmar o recebimento.");
        } finally {
            setConfirmandoId(null);
        }
    };

    if (administrador) {
        return <AdminPedidosView pedidos={pedidos} carregando={carregando} erro={erro} pedidoInicial={location.state?.abrirPedidoId} />;
    }

    return (
        <main className="min-h-screen px-6 pb-16 pt-28 text-[#6F370F] md:px-10">
            <div className="mx-auto flex w-full max-w-5xl flex-col gap-10">
                <div>
                    <p className="text-sm uppercase tracking-[0.35em] text-[#5B3418]">Histórico</p>
                    <h1 className="mt-4 text-4xl font-semibold text-[#5B3418] md:text-5xl">Meus pedidos</h1>
                    <p className="mt-3 max-w-2xl text-sm leading-7 text-[#7A4A2A]">Acompanhe tudo o que você já pediu na Brasa Branca.</p>
                </div>

                {carregando ? <div className="rounded-3xl border border-[#8B4513]/18 bg-[#FAF3E7]/72 p-8 text-[#7A4A2A]">Carregando pedidos...</div> : null}
                {erro ? <div className="rounded-3xl border border-red-400/30 bg-red-50/70 p-5 text-sm text-red-700">{erro}</div> : null}
                {!carregando && !erro && pedidos.length === 0 ? <div className="rounded-3xl border border-[#8B4513]/18 bg-[#FAF3E7]/72 px-8 py-14 text-center"><ShoppingBag className="mx-auto text-[#8B4513]" size={34} strokeWidth={1.5} /><h2 className="mt-5 text-xl font-semibold text-[#5B3418]">Você ainda não fez pedidos</h2><p className="mt-2 text-sm text-[#7A4A2A]">Quando finalizar uma compra, ela aparecerá aqui.</p></div> : null}

                <div className="flex flex-col gap-4">
                    {pedidos.map((pedido) => {
                        const expandido = aberto === pedido.id;
                        return (
                            <article key={pedido.id} className="overflow-hidden rounded-3xl border border-[#8B4513]/18 bg-[#FAF3E7]/72 shadow-[0_18px_60px_rgba(91,52,24,0.08)]">
                                <button type="button" onClick={() => setAberto(expandido ? null : pedido.id)} className="flex w-full items-center gap-4 px-5 py-5 text-left transition hover:bg-[#FAF3E7]/80 md:px-6">
                                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#5B3418] text-[#F8D9A0]"><PackageCheck size={21} /></span>
                                    <span className="min-w-0 flex-1"><span className="flex flex-wrap items-center gap-2 text-sm font-semibold text-[#5B3418]">Pedido #{pedido.id}<span className={`rounded-full px-2.5 py-1 text-[0.65rem] uppercase tracking-[0.12em] ${classeStatus(pedido.status)}`}>{rotuloStatus(pedido.status)}</span></span><span className="mt-1 flex items-center gap-2 text-xs text-[#8D7159]"><Clock3 size={13} /> {formatarData(pedido.criado_em)}</span></span>
                                    <span className="hidden text-right sm:block"><span className="block text-xs text-[#8D7159]">Total</span><span className="font-semibold text-[#5B3418]">{formatarPreco(pedido.total)}</span></span>
                                    {expandido ? <ChevronUp size={19} className="text-[#8B4513]" /> : <ChevronDown size={19} className="text-[#8B4513]" />}
                                </button>
                                {expandido ? <div className="border-t border-[#8B4513]/12 px-5 py-5 md:px-6"><div className="flex flex-col gap-3">{pedido.itens.map((item) => <div key={item.id} className="flex items-center justify-between gap-4 text-sm text-[#725943]"><span>{item.quantidade}x {item.nome}</span><span className="shrink-0">{formatarPreco(Number(item.preco) * item.quantidade)}</span></div>)}</div>{pedido.status === "recebido" ? <AvaliacaoPedido pedido={pedido} usuarioId={user.id} onSaved={(pedidoAtualizado) => setPedidos((current) => current.map((item) => item.id === pedidoAtualizado.id ? pedidoAtualizado : item))} /> : <MapaEntrega endereco={pedido.endereco} />}<div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#8B4513]/12 pt-4 text-sm"><span className="text-[#8D7159]">Pagamento: {pedido.bandeira} •••• {pedido.ultimos_digitos}</span><strong className="text-lg text-[#5B3418]">{formatarPreco(pedido.total)}</strong></div><p className="mt-3 text-sm text-[#8D7159]">Entrega: {formatarEndereco(pedido.endereco)}</p>{pedido.status !== "recebido" ? <button type="button" onClick={() => confirmarRecebimento(pedido.id)} disabled={confirmandoId === pedido.id} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#5B3418] px-5 py-3.5 text-sm font-semibold text-[#FFF8EF] transition hover:bg-[#7A401E] disabled:cursor-wait disabled:opacity-60"><CheckCircle2 size={17} />{confirmandoId === pedido.id ? "Confirmando..." : "Recebi meu pedido"}</button> : null}</div> : null}
                            </article>
                        );
                    })}
                </div>
            </div>
        </main>
    );
}
