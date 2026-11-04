import { forwardRef, useEffect, useRef, useState } from "react";
import {
    ArrowLeft,
    Check,
    ChevronRight,
    CircleHelp,
    CreditCard,
    LockKeyhole,
    MapPin,
    ShieldCheck,
    Sparkles,
    X
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { listarCartoes } from "../../services/CartaoService";
import { criarPedido } from "../../services/PedidoService";
import { buscarPerfil } from "../../services/PerfilService";

const BRANDS = [
    { id: "visa", name: "Visa", detail: "Crédito e débito", tone: "border-[#1a4b9b]/20 bg-[#edf4ff] text-[#173d80]" },
    { id: "mastercard", name: "Mastercard", detail: "Crédito e débito", tone: "border-[#e35b32]/20 bg-[#fff4ed] text-[#9a321e]" },
    { id: "elo", name: "Elo", detail: "Crédito e débito", tone: "border-[#111827]/15 bg-[#f6f6f6] text-[#111827]" },
    { id: "amex", name: "American Express", detail: "Crédito", tone: "border-[#1677b9]/20 bg-[#edfaff] text-[#12628e]" },
];

function formatarPreco(valor) {
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL"
    }).format(Number(valor || 0));
}

function formatarNumeroCartao(valor) {
    return valor
        .replace(/\D/g, "")
        .slice(0, 16)
        .replace(/(.{4})/g, "$1 ")
        .trim();
}

function formatarValidade(valor) {
    const digits = valor.replace(/\D/g, "").slice(0, 4);
    return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
}

function formatarCep(valor) {
    const digits = valor.replace(/\D/g, "").slice(0, 8);
    return digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
}

function BrandMark({ brand, large = false }) {
    if (brand === "mastercard") {
        return (
            <span className={`inline-flex items-center ${large ? "scale-125" : ""}`} aria-label="Mastercard">
                <span className="h-5 w-5 rounded-full bg-[#eb001b]" />
                <span className="-ml-2 h-5 w-5 rounded-full bg-[#f79e1b]/90" />
            </span>
        );
    }

    if (brand === "visa") {
        return <span className={`font-black italic tracking-[-0.12em] ${large ? "text-2xl" : "text-xl"}`}>VISA</span>;
    }

    if (brand === "amex") {
        return <span className={`font-black tracking-[-0.06em] ${large ? "text-sm" : "text-[0.7rem]"}`}>AMERICAN EXPRESS</span>;
    }

    return <span className={`font-black italic tracking-[-0.1em] ${large ? "text-2xl" : "text-xl"}`}>elo</span>;
}

const Field = forwardRef(function Field({ label, hint, error, ...props }, ref) {
    return (
        <label className="block">
            <span className="mb-2 flex items-center justify-between gap-3 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#6f513b]">
                <span>{label}</span>
                {hint ? <span className="normal-case tracking-normal text-[#9b8069]">{hint}</span> : null}
            </span>
            <input
                {...props}
                ref={ref}
                className={`w-full rounded-xl border bg-white/75 px-4 py-3 text-sm text-[#3f2415] outline-none transition placeholder:text-[#b8a18c] focus:border-[#8b4513]/60 focus:bg-white focus:ring-4 focus:ring-[#8b4513]/10 ${error ? "border-red-400" : "border-[#8b4513]/18"}`}
            />
            {error ? <span className="mt-1 block text-xs text-red-600">{error}</span> : null}
        </label>
    );
});

