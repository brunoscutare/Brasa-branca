import { useEffect, useLayoutEffect, useRef, useState } from "react";
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
    ShoppingCart,
    LogOut,
    LogIn
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { isAdmin } from "../../utils/auth";

const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";
const DURATION_MS = 850;
const ITEM_SLOT = 52;
const BAR_PADDING = 58;
const SCROLL_OFFSET = 112;

function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (!element) return;

    const top = element.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET;
    window.scrollTo({ top, behavior: "smooth" });
}

function scrollToSectionWhenReady(sectionId, onDone) {
    let frames = 0;

    const attempt = () => {
        const element = document.getElementById(sectionId);

        if (element) {
            scrollToSection(sectionId);
            onDone?.();
            return;
        }

        if (frames++ < 120) {
            requestAnimationFrame(attempt);
        }
    };

    attempt();
}

function MenuButton({ icon, text, open, isActive, onClick }) {
    return (
        <button
            type="button"
            title={text}
            onClick={onClick}
            className={`relative z-10 flex flex-none items-center justify-center gap-2 rounded-full px-3 py-2 transition-colors duration-500 ease-out ${
                isActive
                    ? "bg-brand-on-dark/12 text-brand-on-dark shadow-[0_0_0_1px_rgba(255,243,228,0.18)]"
                    : "text-brand-on-dark hover:bg-brand-on-dark/5 hover:text-brand-background"
            }`}
        >
            <span className="shrink-0">{icon}</span>
            <span
                className="grid transition-[grid-template-columns] ease-[cubic-bezier(0.16,1,0.3,1)]"
                style={{
                    gridTemplateColumns: open ? "1fr" : "0fr",
                    transitionDuration: `${DURATION_MS}ms`
                }}
            >
                <span
                    className="overflow-hidden whitespace-nowrap text-sm font-medium"
                    style={{
                        opacity: open ? 1 : 0,
                        transition: `opacity ${DURATION_MS}ms ${EASE}`
                    }}
                >
                    {text}
                </span>
            </span>
        </button>
    );
}

