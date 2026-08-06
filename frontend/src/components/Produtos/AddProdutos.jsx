import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { criarItemCardapio } from "../../services/CardapioService";
import { Image, Upload, X } from "lucide-react";

const emptyForm = {
    nome: "",
    descricao: "",
    preco: "",
    sobremesa: false
};

const formatCurrency = (value) => {
    const digits = String(value).replace(/\D/g, "");

    if (!digits) {
        return "";
    }

    const number = Number(digits) / 100;

    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL"
    }).format(number);
};

const parseCurrency = (value) => {
    const normalized = String(value)
        .replace(/\./g, "")
        .replace(",", ".")
        .replace(/[^\d.]/g, "");

    return Number(normalized || 0);
};

export default function AddProdutos() {
    const navigate = useNavigate();
    const imagemInputRef = useRef(null);
    const [form, setForm] = useState(emptyForm);
    const [imagem, setImagem] = useState(null);
    const [imagemPreview, setImagemPreview] = useState("");
    const [dragOver, setDragOver] = useState(false);
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState("");
    const [sucesso, setSucesso] = useState("");

    useEffect(() => {
        return () => {
            if (imagemPreview?.startsWith("blob:")) {
                URL.revokeObjectURL(imagemPreview);
            }
        };
    }, [imagemPreview]);

    const handleChange = (event) => {
        const { name, value, type, checked } = event.target;

        setForm((current) => ({
            ...current,
            [name]: type === "checkbox" ? checked : name === "preco" ? formatCurrency(value) : value
        }));
    };

    const limparImagem = () => {
        setImagem(null);
        setImagemPreview("");
        if (imagemInputRef.current) {
            imagemInputRef.current.value = "";
        }
    };

    const aplicarImagem = (file) => {
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            setErro("Envie apenas uma imagem JPG, PNG ou WEBP.");
            return;
        }

        if (file.size > 8 * 1024 * 1024) {
            setErro("A imagem deve ter no máximo 8MB.");
            return;
        }

        setErro("");
        if (imagemPreview?.startsWith("blob:")) {
            URL.revokeObjectURL(imagemPreview);
        }

        setImagem(file);
        setImagemPreview(URL.createObjectURL(file));
    };

    const handlePriceFocus = () => {
        setForm((current) => ({
            ...current,
            preco: current.preco === "" ? "R$ " : current.preco
        }));
    };

    const handlePriceBlur = () => {
        setForm((current) => ({
            ...current,
            preco: current.preco === "R$ " ? "" : current.preco
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setErro("");
        setSucesso("");

        if (!imagem) {
            setErro("Selecione uma imagem para continuar.");
            return;
        }

        try {
            setSalvando(true);

            const payload = new FormData();
            payload.append("nome", form.nome);
            payload.append("descricao", form.descricao);
            payload.append("preco", String(parseCurrency(form.preco)));
            payload.append("sobremesa", String(Boolean(form.sobremesa)));
            if (imagem) {
                payload.append("imagem", imagem);
            }

            await criarItemCardapio(payload);
            setForm(emptyForm);
            limparImagem();
            navigate("/produtos");
        } catch (error) {
            setErro(error.message);
        } finally {
            setSalvando(false);
        }
    };

    const imagemLegenda = useMemo(() => {
        if (imagem) {
            return imagem.name;
        }

        return "JPG, PNG ou WEBP, máx. 8MB";
    }, [imagem]);

    return (
        <main className="min-h-screen px-6 pb-12 pt-28 text-[#6F370F] md:px-10">
            <div className="mx-auto max-w-7xl">
                <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="text-sm uppercase tracking-[0.35em] text-[#5B3418]">
                            Cardápio
                        </p>
                        <h1 className="mt-3 text-4xl font-bold text-[#5B3418] md:text-5xl">
                            Adicionar produto
                        </h1>
                        <p className="mt-3 max-w-2xl text-base leading-7 text-[#7A4A2A]">
                            Cadastre novos produtos que serão escolhidos para o cardápio.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => navigate("/produtos")}
                        className="rounded-xl border border-[#8B4513]/20 bg-[#FAF3E7] px-6 py-3 font-semibold text-[#5B3418] transition hover:bg-[#F3E6D5]"
                    >
                        Voltar para produtos
                    </button>
                </div>

                <form className="grid gap-6 lg:grid-cols-[1fr_1fr] lg:items-stretch" onSubmit={handleSubmit}>
                    <div className="rounded-3xl border border-[#8B4513]/18 bg-[#FAF3E7]/72 p-6 shadow-[0_18px_60px_rgba(91,52,24,0.14)] backdrop-blur-sm md:p-8">
                        <div className="mb-6">
                            <h2 className="text-2xl font-semibold text-[#5B3418]">
                                Novo item
                            </h2>
                            <p className="mt-2 text-sm text-[#7A4A2A]">
                                Preencha os dados do produto para salvar no banco.
                            </p>
                        </div>

                        <div className="grid gap-5">
                            <div className="grid gap-5 md:grid-cols-2">
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium text-[#5B3418]">
                                        Nome
                                    </label>

                                    <input
                                        name="nome"
                                        value={form.nome}
                                        onChange={handleChange}
                                        required
                                        className="rounded-xl border border-[#8B4513]/20 bg-[#FAF3E7] px-4 py-3 text-[#5B3418] outline-none transition placeholder:text-[#8B7B70] focus:border-[#8B4513]"
                                        placeholder="Ex: Picanha Premium"
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <label className="text-sm font-medium text-[#5B3418]">
                                        Preço
                                    </label>

                                    <input
                                        name="preco"
                                        type="text"
                                        value={form.preco}
                                        onChange={handleChange}
                                        onFocus={handlePriceFocus}
                                        onBlur={handlePriceBlur}
                                        required
                                        className="rounded-xl border border-[#8B4513]/20 bg-[#FAF3E7] px-4 py-3 text-[#5B3418] outline-none transition placeholder:text-[#8B7B70] focus:border-[#8B4513]"
                                        placeholder="R$ 0,00"
                                        inputMode="numeric"
                                    />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <label className="text-sm font-medium text-[#5B3418]">
                                    Descrição
                                </label>

                                <textarea
                                    name="descricao"
                                    value={form.descricao}
                                    onChange={handleChange}
                                    required
                                    rows={4}
                                    className="rounded-xl border border-[#8B4513]/20 bg-[#FAF3E7] px-4 py-3 text-[#5B3418] outline-none transition placeholder:text-[#8B7B70] focus:border-[#8B4513]"
                                    placeholder="Descreva o prato..."
                                />
                            </div>

                            <label className="flex items-start gap-3 rounded-2xl border border-[#8B4513]/20 bg-[#FAF3E7] px-4 py-3 text-[#5B3418]">
                                <input
                                    name="sobremesa"
                                    type="checkbox"
                                    checked={form.sobremesa}
                                    onChange={handleChange}
                                    className="mt-1 h-4 w-4 accent-[#8B4513]"
                                />

                                <span className="text-sm font-medium leading-6">
                                    É uma sobremesa
                                </span>
                            </label>

                            {erro ? (
                                <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                    {erro}
                                </p>
                            ) : null}

                            {sucesso ? (
                                <p className="rounded-xl border border-[#8B4513]/20 bg-[#F3E6D5] px-4 py-3 text-sm text-[#5B3418]">
                                    {sucesso}
                                </p>
                            ) : null}

                            <button
                                type="submit"
                                disabled={salvando}
                                className="w-full rounded-xl bg-[#8B4513] px-6 py-3 font-semibold text-[#FAF3E7] shadow-[0_12px_30px_rgba(91,52,24,0.18)] transition hover:bg-[#6F370F] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {salvando ? "Salvando..." : "Salvar Produto"}
                            </button>
                        </div>
                    </div>

                    <div className="rounded-3xl border border-[#8B4513]/18 bg-[#FAF3E7]/72 p-6 shadow-[0_18px_60px_rgba(91,52,24,0.14)] backdrop-blur-sm md:p-8">
                        <div className="mb-6">
                            <h2 className="text-2xl font-semibold text-[#5B3418]">
                                Imagem
                            </h2>
                            <p className="mt-2 text-sm text-[#7A4A2A]">
                                Área reservada para o upload e pré-visualização.
                            </p>
                        </div>

                        <input
                            ref={imagemInputRef}
                            type="file"
                            className="sr-only"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={(event) => {
                                aplicarImagem(event.target.files?.[0]);
                                event.target.value = "";
                            }}
                        />

                        <div
                            role="button"
                            tabIndex={0}
                            onKeyDown={(event) => {
                                if (event.key === "Enter" || event.key === " ") {
                                    event.preventDefault();
                                    imagemInputRef.current?.click();
                                }
                            }}
                            onClick={() => imagemInputRef.current?.click()}
                            onDragEnter={(event) => {
                                event.preventDefault();
                                setDragOver(true);
                            }}
                            onDragOver={(event) => event.preventDefault()}
                            onDragLeave={(event) => {
                                event.preventDefault();
                                setDragOver(false);
                            }}
                            onDrop={(event) => {
                                event.preventDefault();
                                setDragOver(false);
                                aplicarImagem(event.dataTransfer.files?.[0]);
                            }}
                            className={`flex min-h-[420px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-5 py-6 text-center transition-colors ${
                                dragOver
                                    ? "border-[#8B4513] bg-[#F3E6D5]/80"
                                    : imagemPreview
                                        ? "border-[#8B4513]/30 bg-[#F3E6D5]/50"
                                        : "border-[#8B4513]/20 bg-[#FAF3E7] hover:bg-[#F3E6D5]/40"
                            }`}
                        >
                            {imagemPreview ? (
                                <div className="flex w-full flex-col items-center gap-4">
                                    <img
                                        src={imagemPreview}
                                        alt="Pré-visualização do produto"
                                        className="h-56 w-full rounded-xl border border-[#8B4513]/15 object-cover"
                                    />

                                    <div className="flex w-full items-center justify-between gap-3">
                                        <div className="min-w-0 text-left">
                                            <p className="truncate text-sm font-medium text-[#5B3418]">
                                                {imagemLegenda}
                                            </p>
                                            <p className="text-xs text-[#8B7B70]">
                                                Clique para trocar a imagem
                                            </p>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                limparImagem();
                                            }}
                                            className="rounded-full border border-[#8B4513]/20 p-2 text-[#8B4513] transition hover:bg-[#F3E6D5]"
                                            aria-label="Remover imagem"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <Image size={42} className="mb-4 text-[#8B7B70]" />

                                    <p className="text-lg font-semibold text-[#5B3418]">
                                        Clique ou arraste uma imagem
                                    </p>

                                    <p className="mt-2 text-sm text-[#8B7B70]">
                                        JPG, PNG ou WEBP, até 8MB
                                    </p>

                                    <button
                                        type="button"
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            imagemInputRef.current?.click();
                                        }}
                                        className="mt-8 inline-flex items-center gap-2 rounded-xl border border-[#8B4513]/20 bg-[#FAF3E7] px-6 py-3 font-semibold text-[#5B3418] transition hover:bg-[#F3E6D5]"
                                    >
                                        <Upload size={16} />
                                        Anexar imagem
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </form>
            </div>
        </main>
    );
}