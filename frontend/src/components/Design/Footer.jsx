import { AtSign, MapPin, MessageCircle } from "lucide-react";
import {
    ENDERECO,
    ENDERECO_MAPS_URL,
    INSTAGRAM_HANDLE,
    INSTAGRAM_URL,
    WHATSAPP_DISPLAY,
    WHATSAPP_URL
} from "../../constants/site";

const CARD_CLASS =
    "group rounded-3xl border border-[#8B4513]/18 bg-[#FAF3E7]/72 p-6 shadow-[0_18px_60px_rgba(91,52,24,0.10)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#8B4513]/28 hover:bg-[#FAF3E7]/90 hover:shadow-[0_22px_70px_rgba(91,52,24,0.18)]";

function FooterCard({ href, icon: Icon, title, children }) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={CARD_CLASS}
        >
            <div className="flex items-center gap-3 text-[#5B3418] transition-colors duration-300 group-hover:text-[#6F370F]">
                <Icon
                    className="h-5 w-5 shrink-0 transition-transform duration-300 group-hover:scale-110"
                    aria-hidden="true"
                />
                <h3 className="text-lg font-semibold">{title}</h3>
            </div>
            <p className="mt-4 text-sm leading-7 text-[#7A4A2A] transition-colors duration-300 group-hover:text-[#5B3418]">
                {children}
            </p>
        </a>
    );
}

export default function Footer() {
    return (
        <footer
            id="contato"
            className="scroll-mt-28 border-t border-[#8B4513]/12 px-6 py-16"
        >
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-12">
                <div className="max-w-2xl">
                    <p className="text-sm uppercase tracking-[0.35em] text-[#5B3418]">
                        Contato
                    </p>
                    <h2 className="mt-4 text-3xl font-semibold text-[#5B3418] md:text-4xl">
                        Venha nos visitar ou fale conosco.
                    </h2>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    <FooterCard href={ENDERECO_MAPS_URL} icon={MapPin} title="Localização">
                        {ENDERECO}
                    </FooterCard>

                    <FooterCard href={WHATSAPP_URL} icon={MessageCircle} title="WhatsApp">
                        {WHATSAPP_DISPLAY}
                    </FooterCard>

                    <FooterCard href={INSTAGRAM_URL} icon={AtSign} title="Instagram">
                        {INSTAGRAM_HANDLE}
                    </FooterCard>
                </div>

                <p className="text-center text-sm text-[#7A4A2A]/80">
                    © {new Date().getFullYear()} Brasa Branca
                </p>
            </div>
        </footer>
    );
}