function CardPreview({ brand, form }) {
    const selectedBrand = BRANDS.find((item) => item.id === brand);
    const number = form.numero || "0000 0000 0000 0000";
    const holder = form.nome || "NOME DO TITULAR";
    const expiry = form.validade || "MM/AA";

    return (
        <div className="relative overflow-hidden rounded-2xl bg-[linear-gradient(135deg,#3a2117_0%,#7a401e_52%,#b97942_100%)] p-5 text-[#fff8ef] shadow-[0_20px_45px_rgba(76,39,17,0.28)]">
            <div className="absolute -right-16 -top-20 h-48 w-48 rounded-full border border-white/10" />
            <div className="absolute -bottom-24 -left-20 h-52 w-52 rounded-full border border-white/10" />
            <div className="relative flex min-h-[168px] flex-col justify-between">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <span className="h-7 w-9 rounded-md border border-white/30 bg-gradient-to-br from-[#f5d790] to-[#a8792c]" />
                        <span className="text-xs text-white/60">•••</span>
                    </div>
                    <span className="text-white/90"><BrandMark brand={brand} large /></span>
                </div>
                <div>
                    <p className="font-mono text-lg tracking-[0.12em] text-white/95">{number}</p>
                    <div className="mt-4 flex items-end justify-between gap-4 text-[0.58rem] uppercase tracking-[0.16em] text-white/65">
                        <span className="truncate">{holder}</span>
                        <span className="shrink-0">{expiry}</span>
                    </div>
                </div>
            </div>
            {!selectedBrand ? <span className="sr-only">Bandeira não selecionada</span> : null}
        </div>
    );
}

