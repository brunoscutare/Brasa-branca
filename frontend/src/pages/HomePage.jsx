import { useEffect, useMemo, useState } from "react";
import { listarCardapio } from "../services/CardapioService";

const BACKEND_URL = "http://localhost:3000";

function ehSobremesa(produto) {
    return produto.sobremesa === true || produto.sobremesa === 1;
}

function CardProduto({ produto, formatarPreco, obterImagem }) {
    return (
        <article className="group relative overflow-hidden rounded-3xl border border-[#8B4513]/18 bg-[#FAF3E7]/72 shadow-[0_18px_60px_rgba(91,52,24,0.14)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#8B4513]/28 hover:shadow-[0_22px_70px_rgba(91,52,24,0.18)]">
            <div className="relative h-72 overflow-hidden">
                <img
                    src={obterImagem(produto.imagem)}
                    alt={produto.nome}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
            </div>

            <div className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-full transform-gpu will-change-transform bg-gradient-to-t from-[#2A170A] via-[#4A2915]/95 to-transparent p-6 pt-24 text-[#FAF3E7] transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0">
                <h3 className="break-words whitespace-normal text-xl font-semibold leading-tight">
                    {produto.nome}
                </h3>
                <p className="mt-3 break-all whitespace-normal text-sm leading-6 text-[#FAF3E7]/90">
                    {produto.descricao}
                </p>
                <div className="mt-5 flex items-center justify-between">
                    <span className="text-lg font-bold text-[#F8D9A0]">
                        {formatarPreco(produto.preco)}
                    </span>
                    <span className="rounded-full bg-[#B88A44] px-3 py-1 text-xs font-semibold">
                        {ehSobremesa(produto) ? "Sobremesa" : "Prato"}
                    </span>
                </div>
            </div>
        </article>
    );
}

function GradeProdutos({ produtos, formatarPreco, obterImagem }) {
    if (produtos.length === 0) {
        return null;
    }

    return (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-[repeat(3,minmax(20rem,1fr))]">
            {produtos.map((produto) => (
                <CardProduto
                    key={produto.id}
                    produto={produto}
                    formatarPreco={formatarPreco}
                    obterImagem={obterImagem}
                />
            ))}
        </div>
    );
}

export default function HomePage() {
    const [produtos, setProdutos] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");

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
                    setErro(error.message || "Erro ao carregar o cardápio.");
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

    const pratos = useMemo(
        () => produtos.filter((produto) => !ehSobremesa(produto)),
        [produtos]
    );

    const sobremesas = useMemo(
        () => produtos.filter((produto) => ehSobremesa(produto)),
        [produtos]
    );

    const formatarPreco = (valor) => {
        const numero = Number(valor || 0);

        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL"
        }).format(numero);
    };

    const obterImagem = (imagem) => {
        if (!imagem) {
            return "https://placehold.co/640x420";
        }

        return imagem.startsWith("http") ? imagem : `${BACKEND_URL}${imagem}`;
    };

    return (
        <main className="min-h-screen text-[#6F370F]">
            <section
                id="inicio"
                className="flex min-h-screen scroll-mt-28 items-center justify-center px-6 pt-28"
            >
                <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 text-center">
                    <p className="text-sm uppercase tracking-[0.4em] text-[#5B3418]">
                        Brasa Branca
                    </p>
                    <h1 className="text-5xl font-semibold leading-tight text-[#5B3418] md:text-7xl">
                        Bem-vindo à sua experiência gastronômica.
                    </h1>
                </div>
            </section>

            <section
                id="cardapio"
                className="min-h-screen scroll-mt-28 border-t border-[#8B4513]/12 px-6 py-24"
            >
                <div className="mx-auto flex w-full max-w-7xl flex-col gap-10">
                    <div className="max-w-2xl">
                        <p className="text-sm uppercase tracking-[0.35em] text-[#5B3418]">
                            Cardápio
                        </p>
                        <h2 className="mt-4 text-4xl font-semibold text-[#5B3418] md:text-5xl">
                            Pratos principais e sobremesas do Brasa Branca.
                        </h2>
                        <p className="mt-4 text-base leading-7 text-[#7A4A2A]">
                            Os pratos vêm primeiro; as sobremesas ficam logo abaixo.
                        </p>
                    </div>

                    {carregando ? (
                        <p className="text-[#7A4A2A]">Carregando cardápio...</p>
                    ) : erro ? (
                        <p className="text-red-700">{erro}</p>
                    ) : produtos.length === 0 ? (
                        <p className="text-[#7A4A2A]">Nenhum item disponível no cardápio no momento.</p>
                    ) : (
                        <div className="flex flex-col gap-14">
                            <div className="flex flex-col gap-6">
                                <div>
                                    <h3 className="text-2xl font-semibold text-[#5B3418]">Pratos</h3>
                                    {pratos.length === 0 ? (
                                        <p className="mt-2 text-[#7A4A2A]">Nenhum prato disponível no momento.</p>
                                    ) : null}
                                </div>
                                <GradeProdutos
                                    produtos={pratos}
                                    formatarPreco={formatarPreco}
                                    obterImagem={obterImagem}
                                />
                            </div>

                            <div className="flex flex-col gap-6">
                                <div>
                                    <h3 className="text-2xl font-semibold text-[#5B3418]">Sobremesas</h3>
                                    {sobremesas.length === 0 ? (
                                        <p className="mt-2 text-[#7A4A2A]">Nenhuma sobremesa disponível no momento.</p>
                                    ) : null}
                                </div>
                                <GradeProdutos
                                    produtos={sobremesas}
                                    formatarPreco={formatarPreco}
                                    obterImagem={obterImagem}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
}