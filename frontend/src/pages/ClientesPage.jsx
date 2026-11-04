import { useEffect, useMemo, useState } from "react";
import { Mail, Search, ShoppingBag, UserRound, Users } from "lucide-react";
import { listarClientes } from "../services/UsuarioService";

function iniciais(nome) {
    return String(nome || "C").split(" ").filter(Boolean).slice(0, 2).map((parte) => parte[0]).join("").toUpperCase();
}

function formatarData(valor) {
    if (!valor) return "";
    return new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" }).format(new Date(valor));
}

export default function ClientesPage() {
    const [clientes, setClientes] = useState([]);
    const [busca, setBusca] = useState("");
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");

    useEffect(() => {
        let ativo = true;
        listarClientes()
            .then((data) => { if (ativo) setClientes(data); })
            .catch((error) => { if (ativo) setErro(error.message || "Erro ao carregar os clientes."); })
            .finally(() => { if (ativo) setCarregando(false); });
        return () => { ativo = false; };
    }, []);

    const clientesFiltrados = useMemo(() => {
        const termo = busca.trim().toLowerCase();
        if (!termo) return clientes;
        return clientes.filter((cliente) => `${cliente.nome} ${cliente.email}`.toLowerCase().includes(termo));
    }, [busca, clientes]);

    const totalPedidos = clientes.reduce((total, cliente) => total + Number(cliente.quantidade_pedidos || 0), 0);

    return (
        <main className="min-h-screen px-6 pb-16 pt-28 text-brand-primary md:px-10">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
                <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-sm uppercase tracking-[0.35em] text-brand-primary">Gestão do sistema</p><h1 className="mt-4 text-4xl font-semibold text-brand-primary md:text-5xl">Clientes</h1><p className="mt-3 text-sm leading-7 text-brand-text">Consulte os clientes cadastrados e o histórico de pedidos.</p></div><div className="flex items-center gap-3 rounded-2xl border border-brand-border bg-brand-surface px-4 py-3"><Users size={19} className="text-brand-primary" /><span className="text-sm font-semibold text-brand-primary">{clientes.length} clientes</span></div></div>

                {carregando ? <div className="rounded-3xl border border-brand-border bg-brand-surface p-8 text-brand-text">Carregando clientes...</div> : null}
                {erro ? <div className="rounded-3xl border border-red-400/30 bg-red-50/70 p-5 text-sm text-red-700">{erro}</div> : null}

                {!carregando && !erro ? <><div className="grid gap-4 md:grid-cols-3"><div className="rounded-3xl border border-brand-border bg-brand-surface p-5"><p className="text-xs uppercase tracking-[0.18em] text-brand-muted">Clientes cadastrados</p><p className="mt-3 text-3xl font-semibold text-brand-primary">{clientes.length}</p></div><div className="rounded-3xl border border-brand-border bg-brand-surface p-5"><p className="text-xs uppercase tracking-[0.18em] text-brand-muted">Pedidos realizados</p><p className="mt-3 text-3xl font-semibold text-brand-primary">{totalPedidos}</p></div><div className="rounded-3xl border border-brand-border bg-brand-surface p-5"><p className="text-xs uppercase tracking-[0.18em] text-brand-muted">Média por cliente</p><p className="mt-3 text-3xl font-semibold text-brand-primary">{clientes.length ? (totalPedidos / clientes.length).toFixed(1).replace(".", ",") : "0"}</p></div></div><div className="relative"><Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted" size={18} /><input value={busca} onChange={(event) => setBusca(event.target.value)} placeholder="Buscar por nome ou e-mail" className="w-full rounded-2xl border border-brand-border bg-brand-surface py-3.5 pl-11 pr-4 text-sm text-brand-ink outline-none transition placeholder:text-brand-placeholder focus:border-brand-accent focus:bg-brand-surface" /></div><div className="grid gap-4 md:grid-cols-2">{clientesFiltrados.map((cliente) => <article key={cliente.id} className="rounded-3xl border border-brand-border bg-brand-surface p-5 shadow-[0_18px_60px_rgba(91,52,24,0.08)] transition hover:-translate-y-0.5 hover:bg-brand-surface"><div className="flex items-start gap-4"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-primary text-lg font-semibold text-brand-cream">{iniciais(cliente.nome)}</div><div className="min-w-0 flex-1"><h2 className="truncate text-lg font-semibold text-brand-primary">{cliente.nome}</h2><p className="mt-1 flex items-center gap-2 truncate text-sm text-brand-text"><Mail size={14} /> {cliente.email}</p></div><UserRound size={20} className="shrink-0 text-brand-primary" /></div><div className="mt-5 flex items-center justify-between border-t border-brand-border pt-4"><span className="flex items-center gap-2 text-sm text-brand-text"><ShoppingBag size={16} className="text-brand-primary" /> {cliente.quantidade_pedidos} {Number(cliente.quantidade_pedidos) === 1 ? "pedido" : "pedidos"}</span><span className="text-xs text-brand-muted">Desde {formatarData(cliente.criado_em)}</span></div></article>)}</div>{clientesFiltrados.length === 0 ? <div className="rounded-3xl border border-brand-border bg-brand-surface px-8 py-12 text-center text-sm text-brand-text">Nenhum cliente encontrado.</div> : null}</> : null}
            </div>
        </main>
    );
}
