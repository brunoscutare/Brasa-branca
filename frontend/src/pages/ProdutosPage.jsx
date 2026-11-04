import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import FilterSelect from "../components/FilterSelect.jsx";
import {
    atualizarExibicaoCardapio,
    excluirItemCardapio,
    listarProdutos,
    produtoExibeNoCardapio
} from "../services/CardapioService";

const BACKEND_URL = "http://localhost:3000";

const FILTRO_OPTIONS = [
    { value: "Todos", label: "Todos" },
    { value: "Pratos", label: "Pratos" },
    { value: "Sobremesas", label: "Sobremesas" }
];

export default function ProdutosPage() {
    const navigate = useNavigate();
    const [produtos, setProdutos] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");
    const [busca, setBusca] = useState("");
    const [filtro, setFiltro] = useState("Todos");

    const [alternandoCardapioId, setAlternandoCardapioId] = useState(null);

    useEffect(() => {
        let ativo = true;

        const carregar = async () => {
            try {
                setCarregando(true);
                setErro("");

                const data = await listarProdutos();

                if (ativo) {
                    setProdutos(data);
                }
            } catch (error) {
                if (ativo) {
                    setErro(error.message || "Erro ao carregar produtos.");
                }
            } finally {
                if (ativo) {
                    setCarregando(false);
                }
            }
        };

        carregar();

        return () => {
            ativo = false;
        };
    }, []);

    const produtosFiltrados = useMemo(() => {
        const texto = busca.trim().toLowerCase();

        return produtos.filter((produto) => {
            const nome = String(produto.nome || "").toLowerCase();
            const descricao = String(produto.descricao || "").toLowerCase();
            const ehSobremesa = Boolean(produto.sobremesa);
            const correspondeTexto = !texto || nome.includes(texto) || descricao.includes(texto);

            if (filtro === "Pratos") {
                return correspondeTexto && !ehSobremesa;
            }

            if (filtro === "Sobremesas") {
                return correspondeTexto && ehSobremesa;
            }

            return correspondeTexto;
        });
    }, [busca, filtro, produtos]);

    const formatarPreco = (valor) => {
        const numero = Number(valor || 0);

        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL"
        }).format(numero);
    };

    const formatarDescricaoTabela = (descricao) => {
        const texto = String(descricao || "").trim();

        if (texto.length <= 60){
            return texto;
        }

        return `${texto.slice(0, 60)}...`;
    };

    const formatarNomeTabela = (nome) => {
        const texto = String(nome || "").trim();

        if (texto.length <= 20) {
            return texto;
        }

        return `${texto.slice(0, 20)}...`;
    };

    const obterImagem = (imagem) => {
        if (!imagem) {
            return "https://placehold.co/80x80";
        }

        return imagem.startsWith("http") ? imagem : `${BACKEND_URL}${imagem}`;
    };

    const handleToggleCardapio = async (produto) => {
        const exibir = !produtoExibeNoCardapio(produto);

        setAlternandoCardapioId(produto.id);
        setProdutos((current) =>
            current.map((item) =>
                item.id === produto.id ? { ...item, exibir_no_cardapio: exibir ? 1 : 0 } : item
            )
        );

        try {
            await atualizarExibicaoCardapio(produto.id, exibir);
        } catch (error) {
            setProdutos((current) =>
                current.map((item) =>
                    item.id === produto.id
                        ? { ...item, exibir_no_cardapio: produto.exibir_no_cardapio }
                        : item
                )
            );
            setErro(error.message || "Erro ao atualizar visibilidade no cardápio.");
        } finally {
            setAlternandoCardapioId(null);
        }
    };

    const handleExcluir = async (produto) => {
        const confirmado = window.confirm(`Excluir o produto "${produto.nome}"?`);

        if (!confirmado) {
            return;
        }

        try {
            await excluirItemCardapio(produto.id);
            setProdutos((current) => current.filter((item) => item.id !== produto.id));
        } catch (error) {
            setErro(error.message || "Erro ao excluir produto.");
        }
    };

    return (
        <main className="min-h-screen px-6 pb-10 pt-28 text-brand-primary md:px-10">
            <div className="mx-auto max-w-7xl">
                <div className="mb-10 flex items-start justify-between">
                    <div>
                        <p className="text-sm uppercase tracking-[0.35em] text-brand-primary">
                            Gestão do sistema
                        </p>
                        <h1 className="mt-3 text-4xl font-bold text-brand-primary md:text-5xl">
                            Produtos
                        </h1>
                        <p className="mt-3 max-w-2xl text-base leading-7 text-brand-text">
                            Gerencie o cardápio do Brasa Branca.
                        </p>
                    </div>
                    <div className="pt-10">
                        <button
                            type="button"
                            onClick={() => navigate("/produtos/add")}
                            className="rounded-xl bg-brand-primary px-6 py-3 font-semibold text-brand-surface shadow-[0_12px_30px_rgba(91,52,24,0.18)] transition hover:bg-brand-primary"
                        >
                            + Novo Produto
                        </button>
                    </div>
                </div>
                <div className="rounded-3xl border border-brand-border bg-brand-surface p-5 shadow-[0_18px_60px_rgba(91,52,24,0.14)] backdrop-blur-sm md:p-8">
                    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <input
                            placeholder="Pesquisar produto..."
                            value={busca}
                            onChange={(event) => setBusca(event.target.value)}
                            className="w-full rounded-xl border border-brand-border bg-brand-surface px-5 py-3 text-brand-primary placeholder:text-brand-muted outline-none transition focus:border-brand-accent md:w-80"
                        />
                        <FilterSelect
                            className="w-full md:w-52"
                            options={FILTRO_OPTIONS}
                            value={filtro}
                            onChange={setFiltro}
                            isClearable={false}
                            placeholder="Filtrar por tipo"
                        />
                    </div>
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-brand-border text-left text-sm uppercase tracking-wider text-brand-muted">
                                <th className="pb-5">Imagem</th>
                                <th className="pb-5">Nome</th>
                                <th className="pb-5">Tipo</th>
                                <th className="pb-5">Preço</th>
                                <th className="pb-5">Descrição</th>
                                <th className="pb-5 text-center">Cardápio</th>
                                <th className="pb-5 text-center">Ações</th>

                            </tr>
                        </thead>
                        <tbody>
                            {carregando ? (
                                <tr>
                                    <td className="py-10 text-brand-text" colSpan={7}>
                                        Carregando produtos...
                                    </td>
                                </tr>
                            ) : erro ? (
                                <tr>
                                    <td className="py-10 text-red-700" colSpan={7}>
                                        {erro}
                                    </td>
                                </tr>
                            ) : produtos.length === 0 ? (
                                <tr>
                                    <td className="py-10 text-brand-text" colSpan={7}>
                                        Nenhum produto cadastrado.
                                    </td>
                                </tr>
                            ) : produtosFiltrados.length === 0 ? (
                                <tr>
                                    <td className="py-10 text-brand-text" colSpan={7}>
                                        Nenhum produto encontrado.
                                    </td>
                                </tr>
                            ) : produtosFiltrados.map((produto) => (
                                <tr
                                    key={produto.id}
                                    className="group border-b border-brand-border transition-all duration-200 hover:bg-brand-panel hover:shadow-[inset_0_1px_0_rgba(61,35,21,0.08)]"
                                >
                                    <td className="py-5">
                                        <img
                                            src={obterImagem(produto.imagem)}
                                            alt={produto.nome}
                                            className="h-16 w-16 rounded-xl border border-brand-border object-cover transition-all duration-200 group-hover:scale-105 group-hover:border-brand-accent"
                                        />
                                    </td>
                                    <td className="font-semibold text-brand-primary transition-colors duration-200 group-hover:text-brand-ink">
                                        {formatarNomeTabela(produto.nome)}
                                    </td>
                                    <td>
                                        <span
                                            className={`rounded-full px-4 py-1 text-sm font-medium transition-all duration-200 ${produto.sobremesa
                                                    ? "bg-brand-accent text-brand-surface group-hover:bg-brand-accent"
                                                    : "bg-brand-primary text-brand-surface group-hover:bg-brand-ink"
                                                }`}
                                        >
                                            {produto.sobremesa ? "Sobremesa" : "Prato"}
                                        </span>
                                    </td>
                                    <td className="font-semibold text-brand-primary transition-colors duration-200 group-hover:text-brand-ink">
                                        {formatarPreco(produto.preco)}
                                    </td>
                                    <td className="max-w-sm text-brand-text transition-colors duration-200 group-hover:text-brand-primary">
                                        {formatarDescricaoTabela(produto.descricao)}
                                    </td>
                                    <td>
                                        <label className="flex cursor-pointer flex-col items-center gap-2 px-2 text-center">
                                            <input
                                                type="checkbox"
                                                checked={produtoExibeNoCardapio(produto)}
                                                disabled={alternandoCardapioId === produto.id}
                                                onChange={() => handleToggleCardapio(produto)}
                                                className="h-4 w-4 accent-brand-primary disabled:cursor-not-allowed disabled:opacity-60"
                                            />
                                            <span className="text-xs font-medium text-brand-text">
                                                {produtoExibeNoCardapio(produto) ? "No cardápio" : "Oculto"}
                                            </span>
                                        </label>
                                    </td>
                                    <td>
                                        <div className="flex justify-center gap-3">

                                            <button
                                                type="button"
                                                onClick={() => navigate(`/produtos/edit/${produto.id}`)}
                                                className="rounded-lg border border-brand-border px-4 py-2 text-brand-primary transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-panel hover:text-brand-ink hover:shadow-[0_10px_20px_rgba(91,52,24,0.10)]"
                                            >
                                                Editar
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => handleExcluir(produto)}
                                                className="rounded-lg border border-brand-border px-4 py-2 text-brand-primary transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-panel hover:text-brand-primary hover:shadow-[0_10px_20px_rgba(91,52,24,0.10)]"
                                            >
                                                Excluir
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </main>
    );
}