export default function PaymentModal({ total, items, onClose, onSuccess }) {
    const { user } = useAuth();
    const [step, setStep] = useState("address");
    const [endereco, setEndereco] = useState({ cep: "", rua: "", numero: "", complemento: "", bairro: "", cidade: "Araraquara", estado: "SP" });
    const [enderecoErrors, setEnderecoErrors] = useState({});
    const [consultandoCep, setConsultandoCep] = useState(false);
    const [enderecoSalvo, setEnderecoSalvo] = useState(null);
    const [modoEndereco, setModoEndereco] = useState("novo");
    const [brand, setBrand] = useState("");
    const [form, setForm] = useState({ numero: "", nome: "", validade: "", cvv: "" });
    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);
    const [completed, setCompleted] = useState(false);
    const [submitError, setSubmitError] = useState("");
    const [pedidoCriado, setPedidoCriado] = useState(null);
    const [cartoesSalvos, setCartoesSalvos] = useState([]);
    const [cartaoSalvoSelecionado, setCartaoSalvoSelecionado] = useState(null);
    const [carregandoCartoes, setCarregandoCartoes] = useState(false);
    const numberRef = useRef(null);

    useEffect(() => {
        const onKeyDown = (event) => {
            if (event.key === "Escape" && !processing) onClose();
        };

        document.addEventListener("keydown", onKeyDown);
        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener("keydown", onKeyDown);
            document.body.style.overflow = "";
        };
    }, [onClose, processing]);

    useEffect(() => {
        if (step === "card") numberRef.current?.focus();
    }, [step]);

    useEffect(() => {
        if (!user?.id) return undefined;

        let ativo = true;
        setCarregandoCartoes(true);

        listarCartoes(user.id)
            .then((cartoes) => {
                if (ativo) setCartoesSalvos(cartoes);
            })
            .catch(() => {
                if (ativo) setCartoesSalvos([]);
            })
            .finally(() => {
                if (ativo) setCarregandoCartoes(false);
            });

        return () => {
            ativo = false;
        };
    }, [user?.id]);

    useEffect(() => {
        if (!user?.id) return undefined;

        let ativo = true;
        buscarPerfil(user.id)
            .then((perfil) => {
                if (!ativo || !perfil.endereco) return;
                setEnderecoSalvo(perfil.endereco);
                setEndereco(perfil.endereco);
                setModoEndereco("salvo");
            })
            .catch(() => {});

        return () => { ativo = false; };
    }, [user?.id]);

    useEffect(() => {
        const cep = endereco.cep.replace(/\D/g, "");

        if (cep.length !== 8) {
            setConsultandoCep(false);
            return undefined;
        }

        const controller = new AbortController();
        setConsultandoCep(true);
        setEnderecoErrors((current) => ({ ...current, cep: "" }));

        fetch(`https://viacep.com.br/ws/${cep}/json/`, { signal: controller.signal })
            .then((response) => response.json())
            .then((data) => {
                if (data.erro) {
                    setEnderecoErrors((current) => ({ ...current, cep: "CEP não encontrado." }));
                    return;
                }

                setEndereco((current) => ({
                    ...current,
                    rua: data.logradouro || current.rua,
                    bairro: data.bairro || current.bairro,
                    cidade: data.localidade || current.cidade,
                    estado: data.uf || current.estado
                }));
            })
            .catch((error) => {
                if (error.name !== "AbortError") {
                    setEnderecoErrors((current) => ({ ...current, cep: "Não foi possível consultar o CEP." }));
                }
            })
            .finally(() => {
                if (!controller.signal.aborted) setConsultandoCep(false);
            });

        return () => controller.abort();
    }, [endereco.cep]);

    const updateForm = (field, value) => {
        setForm((current) => ({ ...current, [field]: value }));
        setErrors((current) => ({ ...current, [field]: "" }));
    };

    const updateEndereco = (field, value) => {
        setEndereco((current) => ({ ...current, [field]: value }));
        setEnderecoErrors((current) => ({ ...current, [field]: "" }));
    };

    const handleAddressSubmit = (event) => {
        event.preventDefault();

        if (modoEndereco === "salvo" && enderecoSalvo) {
            setStep("brand");
            return;
        }

        const nextErrors = {};

        ["cep", "rua", "numero", "bairro", "cidade", "estado"].forEach((field) => {
            if (!endereco[field].trim()) nextErrors[field] = "Obrigatório";
        });

        if (endereco.cep.replace(/\D/g, "").length !== 8) {
            nextErrors.cep = "Informe um CEP válido.";
        }

        setEnderecoErrors(nextErrors);
        if (Object.keys(nextErrors).length === 0) setStep("brand");
    };

    const selecionarEnderecoSalvo = () => {
        if (!enderecoSalvo) return;
        setEndereco(enderecoSalvo);
        setEnderecoErrors({});
        setModoEndereco("salvo");
    };

    const escolherOutroEndereco = () => {
        setModoEndereco("novo");
        setEnderecoErrors({});
        setEndereco({ cep: "", rua: "", numero: "", complemento: "", bairro: "", cidade: "Araraquara", estado: "SP" });
    };

    const handleBrandSelect = (brandId) => {
        setCartaoSalvoSelecionado(null);
        setBrand(brandId);
        setStep("card");
    };

    const validate = () => {
        const nextErrors = {};
        const digits = form.numero.replace(/\D/g, "");
        const expiry = form.validade.replace(/\D/g, "");

        if (digits.length < 16) nextErrors.numero = "Informe os 16 dígitos do cartão.";
        if (!form.nome.trim()) nextErrors.nome = "Informe o nome impresso no cartão.";
        if (expiry.length !== 4 || Number(expiry.slice(0, 2)) < 1 || Number(expiry.slice(0, 2)) > 12) {
            nextErrors.validade = "Informe uma validade válida.";
        }
        if (form.cvv.replace(/\D/g, "").length < 3) nextErrors.cvv = "Informe o código de segurança.";

        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const finalizarPedido = async (pagamento) => {
        if (!user?.id) {
            setSubmitError("Entre na sua conta para salvar o pedido e o cartão.");
            return;
        }

        setProcessing(true);
        setSubmitError("");

        try {
            const data = await criarPedido(user.id, { items, endereco, ...pagamento });
            setPedidoCriado(data.pedido);
            setProcessing(false);
            setCompleted(true);
            onSuccess?.(data.pedido);
        } catch (error) {
            setProcessing(false);
            setSubmitError(error.message || "Não foi possível registrar o pedido.");
        }
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        if (!validate()) return;

        finalizarPedido({
            cartao: {
                bandeira: brand,
                numero: form.numero,
                nome: form.nome,
                validade: form.validade
            }
        });
    };

    const selectedBrand = BRANDS.find((item) => item.id === brand);

    return (
        <div
            className="fixed inset-0 z-[120] flex items-end justify-center bg-[#29170d]/65 p-0 backdrop-blur-sm sm:items-center sm:p-5"
            role="presentation"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget && !processing) onClose();
            }}
        >
            <section
                role="dialog"
                aria-modal="true"
                aria-labelledby="payment-title"
                className="max-h-[94vh] w-full max-w-5xl overflow-y-auto rounded-t-[2rem] border border-[#8b4513]/15 bg-[#fbf5ed] shadow-[0_28px_90px_rgba(49,24,8,0.32)] sm:rounded-[2rem]"
            >
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#8b4513]/12 bg-[#fbf5ed]/95 px-5 py-4 backdrop-blur md:px-8">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#5b3418] text-[#f7dfc4]">
                            <LockKeyhole size={18} />
                        </div>
                        <div>
                            <h2 id="payment-title" className="font-semibold text-[#4c2a17]">Pagamento seguro</h2>
                            <p className="text-xs text-[#92745c]">Finalize seu pedido Brasa Branca</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        aria-label="Fechar pagamento"
                        onClick={onClose}
                        disabled={processing}
                        className="rounded-full p-2 text-[#7a5a43] transition hover:bg-[#8b4513]/10 hover:text-[#4c2a17] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        <X size={20} />
                    </button>
                </div>

                {completed ? (
                    <div className="flex flex-col items-center px-6 py-16 text-center md:px-12">
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                            <Check size={38} strokeWidth={2.5} />
                        </div>
                        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.28em] text-emerald-700">Pagamento aprovado</p>
                        <h3 className="mt-3 text-3xl font-semibold text-[#4c2a17]">Pedido recebido!</h3>
                        <p className="mt-3 max-w-md text-sm leading-7 text-[#7a5a43]">
                            Seu pagamento foi registrado e o pedido já está disponível no seu histórico.
                        </p>
                        <div className="mt-7 rounded-2xl border border-[#8b4513]/12 bg-white/60 px-6 py-4 text-sm text-[#5b3418]">
                            Código do pedido <strong className="ml-1">#{pedidoCriado?.id || "—"}</strong>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="mt-8 rounded-full bg-[#5b3418] px-7 py-3 text-sm font-semibold text-[#fff8ef] transition hover:bg-[#7a401e]"
                        >
                            Voltar para o carrinho
                        </button>
                    </div>
                ) : (
                    <div className="grid gap-8 p-5 md:grid-cols-[1.2fr_0.8fr] md:p-8">
                        <div>
                            <div className="mb-7 flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em]">
                                <span className={step === "address" ? "text-[#5b3418]" : "text-[#a98e75]"}>1. Endereço</span>
                                <span className="h-px w-8 bg-[#8b4513]/18" />
                                <span className={step === "brand" ? "text-[#5b3418]" : "text-[#a98e75]"}>2. Bandeira</span>
                                <span className="h-px w-8 bg-[#8b4513]/18" />
                                <span className={step === "card" ? "text-[#5b3418]" : "text-[#a98e75]"}>3. Cartão</span>
                            </div>

                            {step === "address" ? (
                                <form onSubmit={handleAddressSubmit} autoComplete="off">
                                    <div className="mb-6">
                                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#9b8069]">Onde entregar?</p>
                                        <h3 className="mt-2 text-2xl font-semibold text-[#4c2a17]">Informe o endereço de entrega</h3>
                                        <p className="mt-2 text-sm leading-6 text-[#846a54]">Usaremos este endereço para organizar a entrega do seu pedido.</p>
                                    </div>

                                    {enderecoSalvo ? (
                                        <div className="mb-6">
                                            <div className="mb-3 flex items-center justify-between gap-3">
                                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9b8069]">Endereço salvo</p>
                                                <button type="button" onClick={modoEndereco === "salvo" ? escolherOutroEndereco : selecionarEnderecoSalvo} className="text-xs font-semibold text-[#8b4513] underline-offset-4 hover:underline">
                                                    {modoEndereco === "salvo" ? "Usar outro endereço" : "Usar endereço salvo"}
                                                </button>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={selecionarEnderecoSalvo}
                                                className={`flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition ${modoEndereco === "salvo" ? "border-[#8b4513] bg-[#f5e6d4] shadow-[0_8px_22px_rgba(91,52,24,0.08)]" : "border-[#8b4513]/18 bg-white/55 hover:border-[#8b4513]/45"}`}
                                            >
                                                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#5b3418] text-[#fff8ef]"><MapPin size={17} /></span>
                                                <span className="min-w-0 flex-1">
                                                    <strong className="block text-sm text-[#4c2a17]">{enderecoSalvo.rua}, {enderecoSalvo.numero}</strong>
                                                    <span className="mt-1 block text-xs leading-5 text-[#846a54]">{enderecoSalvo.bairro} · {enderecoSalvo.cidade}/{enderecoSalvo.estado} · CEP {enderecoSalvo.cep}</span>
                                                </span>
                                                <span className={`mt-1 h-4 w-4 shrink-0 rounded-full border ${modoEndereco === "salvo" ? "border-[#8b4513] bg-[#8b4513] shadow-[inset_0_0_0_3px_#f5e6d4]" : "border-[#b99b80]"}`} />
                                            </button>
                                        </div>
                                    ) : null}

                                    {modoEndereco === "novo" || !enderecoSalvo ? <div className="grid gap-4">
                                        <Field label="CEP" hint={consultandoCep ? "Consultando endereço..." : ""} placeholder="00000-000" value={endereco.cep} onChange={(event) => updateEndereco("cep", formatarCep(event.target.value))} inputMode="numeric" maxLength={9} autoComplete="new-password" error={enderecoErrors.cep} />
                                        <Field label="Rua" placeholder="Nome da rua ou avenida" value={endereco.rua} onChange={(event) => updateEndereco("rua", event.target.value)} autoComplete="new-password" error={enderecoErrors.rua} />
                                        <div className="grid grid-cols-2 gap-4">
                                            <Field label="Número" placeholder="123" value={endereco.numero} onChange={(event) => updateEndereco("numero", event.target.value.slice(0, 20))} inputMode="numeric" autoComplete="new-password" error={enderecoErrors.numero} />
                                            <Field label="Complemento" hint="Opcional" placeholder="Apto, casa..." value={endereco.complemento} onChange={(event) => updateEndereco("complemento", event.target.value)} autoComplete="new-password" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <Field label="Bairro" placeholder="Seu bairro" value={endereco.bairro} onChange={(event) => updateEndereco("bairro", event.target.value)} autoComplete="new-password" error={enderecoErrors.bairro} />
                                            <Field label="Cidade" placeholder="Araraquara" value={endereco.cidade} onChange={(event) => updateEndereco("cidade", event.target.value)} autoComplete="new-password" error={enderecoErrors.cidade} />
                                        </div>
                                        <Field label="Estado" placeholder="SP" value={endereco.estado} onChange={(event) => updateEndereco("estado", event.target.value.toUpperCase().slice(0, 2))} autoComplete="new-password" maxLength={2} error={enderecoErrors.estado} />
                                    </div> : <div className="rounded-2xl border border-emerald-500/20 bg-emerald-50/55 p-4 text-sm text-emerald-800"><strong>Endereço selecionado.</strong><p className="mt-1 text-xs leading-5">Confira os dados acima e continue para escolher o pagamento.</p></div>}

                                    <button type="submit" className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-[#5b3418] px-5 py-3.5 text-sm font-semibold text-[#fff8ef] transition hover:bg-[#7a401e]">
                                        Continuar para pagamento <ChevronRight size={17} />
                                    </button>
                                </form>
                            ) : step === "brand" ? (
                                <div>
                                    <div className="mb-6">
                                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#9b8069]">Escolha como pagar</p>
                                        <h3 className="mt-2 text-2xl font-semibold text-[#4c2a17]">Qual é a bandeira do seu cartão?</h3>
                                        <p className="mt-2 text-sm leading-6 text-[#846a54]">Você poderá preencher os dados do cartão na próxima etapa.</p>
                                    </div>

                                    {carregandoCartoes ? <p className="mb-5 text-sm text-[#92745c]">Carregando seus cartões salvos...</p> : null}
                                    {cartoesSalvos.length ? (
                                        <div className="mb-7">
                                            <div className="mb-3 flex items-center justify-between gap-3">
                                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9b8069]">Seus cartões</p>
                                                <span className="text-xs text-[#a0846b]">Escolha um para pagar</span>
                                            </div>
                                            <div className="grid gap-3">
                                                {cartoesSalvos.map((cartao) => {
                                                    const selecionado = cartaoSalvoSelecionado?.id === cartao.id;
                                                    return (
                                                        <button
                                                            type="button"
                                                            key={cartao.id}
                                                            onClick={() => setCartaoSalvoSelecionado(cartao)}
                                                            className={`flex items-center gap-4 rounded-2xl border p-4 text-left transition ${selecionado ? "border-[#8b4513] bg-[#f3e1cd] shadow-[0_10px_22px_rgba(91,52,24,0.1)]" : "border-[#8b4513]/15 bg-white/55 hover:border-[#8b4513]/40 hover:bg-white/80"}`}
                                                        >
                                                            <span className="flex h-10 w-14 items-center justify-center rounded-xl bg-[#5b3418] text-xs text-[#fff8ef]"><BrandMark brand={cartao.bandeira} /></span>
                                                            <span className="min-w-0 flex-1">
                                                                <span className="block text-sm font-semibold text-[#4c2a17]">{cartao.bandeira} •••• {cartao.ultimos_digitos}</span>
                                                                <span className="mt-1 block truncate text-xs uppercase tracking-[0.12em] text-[#92745c]">{cartao.nome}</span>
                                                            </span>
                                                            <span className={`flex h-5 w-5 items-center justify-center rounded-full border ${selecionado ? "border-[#8b4513] bg-[#8b4513] text-white" : "border-[#8b4513]/25 text-transparent"}`} aria-hidden="true">✓</span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                            {cartaoSalvoSelecionado ? (
                                                <button
                                                    type="button"
                                                    onClick={() => finalizarPedido({ cartao_id: cartaoSalvoSelecionado.id })}
                                                    disabled={processing}
                                                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#5b3418] px-5 py-3.5 text-sm font-semibold text-[#fff8ef] transition hover:bg-[#7a401e] disabled:cursor-wait disabled:opacity-75"
                                                >
                                                    {processing ? "Processando pagamento..." : `Pagar com •••• ${cartaoSalvoSelecionado.ultimos_digitos}`}
                                                    {!processing ? <LockKeyhole size={16} /> : null}
                                                </button>
                                            ) : null}
                                            {submitError ? <p className="mt-4 rounded-xl border border-red-400/30 bg-red-50/70 px-4 py-3 text-sm text-red-700">{submitError}</p> : null}
                                            <div className="mt-7 flex items-center gap-3 text-xs uppercase tracking-[0.18em] text-[#a0846b]"><span className="h-px flex-1 bg-[#8b4513]/12" /><span>ou adicione outro cartão</span><span className="h-px flex-1 bg-[#8b4513]/12" /></div>
                                        </div>
                                    ) : null}

                                    <div className="grid gap-3 sm:grid-cols-2">
                                        {BRANDS.map((item) => (
                                            <button
                                                type="button"
                                                key={item.id}
                                                onClick={() => handleBrandSelect(item.id)}
                                                className={`group flex items-center justify-between gap-4 rounded-2xl border p-4 text-left transition duration-200 hover:-translate-y-0.5 hover:border-[#8b4513]/45 hover:shadow-[0_12px_25px_rgba(91,52,24,0.1)] ${item.tone}`}
                                            >
                                                <span>
                                                    <span className="flex h-9 min-w-[5.5rem] items-center"><BrandMark brand={item.id} /></span>
                                                    <span className="mt-1 block text-xs opacity-70">{item.detail}</span>
                                                </span>
                                                <ChevronRight size={18} className="opacity-45 transition group-hover:translate-x-1 group-hover:opacity-100" />
                                            </button>
                                        ))}
                                    </div>

                                    <div className="mt-8 flex items-start gap-3 rounded-2xl border border-[#8b4513]/12 bg-white/45 p-4 text-sm text-[#846a54]">
                                        <ShieldCheck size={19} className="mt-0.5 shrink-0 text-[#8b4513]" />
                                        <p>Seus dados ficam protegidos com criptografia de ponta a ponta.</p>
                                    </div>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} noValidate autoComplete="off">
                                    <button
                                        type="button"
                                        onClick={() => setStep("brand")}
                                        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[#7a5a43] transition hover:text-[#4c2a17]"
                                    >
                                        <ArrowLeft size={16} /> Alterar bandeira
                                    </button>
                                    <div className="mb-6 flex items-center gap-3">
                                        <div className="flex h-11 min-w-[4.5rem] items-center justify-center rounded-xl border border-[#8b4513]/12 bg-white/80 text-[#5b3418]"><BrandMark brand={brand} /></div>
                                        <div>
                                            <p className="text-xs uppercase tracking-[0.18em] text-[#a0846b]">Cartão selecionado</p>
                                            <p className="mt-1 font-semibold text-[#4c2a17]">{selectedBrand?.name}</p>
                                        </div>
                                    </div>

                                    <div className="grid gap-4">
                                        <Field
                                            label="Número do cartão"
                                            placeholder="0000 0000 0000 0000"
                                            value={form.numero}
                                            onChange={(event) => updateForm("numero", formatarNumeroCartao(event.target.value))}
                                            inputMode="numeric"
                                            autoComplete="new-password"
                                            maxLength={19}
                                            error={errors.numero}
                                            ref={numberRef}
                                        />
                                        <Field
                                            label="Nome no cartão"
                                            placeholder="Como aparece no cartão"
                                            value={form.nome}
                                            onChange={(event) => updateForm("nome", event.target.value.toUpperCase().slice(0, 40))}
                                            autoComplete="new-password"
                                            error={errors.nome}
                                        />
                                        <div className="grid grid-cols-2 gap-4">
                                            <Field
                                                label="Validade"
                                                hint="MM/AA"
                                                placeholder="MM/AA"
                                                value={form.validade}
                                                onChange={(event) => updateForm("validade", formatarValidade(event.target.value))}
                                                inputMode="numeric"
                                                autoComplete="new-password"
                                                maxLength={5}
                                                error={errors.validade}
                                            />
                                            <Field
                                                label="CVV"
                                                hint="3 ou 4 dígitos"
                                                placeholder="000"
                                                value={form.cvv}
                                                onChange={(event) => updateForm("cvv", event.target.value.replace(/\D/g, "").slice(0, 4))}
                                                inputMode="numeric"
                                                autoComplete="new-password"
                                                maxLength={4}
                                                error={errors.cvv}
                                            />
                                        </div>
                                    </div>

                                    {submitError ? <p className="mt-4 rounded-xl border border-red-400/30 bg-red-50/70 px-4 py-3 text-sm text-red-700">{submitError}</p> : null}

                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-[#5b3418] px-5 py-3.5 text-sm font-semibold text-[#fff8ef] shadow-[0_10px_25px_rgba(91,52,24,0.18)] transition hover:bg-[#7a401e] disabled:cursor-wait disabled:opacity-75"
                                    >
                                        {processing ? "Processando pagamento..." : `Pagar ${formatarPreco(total)}`}
                                        {!processing ? <LockKeyhole size={16} /> : null}
                                    </button>
                                </form>
                            )}
                        </div>

                        <aside className="space-y-5">
                            {step === "card" ? <CardPreview brand={brand} form={form} /> : (
                                <div className="flex min-h-[168px] flex-col justify-between rounded-2xl border border-[#8b4513]/12 bg-[linear-gradient(135deg,#eee0d2,#fffaf4)] p-5 text-[#6f513b]">
                                    <div className="flex items-start justify-between"><CreditCard size={26} /><Sparkles size={18} className="text-[#b97842]" /></div>
                                    <div><p className="font-mono text-lg tracking-[0.12em]">•••• •••• •••• ••••</p><p className="mt-3 text-xs uppercase tracking-[0.18em] text-[#a0846b]">Seu cartão aparecerá aqui</p></div>
                                </div>
                            )}
                            <div className="rounded-2xl border border-[#8b4513]/12 bg-white/55 p-5">
                                <div className="flex items-center justify-between gap-4">
                                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9b8069]">Resumo do pedido</span>
                                    <CircleHelp size={16} className="text-[#a0846b]" />
                                </div>
                                <div className="mt-4 max-h-52 space-y-3 overflow-y-auto pr-2">
                                    {items.map((item) => (
                                        <div key={item.id} className="flex items-center justify-between gap-4 text-sm text-[#725943]">
                                            <span className="truncate">{item.quantidade}x {item.nome}</span>
                                            <span className="shrink-0">{formatarPreco(item.preco * item.quantidade)}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-5 flex items-center justify-between border-t border-[#8b4513]/12 pt-4">
                                    <span className="font-semibold text-[#5b3418]">Total</span>
                                    <span className="text-xl font-semibold text-[#5b3418]">{formatarPreco(total)}</span>
                                </div>
                            </div>
                        </aside>
                    </div>
                )}
            </section>
        </div>
    );
}
