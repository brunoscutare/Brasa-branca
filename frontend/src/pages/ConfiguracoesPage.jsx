import { useState } from "react";
import { Bell, ChevronRight, CheckCircle2, FileText, HelpCircle, KeyRound, LogOut, Mail, ShieldCheck, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import AlterarSenhaModal from "../components/Account/AlterarSenhaModal";

function PreferenciaDesativada({ titulo, descricao }) {
    return (
        <div className="flex items-center justify-between gap-4 border-t border-[#8B4513]/12 py-4 first:border-t-0 first:pt-0 last:pb-0">
            <div><p className="text-sm font-semibold text-[#5B3418]">{titulo}</p><p className="mt-1 text-xs leading-5 text-[#80634D]">{descricao}</p></div>
            <span className="relative h-6 w-11 shrink-0 rounded-full bg-[#BDAA98]/45"><span className="absolute left-1 top-1 h-4 w-4 rounded-full bg-[#F8F0E6] shadow-sm" /></span>
        </div>
    );
}

export default function ConfiguracoesPage() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [senhaModalAberto, setSenhaModalAberto] = useState(false);
    const [senhaSucesso, setSenhaSucesso] = useState(false);
    const [ajudaAberta, setAjudaAberta] = useState("");

    const sair = () => {
        logout();
        navigate("/homepage");
    };

    return (
        <main className="min-h-screen px-6 pb-16 pt-28 text-[#6F370F] md:px-10">
            <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
                <div>
                    <p className="text-sm uppercase tracking-[0.35em] text-[#5B3418]">Conta</p>
                    <h1 className="mt-4 text-4xl font-semibold text-[#5B3418] md:text-5xl">Configurações</h1>
                    <p className="mt-3 text-sm leading-7 text-[#7A4A2A]">Ajuste suas preferências e encontre ajuda quando precisar.</p>
                </div>

                {senhaSucesso ? <div className="flex items-center gap-2 rounded-2xl border border-emerald-500/25 bg-emerald-50/75 px-4 py-3 text-sm text-emerald-700"><CheckCircle2 size={17} /> Senha alterada com sucesso.</div> : null}

                <div className="grid gap-5 md:grid-cols-2">
                    <section className="rounded-3xl border border-[#8B4513]/18 bg-[#FAF3E7]/72 p-6 shadow-[0_18px_60px_rgba(91,52,24,0.08)]">
                        <div className="flex items-start justify-between gap-4"><div><p className="text-xs uppercase tracking-[0.22em] text-[#9B8069]">Preferências da conta</p><h2 className="mt-2 text-xl font-semibold text-[#5B3418]">Comunicações</h2></div><Bell className="text-[#8B4513]" size={22} /></div>
                        <div className="mt-6"><PreferenciaDesativada titulo="Novidades e promoções" descricao="Receba novidades e ofertas da Brasa Branca." /><PreferenciaDesativada titulo="Notificações de pedidos" descricao="Acompanhe atualizações sobre seus pedidos." /></div>
                        <p className="mt-5 text-xs text-[#9B8069]">Essas preferências estarão disponíveis em breve.</p>
                    </section>

                    <section className="rounded-3xl border border-[#8B4513]/18 bg-[#FAF3E7]/72 p-6 shadow-[0_18px_60px_rgba(91,52,24,0.08)]">
                        <div className="flex items-start justify-between gap-4"><div><p className="text-xs uppercase tracking-[0.22em] text-[#9B8069]">Segurança</p><h2 className="mt-2 text-xl font-semibold text-[#5B3418]">Conta protegida</h2></div><ShieldCheck className="text-[#8B4513]" size={22} /></div>
                        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-50/60 p-4 text-sm text-emerald-800"><KeyRound size={18} className="mt-0.5 shrink-0" /><p><strong>Senha protegida.</strong><br />Sua senha não é exibida nesta tela.</p></div>
                        <button type="button" onClick={() => { setSenhaSucesso(false); setSenhaModalAberto(true); }} className="mt-5 inline-flex items-center gap-2 rounded-full border border-[#8B4513]/25 px-4 py-2.5 text-sm font-semibold text-[#5B3418] transition hover:bg-[#8B4513]/10"><KeyRound size={15} /> Trocar senha</button>
                    </section>
                </div>

                <section className="rounded-3xl border border-[#8B4513]/18 bg-[#FAF3E7]/72 p-6 shadow-[0_18px_60px_rgba(91,52,24,0.08)]">
                    <div className="flex items-start justify-between gap-4"><div><p className="text-xs uppercase tracking-[0.22em] text-[#9B8069]">Ajuda e suporte</p><h2 className="mt-2 text-xl font-semibold text-[#5B3418]">Como podemos ajudar?</h2></div><HelpCircle className="text-[#8B4513]" size={22} /></div>
                    <div className="mt-6 divide-y divide-[#8B4513]/12">
                        <a href="mailto:contato@brasabranca.com.br" className="flex cursor-pointer items-center gap-4 py-4 first:pt-0"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#5B3418] text-[#FFF8EF]"><Mail size={18} /></span><span className="flex-1"><strong className="block text-sm text-[#5B3418]">Contato</strong><span className="mt-1 block text-xs text-[#80634D]">Fale com a equipe Brasa Branca.</span></span><ChevronRight size={18} className="text-[#9B8069]" /></a>
                        <button type="button" onClick={() => setAjudaAberta("faq")} className="flex w-full cursor-pointer items-center gap-4 py-4 text-left"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#5B3418] text-[#FFF8EF]"><HelpCircle size={18} /></span><span className="flex-1"><strong className="block text-sm text-[#5B3418]">Perguntas frequentes</strong><span className="mt-1 block text-xs text-[#80634D]">Encontre respostas rápidas.</span></span><ChevronRight size={18} className="text-[#9B8069]" /></button>
                        <button type="button" onClick={() => setAjudaAberta("privacidade")} className="flex w-full cursor-pointer items-center gap-4 py-4 text-left last:pb-0"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#5B3418] text-[#FFF8EF]"><FileText size={18} /></span><span className="flex-1"><strong className="block text-sm text-[#5B3418]">Política de privacidade</strong><span className="mt-1 block text-xs text-[#80634D]">Saiba como seus dados são tratados.</span></span><ChevronRight size={18} className="text-[#9B8069]" /></button>
                    </div>
                </section>

                <button type="button" onClick={sair} className="inline-flex w-fit items-center gap-2 rounded-full border border-red-500/25 px-5 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-50/60"><LogOut size={17} /> Sair da conta</button>
                <p className="-mt-5 text-xs text-[#9B8069]">Conta conectada como {user?.email}</p>
            </div>

            {senhaModalAberto ? <AlterarSenhaModal usuarioId={user.id} onClose={() => setSenhaModalAberto(false)} onSuccess={() => { setSenhaModalAberto(false); setSenhaSucesso(true); }} /> : null}

            {ajudaAberta ? (
                <div className="fixed inset-0 z-[120] flex items-end justify-center bg-[#29170d]/65 p-0 backdrop-blur-sm sm:items-center sm:p-5">
                    <section role="dialog" aria-modal="true" className="w-full max-w-lg rounded-t-[2rem] bg-[#FBF5ED] p-6 shadow-[0_28px_90px_rgba(49,24,8,0.32)] sm:rounded-[2rem] md:p-8">
                        <div className="flex items-start justify-between gap-4"><div><p className="text-xs uppercase tracking-[0.25em] text-[#9B8069]">Ajuda e suporte</p><h2 className="mt-2 text-2xl font-semibold text-[#4C2A17]">{ajudaAberta === "faq" ? "Perguntas frequentes" : "Política de privacidade"}</h2></div><button type="button" onClick={() => setAjudaAberta("")} className="rounded-full p-2 text-[#7A5A43] hover:bg-[#8B4513]/10" aria-label="Fechar"><X size={20} /></button></div>
                        {ajudaAberta === "faq" ? <div className="mt-6 space-y-4 text-sm leading-6 text-[#6F513B]"><p><strong>Como faço um pedido?</strong><br />Escolha os itens no cardápio, adicione ao carrinho e finalize o pagamento.</p><p><strong>Onde acompanho meu pedido?</strong><br />Acesse a opção “Pedidos” no menu principal.</p><p><strong>Posso editar meu endereço?</strong><br />Acesse “Perfil” e edite seus dados de entrega.</p></div> : <div className="mt-6 space-y-4 text-sm leading-6 text-[#6F513B]"><p>Usamos seus dados para identificar sua conta, processar pedidos e organizar entregas.</p><p>Dados completos de cartão não são armazenados. O sistema mantém apenas informações mascaradas e protegidas.</p><p>Para dúvidas sobre seus dados, entre em contato pelo e-mail contato@brasabranca.com.br.</p></div>}
                    </section>
                </div>
            ) : null}
        </main>
    );
}
