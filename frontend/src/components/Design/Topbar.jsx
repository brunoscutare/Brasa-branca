import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
    House,
    NotebookText,
    Package,
    UtensilsCrossed,
    Users,
    Star,
    BadgeDollarSign,
    UserCog,
    CircleUserRound,
    Settings,
    ShoppingBag,
    ShoppingCart,
    ClipboardList,
    Heart,
    LogOut
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

export default function Topbar() {
    const [open, setOpen] = useState(false);
    const [activeSection, setActiveSection] = useState("inicio");
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const isAdmin = user?.superadmin || user?.funcao === "administrador";

    const menus = [
        { icon: <House size={20} />, text: "Início", sectionId: "inicio" },
        { icon: <UtensilsCrossed size={20} />, text: "Cardápio", sectionId: "cardapio" },
        ...(!isAdmin ? [
            { icon: <ShoppingCart size={20} />, text: "Meu carrinho", path: "/carrinho" },
            { icon: <Heart size={20} />, text: "Favoritos", path: "/favoritos" },
            { icon: <BadgeDollarSign size={20} />, text: "Pagamentos", path: "/pagamentos" },
            { icon: <NotebookText size={20} />, text: "Pedidos", path: "/pedidos" }
        ] : []),
        ...(isAdmin ? [
            { icon: <Users size={20} />, text: "Clientes", path: "/clientes" },
            { icon: <Star size={20} />, text: "Avaliações", path: "/avaliacoes" },
            { icon: <BadgeDollarSign size={20} />, text: "Financeiro", path: "/financeiro" },
            { icon: <UserCog size={20} />, text: "Funcionários", path: "/funcionarios" }
        ] : []),
        { icon: <CircleUserRound size={20} />, text: "Perfil", path: "/perfil" },
        { icon: <Settings size={20} />, text: "Configurações", path: "/configuracoes" }
    ];

    const getBarWidth = (isExpanded, itemCount) => {
        const iconSlot = isExpanded ? 126 : 70;
        const safetyPadding = isExpanded ? 120 : 96;
        return `${Math.max(safetyPadding, itemCount * iconSlot + safetyPadding)}px`;
    };

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    useEffect(() => {
        const sectionIds = ["inicio", "cardapio"];

        const observer = new IntersectionObserver(
            (entries) => {
                const visibleEntry = entries
                    .filter((entry) => entry.isIntersecting)
                    .sort((left, right) => right.intersectionRatio - left.intersectionRatio)[0];

                if (visibleEntry?.target?.id) {
                    setActiveSection(visibleEntry.target.id);
                }
            },
            {
                root: null,
                threshold: [0.35, 0.5, 0.65],
            }
        );

        sectionIds.forEach((sectionId) => {
            const element = document.getElementById(sectionId);
            if (element) {
                observer.observe(element);
            }
        });

        return () => observer.disconnect();
    }, [location.pathname]);

    const isActiveMenu = (path) => {
        if (!path) {
            return false;
        }

        return location.pathname === path || location.pathname.startsWith(`${path}/`);
    };

    const isActiveSectionMenu = (sectionId) => {
        return location.pathname === "/homepage" && activeSection === sectionId;
    };

    const handleMenuClick = (item) => {
        if (item.sectionId) {
            if (location.pathname !== "/homepage") {
                navigate("/homepage", { replace: false });
                window.setTimeout(() => {
                    document.getElementById(item.sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" });
                }, 0);
                return;
            }

            document.getElementById(item.sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" });
            return;
        }

        if (item.path) {
            navigate(item.path);
        }
    };

    return (
        <div className="fixed left-1/2 top-4 z-50 -translate-x-1/2">
            <div
                onMouseEnter={() => setOpen(true)}
                onMouseLeave={() => setOpen(false)}
                style={{ width: getBarWidth(open, menus.length + 1) }}
                className="relative flex h-16 items-center justify-between gap-1 overflow-hidden rounded-full border border-white/10 bg-[#1A100B]/75 px-3 shadow-[0_18px_60px_rgba(0,0,0,0.45)] backdrop-blur-2xl transition-[width] duration-500 ease-[cubic-bezier(.34,1.56,.64,1)]"
            >
                <div className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-b from-white/10 via-transparent to-transparent opacity-70" />
                <div className="pointer-events-none absolute left-1/2 top-1/2 h-8 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/20 blur-xl" />

                {menus.map((item) => (
                    <button
                        key={item.text}
                        type="button"
                        title={item.text}
                        onClick={() => handleMenuClick(item)}
                        className={`relative z-10 flex flex-none items-center justify-center gap-2 rounded-full px-3 py-2 transition-all duration-300 ${
                            isActiveSectionMenu(item.sectionId) || isActiveMenu(item.path)
                                ? "bg-[#F3D7B6]/14 text-[#F3D7B6] shadow-[0_0_0_1px_rgba(243,215,182,0.18)]"
                                : "text-white hover:bg-white/5 hover:text-[#E8C39A]"
                        }`}
                    >
                        <span className="shrink-0">{item.icon}</span>
                        <span
                            style={{
                                maxWidth: open ? "9rem" : "0px",
                                opacity: open ? 1 : 0,
                                transform: open ? "translateX(0)" : "translateX(-6px)",
                                transition: "max-width 300ms ease, opacity 220ms ease, transform 300ms ease"
                            }}
                            className="overflow-hidden whitespace-nowrap text-sm font-medium"
                        >
                            {item.text}
                        </span>
                    </button>
                ))}

                <div className="mx-1 h-7 w-px bg-white/10" />

                <button
                    type="button"
                    onClick={handleLogout}
                    title="Sair"
                    className="relative z-10 flex flex-none items-center justify-center gap-2 rounded-full px-3 py-2 text-white transition-all duration-300 hover:bg-white/5 hover:text-[#F0B79B]"
                >
                    <LogOut size={20} className="shrink-0" />
                    <span
                        style={{
                            maxWidth: open ? "7rem" : "0px",
                            opacity: open ? 1 : 0,
                            transform: open ? "translateX(0)" : "translateX(-6px)",
                            transition: "max-width 300ms ease, opacity 220ms ease, transform 300ms ease"
                        }}
                        className="overflow-hidden whitespace-nowrap text-sm font-medium"
                    >
                        Sair
                    </span>
                </button>
            </div>
        </div>
    );
}
