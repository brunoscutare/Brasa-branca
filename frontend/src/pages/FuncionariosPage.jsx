import { useEffect, useMemo, useState } from "react";
import { Mail, Plus, Search, ShieldCheck, UserCog, UserRound, Users, X } from "lucide-react";
import { criarFuncionario, listarFuncionarios } from "../services/UsuarioService";

const formularioInicial = { nome: "", email: "", senha: "" };

function iniciais(nome) {
    return String(nome || "F").split(" ").filter(Boolean).slice(0, 2).map((parte) => parte[0]).join("").toUpperCase();
}

function formatarData(valor) {
    if (!valor) return "—";
    return new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" }).format(new Date(valor));
}

export default function FuncionariosPage() {
    const [funcionarios, setFuncionarios] = useState([]);
    const [busca, setBusca] = useState("");
    const [modalAberto, setModalAberto] = useState(false);
    const [form, setForm] = useState(formularioInicial);
    const [carregando, setCarregando] = useState(true);
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState("");
    const [mensagem, setMensagem] = useState("");

    useEffect(() => {
        let ativo = true;
        listarFuncionarios()
            .then((data) => { if (ativo) setFuncionarios(data); })
            .catch((error) => { if (ativo) setErro(error.message || "Erro ao carregar os funcionários."); })
            .finally(() => { if (ativo) setCarregando(false); });
        return () => { ativo = false; };
    }, []);

    const funcionariosFiltrados = useMemo(() => {
        const termo = busca.trim().toLowerCase();
        if (!termo) return funcionarios;
        return funcionarios.filter((funcionario) => `${funcionario.nome} ${funcionario.email}`.toLowerCase().includes(termo));
    }, [busca, funcionarios]);

    const abrirNovo = () => {
        setForm(formularioInicial);
        setErro("");
        setModalAberto(true);
    };

    const fecharModal = () => {
        if (salvando) return;
        setModalAberto(false);
    };

    const salvar = async (event) => {
        event.preventDefault();
        setSalvando(true);
        setErro("");
        try {
            const resposta = await criarFuncionario(form);
            setFuncionarios((atuais) => [...atuais, resposta.funcionario].sort((a, b) => a.nome.localeCompare(b.nome)));
            setModalAberto(false);
            setMensagem("Funcionário cadastrado com sucesso.");
        } catch (error) {
            setErro(error.message || "Não foi possível cadastrar o funcionário.");
        } finally {
            setSalvando(false);
        }
    };

    return (
        <main className="min-h-screen px-6 pb-16 pt-28 text-brand-primary md:px-10">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
                <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
                    <div>
                        <p className="text-sm uppercase tracking-[0.35em] text-brand-primary">Gestão do sistema</p>
                        <h1 className="mt-4 text-4xl font-semibold text-brand-primary md:text-5xl">Funcionários</h1>
                        <p className="mt-3 text-sm leading-7 text-brand-text">Consulte a equipe e cadastre novos acessos administrativos.</p>
                    </div>
                    <button type="button" onClick={abrirNovo} className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-primary px-5 py-3 text-sm font-semibold text-brand-surface shadow-[0_12px_25px_rgba(61,35,21,0.18)] transition hover:bg-brand-ink"><Plus size={18} /> Adicionar funcionário</button>
                </div>

                {mensagem ? <div className="rounded-2xl border border-brand-border bg-brand-panel px-4 py-3 text-sm text-brand-primary">{mensagem}</div> : null}
                {carregando ? <div className="rounded-3xl border border-brand-border bg-brand-surface p-8 text-brand-text">Carregando funcionários...</div> : null}
                {erro && !modalAberto ? <div className="rounded-3xl border border-brand-danger/30 bg-brand-danger-surface p-5 text-sm text-brand-danger">{erro}</div> : null}

                {!carregando && !erro ? <>
                    <section className="grid gap-4 sm:grid-cols-2">
                        <article className="rounded-3xl border border-brand-border bg-brand-surface p-5 shadow-[0_18px_60px_rgba(61,35,21,0.07)]"><div className="flex items-center justify-between"><p className="text-xs uppercase tracking-[0.18em] text-brand-muted">Equipe cadastrada</p><span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-primary text-brand-cream"><Users size={19} /></span></div><p className="mt-5 text-3xl font-semibold text-brand-primary">{funcionarios.length}</p><p className="mt-2 text-sm text-brand-text">Funcionários com acesso ao sistema</p></article>
                        <article className="rounded-3xl border border-brand-border bg-brand-surface p-5 shadow-[0_18px_60px_rgba(61,35,21,0.07)]"><div className="flex items-center justify-between"><p className="text-xs uppercase tracking-[0.18em] text-brand-muted">Acesso protegido</p><span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-primary text-brand-cream"><ShieldCheck size={19} /></span></div><p className="mt-5 text-3xl font-semibold text-brand-primary">Ativo</p><p className="mt-2 text-sm text-brand-text">Dados de acesso armazenados com segurança</p></article>
                    </section>

                    <div className="relative"><Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted" size={18} /><input value={busca} onChange={(event) => setBusca(event.target.value)} placeholder="Buscar por nome ou e-mail" style={{ paddingLeft: "3rem" }} className="w-full rounded-2xl border border-brand-border bg-brand-field py-3.5 pr-4 text-sm text-brand-ink outline-none transition placeholder:text-brand-placeholder focus:border-brand-accent" /></div>

                    <section className="grid gap-4 md:grid-cols-2">{funcionariosFiltrados.map((funcionario) => <article key={funcionario.id} className="rounded-3xl border border-brand-border bg-brand-surface p-5 shadow-[0_18px_60px_rgba(61,35,21,0.08)] transition hover:-translate-y-0.5"><div className="flex items-start gap-4"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-primary text-lg font-semibold text-brand-cream">{iniciais(funcionario.nome)}</div><div className="min-w-0 flex-1"><h2 className="truncate text-lg font-semibold text-brand-primary">{funcionario.nome}</h2><p className="mt-1 flex items-center gap-2 truncate text-sm text-brand-text"><Mail size={14} /> {funcionario.email}</p></div><UserCog size={20} className="shrink-0 text-brand-primary" /></div><div className="mt-5 flex items-center justify-between border-t border-brand-border pt-4"><span className="text-xs text-brand-muted">Desde {formatarData(funcionario.criado_em)}</span><a href={`mailto:${funcionario.email}`} className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold text-brand-primary transition hover:bg-brand-primary/10"><Mail size={14} /> E-mail</a></div></article>)}</section>
                    {funcionariosFiltrados.length === 0 ? <div className="rounded-3xl border border-brand-border bg-brand-surface px-8 py-12 text-center text-sm text-brand-text"><UserRound className="mx-auto mb-3 text-brand-primary" size={28} />{funcionarios.length ? "Nenhum funcionário encontrado." : "Nenhum funcionário cadastrado ainda."}</div> : null}
                </> : null}
            </div>

            {modalAberto ? <div className="fixed inset-0 z-[80] flex items-center justify-center bg-brand-ink/60 px-4 py-8" onMouseDown={(event) => { if (event.target === event.currentTarget) fecharModal(); }}><section role="dialog" aria-modal="true" aria-labelledby="funcionario-modal-titulo" className="relative w-full max-w-lg rounded-3xl border border-brand-border bg-brand-surface p-6 shadow-[0_25px_80px_rgba(61,35,21,0.3)]" style={{ backgroundColor: "var(--color-brand-surface)", opacity: 1 }}><div className="flex items-start justify-between gap-4"><div><p className="text-xs uppercase tracking-[0.2em] text-brand-muted">Equipe</p><h2 id="funcionario-modal-titulo" className="mt-2 text-2xl font-semibold text-brand-primary">Novo funcionário</h2><p className="mt-2 text-sm text-brand-text">Crie um acesso para a equipe administrativa.</p></div><button type="button" onClick={fecharModal} className="rounded-xl p-2 text-brand-text transition hover:bg-brand-primary/10" aria-label="Fechar"><X size={20} /></button></div><form onSubmit={salvar} className="mt-6 space-y-4"><label className="block"><span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-brand-text">Nome completo</span><input required minLength={2} value={form.nome} onChange={(event) => setForm((atual) => ({ ...atual, nome: event.target.value }))} placeholder="Nome do funcionário" className="w-full rounded-xl border border-brand-border bg-brand-field px-4 py-3 text-sm text-brand-ink outline-none focus:border-brand-accent" /></label><label className="block"><span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-brand-text">E-mail</span><input required type="email" value={form.email} onChange={(event) => setForm((atual) => ({ ...atual, email: event.target.value }))} placeholder="funcionario@brasa.com" className="w-full rounded-xl border border-brand-border bg-brand-field px-4 py-3 text-sm text-brand-ink outline-none focus:border-brand-accent" /></label><label className="block"><span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-brand-text">Senha</span><input required minLength={6} type="password" value={form.senha} onChange={(event) => setForm((atual) => ({ ...atual, senha: event.target.value }))} placeholder="Mínimo de 6 caracteres" className="w-full rounded-xl border border-brand-border bg-brand-field px-4 py-3 text-sm text-brand-ink outline-none focus:border-brand-accent" /></label>{erro ? <p role="alert" className="rounded-xl border border-brand-danger/30 bg-brand-danger-surface px-4 py-3 text-sm text-brand-danger">{erro}</p> : null}<div className="flex justify-end gap-3 pt-2"><button type="button" onClick={fecharModal} className="rounded-xl border border-brand-border px-4 py-3 text-sm font-semibold text-brand-primary transition hover:bg-brand-primary/10">Cancelar</button><button type="submit" disabled={salvando} className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-5 py-3 text-sm font-semibold text-brand-surface transition hover:bg-brand-ink disabled:cursor-not-allowed disabled:opacity-60">{salvando ? "Salvando..." : "Cadastrar funcionário"}</button></div></form></section></div> : null}
        </main>
    );
}
