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
        <main className="min-h-screen px-6 pb-16 pt-28 text-[#6F370F] md:px-10">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
                <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
                    <div>
                        <p className="text-sm uppercase tracking-[0.35em] text-[#5B3418]">Gestão do sistema</p>
                        <h1 className="mt-4 text-4xl font-semibold text-[#5B3418] md:text-5xl">Funcionários</h1>
                        <p className="mt-3 text-sm leading-7 text-[#7A4A2A]">Consulte a equipe e cadastre novos acessos administrativos.</p>
                    </div>
                    <button type="button" onClick={abrirNovo} className="inline-flex items-center justify-center gap-2 rounded-full bg-[#5B3418] px-5 py-3 text-sm font-semibold text-[#FFF8EF] shadow-[0_12px_25px_rgba(91,52,24,0.18)] transition hover:bg-[#7A401E]"><Plus size={18} /> Adicionar funcionário</button>
                </div>

                {mensagem ? <div className="rounded-2xl border border-emerald-500/20 bg-emerald-50/80 px-4 py-3 text-sm text-emerald-800">{mensagem}</div> : null}
                {carregando ? <div className="rounded-3xl border border-[#8B4513]/18 bg-[#FAF3E7] p-8 text-[#7A4A2A]">Carregando funcionários...</div> : null}
                {erro && !modalAberto ? <div className="rounded-3xl border border-red-400/30 bg-red-50/70 p-5 text-sm text-red-700">{erro}</div> : null}

                {!carregando && !erro ? <>
                    <section className="grid gap-4 sm:grid-cols-2">
                        <article className="rounded-3xl border border-[#8B4513]/15 bg-[#FAF3E7] p-5 shadow-[0_18px_60px_rgba(91,52,24,0.07)]"><div className="flex items-center justify-between"><p className="text-xs uppercase tracking-[0.18em] text-[#9B8069]">Equipe cadastrada</p><span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#5B3418] text-[#F8D9A0]"><Users size={19} /></span></div><p className="mt-5 text-3xl font-semibold text-[#5B3418]">{funcionarios.length}</p><p className="mt-2 text-sm text-[#80634D]">Funcionários com acesso ao sistema</p></article>
                        <article className="rounded-3xl border border-[#8B4513]/15 bg-[#FAF3E7] p-5 shadow-[0_18px_60px_rgba(91,52,24,0.07)]"><div className="flex items-center justify-between"><p className="text-xs uppercase tracking-[0.18em] text-[#9B8069]">Acesso protegido</p><span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#5B3418] text-[#F8D9A0]"><ShieldCheck size={19} /></span></div><p className="mt-5 text-3xl font-semibold text-[#5B3418]">Ativo</p><p className="mt-2 text-sm text-[#80634D]">Dados de acesso armazenados com segurança</p></article>
                    </section>

                    <div className="relative"><Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#A0846B]" size={18} /><input value={busca} onChange={(event) => setBusca(event.target.value)} placeholder="Buscar por nome ou e-mail" style={{ paddingLeft: "3rem" }} className="w-full rounded-2xl border border-[#8B4513]/18 bg-[#FAF3E7] py-3.5 pr-4 text-sm text-[#3F2415] outline-none transition placeholder:text-[#B8A18C] focus:border-[#8B4513]/60" /></div>

                    <section className="grid gap-4 md:grid-cols-2">{funcionariosFiltrados.map((funcionario) => <article key={funcionario.id} className="rounded-3xl border border-[#8B4513]/18 bg-[#FAF3E7] p-5 shadow-[0_18px_60px_rgba(91,52,24,0.08)] transition hover:-translate-y-0.5"><div className="flex items-start gap-4"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#5B3418] text-lg font-semibold text-[#F8D9A0]">{iniciais(funcionario.nome)}</div><div className="min-w-0 flex-1"><h2 className="truncate text-lg font-semibold text-[#5B3418]">{funcionario.nome}</h2><p className="mt-1 flex items-center gap-2 truncate text-sm text-[#80634D]"><Mail size={14} /> {funcionario.email}</p></div><UserCog size={20} className="shrink-0 text-[#8B4513]" /></div><div className="mt-5 flex items-center justify-between border-t border-[#8B4513]/12 pt-4"><span className="text-xs text-[#A0846B]">Desde {formatarData(funcionario.criado_em)}</span><a href={`mailto:${funcionario.email}`} className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold text-[#5B3418] transition hover:bg-[#8B4513]/10"><Mail size={14} /> E-mail</a></div></article>)}</section>
                    {funcionariosFiltrados.length === 0 ? <div className="rounded-3xl border border-[#8B4513]/18 bg-[#FAF3E7] px-8 py-12 text-center text-sm text-[#7A4A2A]"><UserRound className="mx-auto mb-3 text-[#8B4513]" size={28} />{funcionarios.length ? "Nenhum funcionário encontrado." : "Nenhum funcionário cadastrado ainda."}</div> : null}
                </> : null}
            </div>

            {modalAberto ? <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#24150E]/55 px-4 py-8" onMouseDown={(event) => { if (event.target === event.currentTarget) fecharModal(); }}><section role="dialog" aria-modal="true" aria-labelledby="funcionario-modal-titulo" className="relative w-full max-w-lg rounded-3xl border border-[#8B4513]/15 bg-[#FFF8EF] p-6 shadow-[0_25px_80px_rgba(36,21,14,0.3)]" style={{ backgroundColor: "#FFF8EF", opacity: 1 }}><div className="flex items-start justify-between gap-4"><div><p className="text-xs uppercase tracking-[0.2em] text-[#9B8069]">Equipe</p><h2 id="funcionario-modal-titulo" className="mt-2 text-2xl font-semibold text-[#5B3418]">Novo funcionário</h2><p className="mt-2 text-sm text-[#80634D]">Crie um acesso para a equipe administrativa.</p></div><button type="button" onClick={fecharModal} className="rounded-xl p-2 text-[#80634D] transition hover:bg-[#8B4513]/10" aria-label="Fechar"><X size={20} /></button></div><form onSubmit={salvar} className="mt-6 space-y-4"><label className="block"><span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[#6F513B]">Nome completo</span><input required minLength={2} value={form.nome} onChange={(event) => setForm((atual) => ({ ...atual, nome: event.target.value }))} placeholder="Nome do funcionário" className="w-full rounded-xl border border-[#8B4513]/18 bg-white px-4 py-3 text-sm text-[#3F2415] outline-none focus:border-[#8B4513]/60" /></label><label className="block"><span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[#6F513B]">E-mail</span><input required type="email" value={form.email} onChange={(event) => setForm((atual) => ({ ...atual, email: event.target.value }))} placeholder="funcionario@brasa.com" className="w-full rounded-xl border border-[#8B4513]/18 bg-white px-4 py-3 text-sm text-[#3F2415] outline-none focus:border-[#8B4513]/60" /></label><label className="block"><span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[#6F513B]">Senha</span><input required minLength={6} type="password" value={form.senha} onChange={(event) => setForm((atual) => ({ ...atual, senha: event.target.value }))} placeholder="Mínimo de 6 caracteres" className="w-full rounded-xl border border-[#8B4513]/18 bg-white px-4 py-3 text-sm text-[#3F2415] outline-none focus:border-[#8B4513]/60" /></label>{erro ? <p role="alert" className="rounded-xl border border-red-400/30 bg-red-50/70 px-4 py-3 text-sm text-red-700">{erro}</p> : null}<div className="flex justify-end gap-3 pt-2"><button type="button" onClick={fecharModal} className="rounded-xl border border-[#8B4513]/25 px-4 py-3 text-sm font-semibold text-[#5B3418] transition hover:bg-[#8B4513]/10">Cancelar</button><button type="submit" disabled={salvando} className="inline-flex items-center gap-2 rounded-xl bg-[#5B3418] px-5 py-3 text-sm font-semibold text-[#FFF8EF] transition hover:bg-[#7A401E] disabled:cursor-not-allowed disabled:opacity-60">{salvando ? "Salvando..." : "Cadastrar funcionário"}</button></div></form></section></div> : null}
        </main>
    );
}
