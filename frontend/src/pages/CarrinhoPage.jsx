import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import PaymentModal from "../components/Payment/PaymentModal";

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
        <div className="inline-flex items-center rounded-full border border-brand-border bg-brand-surface">
            {item.quantidade >= 2 ? (
                <IconButton
                    label={`Remover uma unidade de ${item.nome}`}
                    onClick={onDecrease}
                    className="h-7 w-7 rounded-full text-brand-text/80 hover:text-brand-primary"
                >
                    <Minus size={12} strokeWidth={1.75} aria-hidden="true" />
                </IconButton>
            ) : null}
            <span className="min-w-7 px-1 text-center text-sm font-semibold tabular-nums text-brand-primary">
                {item.quantidade}
            </span>
            <IconButton
                label={`Adicionar uma unidade de ${item.nome}`}
                onClick={onIncrease}
                className="h-7 w-7 rounded-full text-brand-text/80 hover:text-brand-primary"
            >
                <Plus size={12} strokeWidth={1.75} aria-hidden="true" />
            </IconButton>
        </div>
    );
}

export default function CarrinhoPage() {
    const { user } = useAuth();
    const { items, carregando, changeQuantity, removeItem, totalPreco, clearCart } = useCart();
    const location = useLocation();
    const navigate = useNavigate();
    const [pagamentoAberto, setPagamentoAberto] = useState(false);

    useEffect(() => {
        if (!location.state?.abrirPagamento || carregando || !items.length) return;

        setPagamentoAberto(true);
        navigate(location.pathname, { replace: true, state: {} });
    }, [carregando, items.length, location.pathname, location.state, navigate]);

    const iniciarPagamento = () => {
        if (!user) {
            navigate("/login", { state: { from: "/carrinho", abrirPagamento: true } });
            return;
        }

        setPagamentoAberto(true);
    };

    const formatarPreco = (valor) =>
        new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL"
        }).format(Number(valor || 0));

    return (
        <main className="min-h-screen px-6 pb-16 pt-28 text-brand-primary md:px-10">
            <div className="mx-auto flex w-full max-w-4xl flex-col gap-10">
                <div>
                    <p className="text-sm uppercase tracking-[0.35em] text-brand-primary">
                        Pedido
                    </p>
                    <h1 className="mt-4 text-4xl font-semibold text-brand-primary md:text-5xl">
                        Carrinho
                    </h1>
                </div>

                {items.length === 0 ? (
                    <div className="rounded-3xl border border-brand-border bg-brand-surface px-8 py-10 text-center text-brand-text transition-all duration-300 hover:border-brand-accent hover:bg-brand-surface">
                        <p className="text-base leading-7">Seu carrinho está vazio.</p>
                        <Link
                            to="/homepage#cardapio"
                            className="mt-4 inline-block font-semibold text-brand-primary transition hover:text-brand-primary"
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
                                    className="group flex gap-4 rounded-3xl border border-brand-border bg-brand-surface px-4 py-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-accent hover:bg-brand-surface hover:shadow-[0_18px_60px_rgba(61,35,21,0.14)] md:gap-5 md:px-5"
                                >
                                    <img
                                        src={obterImagem(item.imagem)}
                                        alt={item.nome}
                                        className="h-16 w-16 shrink-0 rounded-xl border border-brand-border object-cover transition-all duration-200 group-hover:scale-105 group-hover:border-brand-accent md:h-[4.5rem] md:w-[4.5rem]"
                                    />

                                    <div className="flex min-w-0 flex-1 flex-col justify-center gap-3">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="min-w-0">
                                                <h2 className="truncate text-lg font-semibold text-brand-primary">
                                                    {item.nome}
                                                </h2>
                                                <p className="mt-1 text-sm leading-6 text-brand-text">
                                                    {formatarPreco(item.preco)} por unidade
                                                </p>
                                            </div>
                                            <p className="shrink-0 text-lg font-bold text-brand-primary">
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
                                                className="h-7 w-7 rounded-full text-brand-text/45 hover:text-brand-primary"
                                            >
                                                <Trash2 size={14} strokeWidth={1.5} aria-hidden="true" />
                                            </IconButton>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>

                        <div className="mt-4 flex items-center justify-between border-t border-brand-border pt-6">
                            <span className="text-sm uppercase tracking-[0.35em] text-brand-primary">
                                Total
                            </span>
                            <span className="text-xl font-light text-brand-primary">
                                {formatarPreco(totalPreco)}
                            </span>
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={iniciarPagamento}
                                className="rounded-full border border-brand-border bg-brand-surface px-5 py-2 text-xs font-medium uppercase tracking-[0.32em] text-brand-primary transition duration-300 hover:border-brand-accent hover:bg-brand-surface"
                            >
                                Pagar
                            </button>
                        </div>
                    </>
                )}
            </div>

            {pagamentoAberto ? (
                <PaymentModal
                    total={totalPreco}
                    items={items}
                    onClose={() => setPagamentoAberto(false)}
                    onSuccess={clearCart}
                />
            ) : null}
        </main>
    );
}
