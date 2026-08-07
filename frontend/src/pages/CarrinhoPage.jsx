import { Link } from "react-router-dom";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "../contexts/CartContext";

const BACKEND_URL = "http://localhost:3000";

function obterImagem(imagem) {
    if (!imagem) {
        return "https://placehold.co/120x120";
    }

    return imagem.startsWith("http") ? imagem : `${BACKEND_URL}${imagem}`;
}

function IconButton({ onClick, label, children, className = "" }) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-label={label}
            className={`inline-flex items-center justify-center transition duration-200 ${className}`}
        >
            {children}
        </button>
    );
}

function QuantityStepper({ item, onIncrease, onDecrease }) {
    return (
        <div className="inline-flex items-center rounded-full border border-[#8B4513]/20 bg-white/30">
            {item.quantidade >= 2 ? (
                <IconButton
                    label={`Remover uma unidade de ${item.nome}`}
                    onClick={onDecrease}
                    className="h-7 w-7 rounded-full text-[#7A4A2A]/80 hover:text-[#5B3418]"
                >
                    <Minus size={12} strokeWidth={1.75} aria-hidden="true" />
                </IconButton>
            ) : null}
            <span className="min-w-7 px-1 text-center text-sm font-semibold tabular-nums text-[#5B3418]">
                {item.quantidade}
            </span>
            <IconButton
                label={`Adicionar uma unidade de ${item.nome}`}
                onClick={onIncrease}
                className="h-7 w-7 rounded-full text-[#7A4A2A]/80 hover:text-[#5B3418]"
            >
                <Plus size={12} strokeWidth={1.75} aria-hidden="true" />
            </IconButton>
        </div>
    );
}

export default function CarrinhoPage() {
    const { items, changeQuantity, removeItem, totalPreco } = useCart();

    const formatarPreco = (valor) =>
        new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL"
        }).format(Number(valor || 0));

    return (
        <main className="min-h-screen px-6 pb-16 pt-28 text-[#6F370F] md:px-10">
            <div className="mx-auto flex w-full max-w-4xl flex-col gap-10">
                <div>
                    <p className="text-sm uppercase tracking-[0.35em] text-[#5B3418]">
                        Pedido
                    </p>
                    <h1 className="mt-4 text-4xl font-semibold text-[#5B3418] md:text-5xl">
                        Carrinho
                    </h1>
                </div>

                {items.length === 0 ? (
                    <div className="rounded-3xl border border-[#8B4513]/18 bg-[#FAF3E7]/72 px-8 py-10 text-center text-[#7A4A2A] transition-all duration-300 hover:border-[#8B4513]/28 hover:bg-[#FAF3E7]/90">
                        <p className="text-base leading-7">Seu carrinho está vazio.</p>
                        <Link
                            to="/homepage#cardapio"
                            className="mt-4 inline-block font-semibold text-[#8B4513] transition hover:text-[#6F370F]"
                        >
                            Ver cardápio
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="flex flex-col gap-3">
                            {items.map((item) => (
                                <article
                                    key={item.id}
                                    className="group flex gap-4 rounded-3xl border border-[#8B4513]/18 bg-[#FAF3E7]/72 px-4 py-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#8B4513]/28 hover:bg-[#FAF3E7]/90 hover:shadow-[0_18px_60px_rgba(91,52,24,0.14)] md:gap-5 md:px-5"
                                >
                                    <img
                                        src={obterImagem(item.imagem)}
                                        alt={item.nome}
                                        className="h-16 w-16 shrink-0 rounded-xl border border-[#8B4513]/12 object-cover transition-all duration-200 group-hover:scale-105 group-hover:border-[#8B4513]/25 md:h-[4.5rem] md:w-[4.5rem]"
                                    />

                                    <div className="flex min-w-0 flex-1 flex-col justify-center gap-3">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="min-w-0">
                                                <h2 className="truncate text-lg font-semibold text-[#5B3418]">
                                                    {item.nome}
                                                </h2>
                                                <p className="mt-1 text-sm leading-6 text-[#7A4A2A]">
                                                    {formatarPreco(item.preco)} por unidade
                                                </p>
                                            </div>
                                            <p className="shrink-0 text-lg font-bold text-[#8B4513]">
                                                {formatarPreco(item.preco * item.quantidade)}
                                            </p>
                                        </div>

                                        <div className="flex items-center justify-between gap-3">
                                            <QuantityStepper
                                                item={item}
                                                onIncrease={() => changeQuantity(item.id, 1)}
                                                onDecrease={() => changeQuantity(item.id, -1)}
                                            />

                                            <IconButton
                                                label={`Excluir ${item.nome} do carrinho`}
                                                onClick={() => removeItem(item.id)}
                                                className="h-7 w-7 rounded-full text-[#7A4A2A]/45 hover:text-[#8B4513]"
                                            >
                                                <Trash2 size={14} strokeWidth={1.5} aria-hidden="true" />
                                            </IconButton>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>

                        <div className="mt-4 flex items-center justify-between border-t border-[#8B4513]/15 pt-6">
                            <span className="text-sm uppercase tracking-[0.35em] text-[#5B3418]">
                                Total
                            </span>
                            <span className="text-xl font-light text-[#5B3418]">
                                {formatarPreco(totalPreco)}
                            </span>
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="button"
                                className="rounded-full border border-[#8B4513]/30 bg-[#FAF3E7]/50 px-5 py-2 text-xs font-medium uppercase tracking-[0.32em] text-[#5B3418] transition duration-300 hover:border-[#8B4513]/50 hover:bg-[#FAF3E7]/90"
                            >
                                Pagar
                            </button>
                        </div>
                    </>
                )}
            </div>
        </main>
    );
}
