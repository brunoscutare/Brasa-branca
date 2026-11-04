import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Image, Upload, X } from "lucide-react";
import Input from "../ui/Input.jsx";
import Toast from "../ui/Toast.jsx";
import {
    atualizarItemCardapio,
    BACKEND_URL,
    buscarProduto,
    criarItemCardapio,
    produtoExibeNoCardapio
} from "../../services/CardapioService";
const emptyForm = {
    nome: "",
    descricao: "",
    preco: "",
    sobremesa: false,
    exibir_no_cardapio: false
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

const formatPrecoFromDb = (valor) => {
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL"
    }).format(Number(valor || 0));
};

const obterUrlImagem = (imagem) => {
    if (!imagem) return "";
    return imagem.startsWith("http") ? imagem : `${BACKEND_URL}${imagem}`;
};

export default function AddProdutos() {
    const navigate = useNavigate();
    const { id } = useParams();
    const editando = Boolean(id);
    const imagemInputRef = useRef(null);
    const [form, setForm] = useState(emptyForm);
    const [imagem, setImagem] = useState(null);
    const [imagemExistente, setImagemExistente] = useState("");
    const [imagemPreview, setImagemPreview] = useState("");
    const [dragOver, setDragOver] = useState(false);
    const [carregando, setCarregando] = useState(editando);
    const [salvando, setSalvando] = useState(false);
    const [erros, setErros] = useState({});
    const [toast, setToast] = useState(null);
    useEffect(() => {
        return () => {
            if (imagemPreview?.startsWith("blob:")) {
                URL.revokeObjectURL(imagemPreview);
            }
        };
    }, [imagemPreview]);

    useEffect(() => {
        if (!editando) return undefined;

        let ativo = true;

        const carregarProduto = async () => {
            try {
                setCarregando(true);
                const produto = await buscarProduto(id);

                if (!ativo) return;

                setForm({
                    nome: produto.nome || "",
                    descricao: produto.descricao || "",
                    preco: formatPrecoFromDb(produto.preco),
                    sobremesa: Boolean(produto.sobremesa),
                    exibir_no_cardapio: produtoExibeNoCardapio(produto)
                });

                if (produto.imagem) {
                    setImagemExistente(produto.imagem);
                    setImagemPreview(obterUrlImagem(produto.imagem));
                }
            } catch (error) {
                if (ativo) {
                    setToast({
                        type: "error",
                        title: "Erro ao carregar",
                        message: error.message || "Não foi possível carregar o produto."
                    });
                }
            } finally {
                if (ativo) {
                    setCarregando(false);
                }
            }
        };

        carregarProduto();

        return () => {
            ativo = false;
        };
    }, [editando, id]);

    const limparErro = (campo) => {        setErros((current) => {
            if (!current[campo]) return current;

            const next = { ...current };
            delete next[campo];
            return next;
        });
    };

    const handleChange = (event) => {
        const { name, value, type, checked } = event.target;

        limparErro(name);

        setForm((current) => ({
            ...current,
            [name]: type === "checkbox" ? checked : name === "preco" ? formatCurrency(value) : value
        }));
    };

    const limparImagem = () => {
        setImagem(null);
        setImagemExistente("");
        setImagemPreview("");
        limparErro("imagem");
        if (imagemInputRef.current) {
            imagemInputRef.current.value = "";
        }
    };

    const aplicarImagem = (file) => {
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            setErros((current) => ({
                ...current,
                imagem: "Envie apenas uma imagem JPG, PNG ou WEBP."
            }));
            return;
        }

        if (file.size > 8 * 1024 * 1024) {
            setErros((current) => ({
                ...current,
                imagem: "A imagem deve ter no máximo 8MB."
            }));
            return;
        }

        limparErro("imagem");

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

    const validar = () => {
        const next = {};

        if (!form.nome.trim()) {
            next.nome = "Informe o nome do produto";
        }

        if (!form.preco.trim()) {
            next.preco = "Informe o preço";
        } else if (parseCurrency(form.preco) <= 0) {
            next.preco = "Informe um valor maior que zero";
        }

        if (!form.descricao.trim()) {
            next.descricao = "Informe a descrição";
        }

        if (!imagem && !imagemExistente) {
            next.imagem = "Selecione uma imagem para continuar";
        }
        setErros(next);
        return Object.keys(next).length === 0;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!validar()) {
            setToast({
                type: "error",
                title: "Revise o formulário",
                message: "Corrija os campos destacados antes de salvar."
            });
            return;
        }

        try {
            setSalvando(true);

            const payload = new FormData();
            payload.append("nome", form.nome.trim());
            payload.append("descricao", form.descricao.trim());
            payload.append("preco", String(parseCurrency(form.preco)));
            payload.append("sobremesa", String(Boolean(form.sobremesa)));
            payload.append("exibir_no_cardapio", String(Boolean(form.exibir_no_cardapio)));

            if (imagem) {
                payload.append("imagem", imagem);
            }

            if (editando) {
                await atualizarItemCardapio(id, payload);
            } else {
                await criarItemCardapio(payload);
            }

            setToast({
                type: "success",
                title: editando ? "Produto atualizado" : "Produto cadastrado",
                message: editando
                    ? "As alterações foram salvas no cardápio."
                    : "O item foi salvo no cardápio."
            });
            window.setTimeout(() => {
                navigate("/produtos");
            }, 700);
        } catch (error) {
            setToast({
                type: "error",
                title: "Não foi possível salvar",
                message: error.message || (editando ? "Erro ao atualizar produto." : "Erro ao cadastrar produto.")            });
        } finally {
            setSalvando(false);
        }
    };

    const imagemLegenda = useMemo(() => {
        if (imagem) {
            return imagem.name;
        }

        if (imagemExistente) {
            return "Imagem atual do produto";
        }

        return "JPG, PNG ou WEBP, máx. 8MB";
    }, [imagem, imagemExistente]);

    if (carregando) {
        return (
            <main className="min-h-screen px-6 pb-10 pt-28 text-brand-primary md:px-10">
                <div className="mx-auto max-w-7xl">
                    <p className="text-lg text-brand-text">Carregando produto...</p>
                </div>
            </main>
        );
    }

    return (        <main className="min-h-screen px-6 pb-10 pt-28 text-brand-primary md:px-10">
            <Toast toast={toast} onClose={() => setToast(null)} />

            <div className="mx-auto max-w-7xl">
                <div className="mb-10 flex items-start justify-between">
                    <div>
                        <p className="text-sm uppercase tracking-[0.35em] text-brand-primary">
                            Cardápio
                        </p>
                        <h1 className="mt-3 text-4xl font-bold text-brand-primary md:text-5xl">
                            {editando ? "Editar produto" : "Adicionar produto"}
                        </h1>
                        <p className="mt-3 max-w-2xl text-base leading-7 text-brand-text">
                            {editando
                                ? "Atualize os dados do produto no cardápio."
                                : "Cadastre novos produtos que serão escolhidos para o cardápio."}
                        </p>                    </div>
                    <div className="pt-10">
                        <button
                            type="button"
                            onClick={() => navigate("/produtos")}
                            className="rounded-xl bg-brand-primary px-6 py-3 font-semibold text-brand-surface shadow-[0_12px_30px_rgba(91,52,24,0.18)] transition hover:bg-brand-primary"
                        >
                            Voltar para produtos
                        </button>
                    </div>
                </div>

                <form className="grid gap-6 lg:grid-cols-[1fr_1fr] lg:items-stretch" onSubmit={handleSubmit} noValidate>
                    <div className="rounded-3xl border border-brand-border bg-brand-surface p-6 shadow-[0_18px_60px_rgba(91,52,24,0.14)] backdrop-blur-sm md:p-8">
                        <div className="mb-6">
                            <h2 className="text-2xl font-semibold text-brand-primary">
                                {editando ? "Dados do item" : "Novo item"}
                            </h2>
                            <p className="mt-2 text-sm text-brand-text">
                                {editando
                                    ? "Revise e salve as alterações do produto."
                                    : "Preencha os dados do produto para salvar no banco."}
                            </p>                        </div>

                        <div className="grid gap-5">
                            <div className="grid items-start gap-5 md:grid-cols-2">
                                <Input
                                    label="Nome"
                                    name="nome"
                                    value={form.nome}
                                    onChange={handleChange}
                                    error={erros.nome}
                                    required
                                    placeholder="Ex: Picanha Premium"
                                />

                                <Input
                                    label="Preço"
                                    name="preco"
                                    type="text"
                                    value={form.preco}
                                    onChange={handleChange}
                                    onFocus={handlePriceFocus}
                                    onBlur={handlePriceBlur}
                                    error={erros.preco}
                                    required
                                    placeholder="R$ 0,00"
                                    inputMode="numeric"
                                />
                            </div>

                            <Input
                                label="Descrição"
                                name="descricao"
                                value={form.descricao}
                                onChange={handleChange}
                                error={erros.descricao}
                                required
                                multiline
                                rows={4}
                                placeholder="Descreva o prato..."
                            />

                            <div className="grid grid-cols-2 gap-3">
                                <label className="flex min-w-0 items-center gap-3 rounded-2xl border border-brand-border bg-brand-surface px-4 py-3 text-brand-primary">
                                    <input
                                        name="sobremesa"
                                        type="checkbox"
                                        checked={form.sobremesa}
                                        onChange={handleChange}
                                        className="h-4 w-4 shrink-0 accent-brand-primary"
                                    />

                                    <span className="text-sm font-medium leading-6">
                                        É uma sobremesa
                                    </span>
                                </label>

                                <label className="flex min-w-0 items-center gap-3 rounded-2xl border border-brand-border bg-brand-surface px-4 py-3 text-brand-primary">
                                    <input
                                        name="exibir_no_cardapio"
                                        type="checkbox"
                                        checked={form.exibir_no_cardapio}
                                        onChange={handleChange}
                                        className="h-4 w-4 shrink-0 accent-brand-primary"
                                    />

                                    <span className="text-sm font-medium leading-6">
                                        Exibir no cardápio público
                                    </span>
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={salvando}
                                className="w-full rounded-xl bg-brand-primary px-6 py-3 font-semibold text-brand-surface shadow-[0_12px_30px_rgba(91,52,24,0.18)] transition hover:bg-brand-primary disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {salvando ? "Salvando..." : editando ? "Salvar alterações" : "Salvar Produto"}                            </button>
                        </div>
                    </div>

                    <div className="rounded-3xl border border-brand-border bg-brand-surface p-6 shadow-[0_18px_60px_rgba(91,52,24,0.14)] backdrop-blur-sm md:p-8">
                        <div className="mb-6">
                            <h2 className="text-2xl font-semibold text-brand-primary">
                                Imagem
                            </h2>
                            <p className="mt-2 text-sm text-brand-text">
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
                                    ? "border-brand-border bg-brand-panel"
                                    : erros.imagem
                                      ? "border-red-500 bg-red-50/40"
                                      : imagemPreview
                                        ? "border-brand-border bg-brand-panel"
                                        : "border-brand-border bg-brand-surface hover:bg-brand-panel"
                            }`}
                        >
                            {imagemPreview ? (
                                <div className="flex w-full flex-col items-center gap-4">
                                    <img
                                        src={imagemPreview}
                                        alt="Pré-visualização do produto"
                                        className="h-56 w-full rounded-xl border border-brand-border object-cover"
                                    />

                                    <div className="flex w-full items-center justify-between gap-3">
                                        <div className="min-w-0 text-left">
                                            <p className="truncate text-sm font-medium text-brand-primary">
                                                {imagemLegenda}
                                            </p>
                                            <p className="text-xs text-brand-muted">
                                                Clique para trocar a imagem
                                            </p>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                limparImagem();
                                            }}
                                            className="rounded-full border border-brand-border p-2 text-brand-primary transition hover:bg-brand-panel"
                                            aria-label="Remover imagem"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <Image size={42} className="mb-4 text-brand-muted" />

                                    <p className="text-lg font-semibold text-brand-primary">
                                        Clique ou arraste uma imagem
                                    </p>

                                    <p className="mt-2 text-sm text-brand-muted">
                                        JPG, PNG ou WEBP, até 8MB
                                    </p>

                                    <button
                                        type="button"
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            imagemInputRef.current?.click();
                                        }}
                                        className="mt-8 inline-flex items-center gap-2 rounded-xl border border-brand-border bg-brand-surface px-6 py-3 font-semibold text-brand-primary transition hover:bg-brand-panel"
                                    >
                                        <Upload size={16} />
                                        Anexar imagem
                                    </button>
                                </>
                            )}
                        </div>

                        <p className="mt-2 min-h-5 text-sm leading-5 text-red-600" aria-live="polite">
                            {erros.imagem || "\u00A0"}
                        </p>
                    </div>
                </form>
            </div>
        </main>
    );
}
