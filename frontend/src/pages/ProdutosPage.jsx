import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { excluirItemCardapio, listarCardapio } from "../services/CardapioService";

const BACKEND_URL = "http://localhost:3000";

export default function ProdutosPage() {
    const navigate = useNavigate();
    const [produtos, setProdutos] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");
    const [busca, setBusca] = useState("");
    const [filtro, setFiltro] = useState("Todos");

    useEffect(() => {
        let ativo = true;

        const carregar = async () => {
            try {
                setCarregando(true);
                setErro("");

                const data = await listarCardapio();

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

        if (texto.length <= 70) {
            return texto;
        }

        return `${texto.slice(0, 70)}...`;
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
        <main className="min-h-screen px-6 pb-10 pt-28 text-[#6F370F] md:px-10">
            <div className="mx-auto max-w-7xl">
                <div className="mb-10 flex items-start justify-between">
                    <div>
                        <p className="text-sm uppercase tracking-[0.35em] text-[#5B3418]">
                            Gestão do sistema
                        </p>
                        <h1 className="mt-3 text-4xl font-bold text-[#5B3418] md:text-5xl">
                            Produtos
                        </h1>
                        <p className="mt-3 max-w-2xl text-base leading-7 text-[#7A4A2A]">
                            Gerencie o cardápio do Brasa Branca.
                        </p>
                    </div>
                    <div className="pt-10">

                        <button
                            type="button"
                            onClick={() => navigate("/produtos/add")}
                            className="rounded-xl bg-[#8B4513] px-6 py-3 font-semibold text-[#FAF3E7] shadow-[0_12px_30px_rgba(91,52,24,0.18)] transition hover:bg-[#6F370F]"
                        >
                            + Novo Produto
                        </button>
                    </div>
                </div>
                <div className="rounded-3xl border border-[#8B4513]/18 bg-[#FAF3E7]/72 p-5 shadow-[0_18px_60px_rgba(91,52,24,0.14)] backdrop-blur-sm md:p-8">
                    <div className="mb-6 flex items-center justify-between">
                        <input
                            placeholder="Pesquisar produto..."
                            value={busca}
                            onChange={(event) => setBusca(event.target.value)}
                            className="w-full rounded-xl border border-[#8B4513]/20 bg-[#FAF3E7] px-5 py-3 text-[#5B3418] placeholder:text-[#8B7B70] outline-none transition focus:border-[#8B4513] md:w-80"
                        />
                        <select
                            value={filtro}
                            onChange={(event) => setFiltro(event.target.value)}
                            className="rounded-xl border border-[#8B4513]/20 bg-[#FAF3E7] px-5 py-3 text-[#5B3418] outline-none transition focus:border-[#8B4513]"
                        >
                            <option>Todos</option>
                            <option>Pratos</option>
                            <option>Sobremesas</option>
                        </select>
                    </div>
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-[#8B4513]/15 text-left text-sm uppercase tracking-wider text-[#8B7B70]">
                                <th className="pb-5">Imagem</th>
                                <th className="pb-5">Nome</th>
                                <th className="pb-5">Tipo</th>
                                <th className="pb-5">Preço</th>
                                <th className="pb-5">Descrição</th>
                                <th className="pb-5 text-center">Ações</th>

                            </tr>
                        </thead>
                        <tbody>
                            {carregando ? (
                                <tr>
                                    <td className="py-10 text-[#7A4A2A]" colSpan={6}>
                                        Carregando produtos...
                                    </td>
                                </tr>
                            ) : erro ? (
                                <tr>
                                    <td className="py-10 text-red-700" colSpan={6}>
                                        {erro}
                                    </td>
                                </tr>
                            ) : produtos.length === 0 ? (
                                <tr>
                                    <td className="py-10 text-[#7A4A2A]" colSpan={6}>
                                        Nenhum produto cadastrado.
                                    </td>
                                </tr>
                            ) : produtosFiltrados.length === 0 ? (
                                <tr>
                                    <td className="py-10 text-[#7A4A2A]" colSpan={6}>
                                        Nenhum produto encontrado.
                                    </td>
                                </tr>
                            ) : produtosFiltrados.map((produto) => (
                                <tr
                                    key={produto.id}
                                    className="group border-b border-[#8B4513]/10 transition-all duration-200 hover:bg-[#F3E6D5]/80 hover:shadow-[inset_0_1px_0_rgba(139,69,19,0.08)]"
                                >
                                    <td className="py-5">
                                        <img
                                            src={obterImagem(produto.imagem)}
                                            alt={produto.nome}
                                            className="h-16 w-16 rounded-xl border border-[#8B4513]/12 object-cover transition-all duration-200 group-hover:scale-105 group-hover:border-[#8B4513]/25"
                                        />
                                    </td>
                                    <td className="font-semibold text-[#5B3418] transition-colors duration-200 group-hover:text-[#3F220F]">
                                        {formatarNomeTabela(produto.nome)}
                                    </td>
                                    <td>
                                        <span
                                            className={`rounded-full px-4 py-1 text-sm font-medium transition-all duration-200 ${produto.sobremesa
                                                    ? "bg-[#C08A3E] text-[#FAF3E7] group-hover:bg-[#A97026]"
                                                    : "bg-[#5B3418] text-[#FAF3E7] group-hover:bg-[#3F220F]"
                                                }`}
                                        >
                                            {produto.sobremesa ? "Sobremesa" : "Prato"}
                                        </span>
                                    </td>
                                    <td className="font-semibold text-[#5B3418] transition-colors duration-200 group-hover:text-[#3F220F]">
                                        {formatarPreco(produto.preco)}
                                    </td>
                                    <td className="max-w-sm text-[#7A4A2A] transition-colors duration-200 group-hover:text-[#5B3418]">
                                        {formatarDescricaoTabela(produto.descricao)}
                                    </td>
                                    <td>
                                        <div className="flex justify-center gap-3">

                                            <button className="rounded-lg border border-[#8B4513]/20 px-4 py-2 text-[#5B3418] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#F3E6D5] hover:text-[#3F220F] hover:shadow-[0_10px_20px_rgba(91,52,24,0.10)]">
                                                Editar
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => handleExcluir(produto)}
                                                className="rounded-lg border border-[#8B4513]/20 px-4 py-2 text-[#8B4513] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#F3E6D5] hover:text-[#5B3418] hover:shadow-[0_10px_20px_rgba(91,52,24,0.10)]"
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