import { useEffect } from "react";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";

const ICONS = {
    success: CheckCircle2,
    error: AlertCircle,
    info: Info
};

const STYLES = {
    success: "border-brand-border bg-brand-panel text-brand-primary",
    error: "border-brand-danger/30 bg-brand-danger-surface text-brand-danger",
    info: "border-brand-border bg-brand-surface text-brand-primary"
};

export default function Toast({ toast, onClose }) {
    useEffect(() => {
        if (!toast) return undefined;

        const timer = window.setTimeout(() => {
            onClose?.();
        }, 4000);

        return () => window.clearTimeout(timer);
    }, [toast, onClose]);

    if (!toast) return null;

    const Icon = ICONS[toast.type] || Info;

    return (
        <div className="pointer-events-none fixed bottom-6 right-6 z-[100] max-w-sm">
            <div
                className={`flex items-start gap-3 rounded-xl border px-4 py-3 shadow-[0_12px_30px_rgba(61,35,21,0.18)] backdrop-blur-sm ${STYLES[toast.type] || STYLES.info}`}
            >
                <Icon size={20} className="mt-0.5 shrink-0" />
                <div className="min-w-0">
                    {toast.title ? <p className="font-semibold">{toast.title}</p> : null}
                    <p className={`text-sm ${toast.title ? "mt-1 opacity-90" : "font-medium"}`}>
                        {toast.message}
                    </p>
                </div>
            </div>
        </div>
    );
}
