import { useState } from "react";
import { Bot, LoaderCircle, MessageCircle, Send, Sparkles, X } from "lucide-react";
import { perguntarCardapio } from "../../services/IaService";

const sugestao = "O que vai no prato de salmão grelhado?";

export default function AssistenteCardapio() {
    const [aberto, setAberto] = useState(false);
    const [pergunta, setPergunta] = useState("");
    const [carregando, setCarregando] = useState(false);
    const [mensagens, setMensagens] = useState([{ autor: "ia", texto: "Olá! Posso ajudar com dúvidas sobre os pratos e sobremesas do nosso cardápio." }]);

    const enviar = async (event) => {
        event.preventDefault();
        const texto = pergunta.trim();
        if (!texto || carregando) return;

        setPergunta("");
        setMensagens((atuais) => [...atuais, { autor: "cliente", texto }]);
        setCarregando(true);
        try {
            const data = await perguntarCardapio(texto);
            setMensagens((atuais) => [...atuais, { autor: "ia", texto: data.resposta }]);
        } catch (error) {
            setMensagens((atuais) => [...atuais, { autor: "ia", texto: error.message || "Não consegui responder agora. Tente novamente." }]);
        } finally {
            setCarregando(false);
        }
    };

    return (
        <>
            {aberto ? <section className="fixed bottom-24 right-5 z-[70] flex h-[min(560px,calc(100vh-8rem))] w-[min(380px,calc(100vw-2rem))] flex-col overflow-hidden rounded-[1.75rem] border border-brand-border bg-brand-surface shadow-[0_24px_80px_rgba(61,35,21,0.28)]" aria-label="Assistente do cardápio">
                <header className="flex items-center justify-between gap-3 bg-brand-primary px-5 py-4 text-brand-surface"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-cream text-brand-primary"><Bot size={21} /></span><div><p className="font-semibold">IA do cardápio</p><p className="text-xs text-brand-cream">Tire suas dúvidas sobre os pratos</p></div></div><button type="button" onClick={() => setAberto(false)} className="rounded-xl p-2 transition hover:bg-brand-on-dark/10" aria-label="Fechar assistente"><X size={19} /></button></header>
                <div className="flex-1 space-y-3 overflow-y-auto bg-brand-panel p-4">{mensagens.map((mensagem, indice) => <div key={`${mensagem.autor}-${indice}`} className={`flex ${mensagem.autor === "cliente" ? "justify-end" : "justify-start"}`}><p className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-6 ${mensagem.autor === "cliente" ? "rounded-br-md bg-brand-primary text-brand-surface" : "rounded-bl-md border border-brand-border bg-brand-surface text-brand-primary"}`}>{mensagem.texto}</p></div>)}{carregando ? <div className="flex items-center gap-2 text-sm text-brand-text"><LoaderCircle className="animate-spin" size={16} /> Consultando o cardápio...</div> : null}</div>
                <div className="border-t border-brand-border bg-brand-surface p-3"><button type="button" onClick={() => setPergunta(sugestao)} className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-brand-border px-3 py-1.5 text-left text-xs text-brand-text transition hover:bg-brand-panel"><Sparkles size={13} /> Sugestão de pergunta</button><form onSubmit={enviar} className="flex items-end gap-2"><textarea value={pergunta} onChange={(event) => setPergunta(event.target.value.slice(0, 600))} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); event.currentTarget.form.requestSubmit(); } }} rows={1} placeholder="Pergunte sobre o cardápio..." className="max-h-24 min-h-11 flex-1 resize-none rounded-2xl border border-brand-border bg-brand-field px-4 py-3 text-sm text-brand-ink outline-none placeholder:text-brand-placeholder focus:border-brand-accent" /><button type="submit" disabled={!pergunta.trim() || carregando} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-primary text-brand-surface transition hover:bg-brand-ink disabled:cursor-not-allowed disabled:opacity-50" aria-label="Enviar pergunta"><Send size={17} /></button></form></div>
            </section> : null}
            <button type="button" onClick={() => setAberto((atual) => !atual)} className="fixed bottom-5 right-5 z-[70] flex h-16 w-16 items-center justify-center rounded-full border-4 border-brand-cream bg-brand-primary text-brand-cream shadow-[0_14px_35px_rgba(61,35,21,0.28)] transition hover:-translate-y-1 hover:bg-brand-ink" aria-label={aberto ? "Fechar IA do cardápio" : "Abrir IA do cardápio"} title="Pergunte à IA sobre o cardápio"><MessageCircle size={27} /></button>
        </>
    );
}
