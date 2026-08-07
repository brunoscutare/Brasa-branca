import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState
} from "react";
import { useAuth } from "./AuthContext";
import { buscarCarrinho, salvarCarrinho } from "../services/CarrinhoService";

const CartContext = createContext();
const GUEST_CART_KEY = "brasaBranca:cart";

function normalizarItem(produto) {
    return {
        id: produto.id,
        nome: produto.nome,
        preco: Number(produto.preco || 0),
        imagem: produto.imagem || "",
        quantidade: 1
    };
}

function lerCarrinhoVisitante() {
    const stored = localStorage.getItem(GUEST_CART_KEY);
    return stored ? JSON.parse(stored) : [];
}

export function CartProvider({ children }) {
    const { user } = useAuth();
    const [items, setItems] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const persistindoRef = useRef(false);

    useEffect(() => {
        let ativo = true;

        const carregar = async () => {
            setCarregando(true);
            persistindoRef.current = false;

            try {
                if (user?.id) {
                    const carrinho = await buscarCarrinho(user.id);

                    if (ativo) {
                        setItems(Array.isArray(carrinho) ? carrinho : []);
                    }
                } else if (ativo) {
                    setItems(lerCarrinhoVisitante());
                }
            } catch {
                if (ativo) {
                    setItems(user?.id ? [] : lerCarrinhoVisitante());
                }
            } finally {
                if (ativo) {
                    persistindoRef.current = true;
                    setCarregando(false);
                }
            }
        };

        carregar();

        return () => {
            ativo = false;
        };
    }, [user?.id]);

    useEffect(() => {
        if (!persistindoRef.current || carregando) {
            return undefined;
        }

        if (user?.id) {
            salvarCarrinho(user.id, items).catch(() => {});
            return undefined;
        }

        localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
        return undefined;
    }, [items, user?.id, carregando]);

    const addItem = useCallback((produto) => {
        setItems((prev) => {
            const existente = prev.find((item) => item.id === produto.id);

            if (existente) {
                return prev.map((item) =>
                    item.id === produto.id
                        ? { ...item, quantidade: item.quantidade + 1 }
                        : item
                );
            }

            return [...prev, normalizarItem(produto)];
        });
    }, []);

    const removeItem = useCallback((id) => {
        setItems((prev) => prev.filter((item) => item.id !== id));
    }, []);

    const changeQuantity = useCallback((id, delta) => {
        setItems((prev) =>
            prev
                .map((item) =>
                    item.id === id
                        ? { ...item, quantidade: item.quantidade + delta }
                        : item
                )
                .filter((item) => item.quantidade > 0)
        );
    }, []);

    const clearCart = useCallback(() => {
        setItems([]);
    }, []);

    const totalItems = useMemo(
        () => items.reduce((total, item) => total + item.quantidade, 0),
        [items]
    );

    const totalPreco = useMemo(
        () => items.reduce((total, item) => total + item.preco * item.quantidade, 0),
        [items]
    );

    return (
        <CartContext.Provider
            value={{
                items,
                carregando,
                addItem,
                removeItem,
                changeQuantity,
                clearCart,
                totalItems,
                totalPreco
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    return useContext(CartContext);
}