export default function Topbar() {
    const [open, setOpen] = useState(false);
    const [openWidth, setOpenWidth] = useState(400);
    const [activeSection, setActiveSection] = useState("inicio");
    const measureRef = useRef(null);
    const pendingSectionRef = useRef(null);
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const isAdminUser = isAdmin(user);

    const sharedMenus = [
        { icon: <House size={20} />, text: "Início", sectionId: "inicio" },
        { icon: <UtensilsCrossed size={20} />, text: "Cardápio", sectionId: "cardapio" }
    ];

    const guestAndCommonMenus = !isAdminUser
        ? [{ icon: <ShoppingCart size={20} />, text: "Carrinho", path: "/carrinho" }]
        : [];

    const commonMenus = [
        { icon: <BadgeDollarSign size={20} />, text: "Pagamentos", path: "/pagamentos" },
        { icon: <NotebookText size={20} />, text: "Pedidos", path: "/pedidos" },
        { icon: <CircleUserRound size={20} />, text: "Perfil", path: "/perfil" },
        { icon: <Settings size={20} />, text: "Configurações", path: "/configuracoes" }
    ];

    const adminMenus = [
        { icon: <Package size={20} />, text: "Produtos", path: "/produtos" },
        { icon: <NotebookText size={20} />, text: "Pedidos", path: "/pedidos" },
        { icon: <Users size={20} />, text: "Clientes", path: "/clientes" },
        { icon: <Star size={20} />, text: "Avaliações", path: "/avaliacoes" },
        { icon: <BadgeDollarSign size={20} />, text: "Financeiro", path: "/financeiro" },
        { icon: <UserCog size={20} />, text: "Funcionários", path: "/funcionarios" },
        { icon: <CircleUserRound size={20} />, text: "Perfil", path: "/perfil" },
        { icon: <Settings size={20} />, text: "Configurações", path: "/configuracoes" }
    ];

    const menus = [...sharedMenus, ...guestAndCommonMenus, ...(isAdminUser ? adminMenus : user ? commonMenus : [])];
    const menuKey = menus.map((item) => item.text).join("|");
    const closedWidth = (menus.length + 1) * ITEM_SLOT + BAR_PADDING;

    useLayoutEffect(() => {
        const measure = () => {
            if (!measureRef.current) return;

            const measured = measureRef.current.offsetWidth;
            const max = window.innerWidth - 24;
            setOpenWidth(Math.min(measured, max));
        };

        measure();
        window.addEventListener("resize", measure);

        return () => window.removeEventListener("resize", measure);
    }, [menuKey, user]);

    const handleLogout = () => {
        logout();
        navigate("/homepage");
    };

    const handleAuthAction = () => {
        if (user) {
            handleLogout();
        } else {
            navigate("/login");
        }
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
                threshold: [0.35, 0.5, 0.65]
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

    useEffect(() => {
        if (location.pathname !== "/homepage") return undefined;

        const target = pendingSectionRef.current;
        if (!target) return undefined;

        scrollToSectionWhenReady(target, () => {
            pendingSectionRef.current = null;
        });

        return undefined;
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
            pendingSectionRef.current = item.sectionId;
            setActiveSection(item.sectionId);

            if (location.pathname !== "/homepage") {
                navigate("/homepage");
                return;
            }

            scrollToSectionWhenReady(item.sectionId, () => {
                pendingSectionRef.current = null;
            });
            return;
        }

        if (item.path) {
            navigate(item.path);
        }
    };

    const barWidth = open ? openWidth : closedWidth;
    const authLabel = user ? "Sair" : "Login";

    return (
        <>
            <div
                ref={measureRef}
                aria-hidden
                className="pointer-events-none invisible fixed left-0 top-0 flex h-16 items-center gap-1 px-3"
            >
                {menus.map((item) => (
                    <div key={item.text} className="flex flex-none items-center gap-2 rounded-full px-3 py-2">
                        {item.icon}
                        <span className="whitespace-nowrap text-sm font-medium">{item.text}</span>
                    </div>
                ))}
                <div className="mx-1 h-7 w-px" />
                <div className="flex flex-none items-center gap-2 rounded-full px-3 py-2">
                    {user ? <LogOut size={20} /> : <LogIn size={20} />}
                    <span className="whitespace-nowrap text-sm font-medium">{authLabel}</span>
                </div>
            </div>

            <div className="fixed left-1/2 top-4 z-50 -translate-x-1/2">
                <div
                    onMouseEnter={() => setOpen(true)}
                    onMouseLeave={() => setOpen(false)}
                    style={{
                        width: barWidth,
                        transition: `width ${DURATION_MS}ms ${EASE}`
                    }}
                    className="relative flex h-16 items-center justify-between gap-1 overflow-hidden rounded-full border border-brand-on-dark/10 bg-brand-ink/95 px-3 shadow-[0_18px_60px_rgba(0,0,0,0.45)] backdrop-blur-2xl will-change-[width]"
                >
                    <div className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-b from-white/10 via-transparent to-transparent opacity-70" />
                    <div className="pointer-events-none absolute left-1/2 top-1/2 h-8 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-ink/20 blur-xl" />

                    <div className="relative z-10 flex min-w-0 flex-1 items-center gap-1">
                        {menus.map((item) => (
                            <MenuButton
                                key={item.text}
                                icon={item.icon}
                                text={item.text}
                                open={open}
                                isActive={isActiveSectionMenu(item.sectionId) || isActiveMenu(item.path)}
                                onClick={() => handleMenuClick(item)}
                            />
                        ))}
                    </div>

                    <div className="relative z-10 flex flex-none items-center gap-1">
                        <div className="mx-1 h-7 w-px bg-brand-on-dark/10" />
                        <MenuButton
                            icon={user ? <LogOut size={20} /> : <LogIn size={20} />}
                            text={authLabel}
                            open={open}
                            isActive={false}
                            onClick={handleAuthAction}
                        />
                    </div>
                </div>
            </div>
        </>
    );
}
