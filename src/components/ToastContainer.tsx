import { Check, Info, AlertCircle, X } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const ICONS = {
    success: Check,
    info: Info,
    error: AlertCircle,
    confirm: Info,
};

export default function ToastContainer() {
    const { toasts, dismiss } = useToast();

    if (toasts.length === 0) return null;

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] flex flex-col-reverse gap-2 items-center w-full px-4 pointer-events-none">
            {toasts.map((t) => {
                const Icon = ICONS[t.type];
                return (
                    <div
                        key={t.id}
                        role={t.type === 'confirm' ? 'alertdialog' : 'status'}
                        className="pointer-events-auto flex items-center gap-3 bg-foreground text-background pl-4 pr-3 py-3 rounded-full shadow-lg max-w-[92vw]"
                    >
                        <Icon size={16} className="shrink-0" />
                        <span className="font-pretendard text-[13px] tracking-wide whitespace-nowrap">{t.message}</span>
                        {t.actions ? (
                            <div className="flex items-center gap-2 ml-1">
                                {t.actions.map((action, i) => (
                                    <button
                                        key={i}
                                        onClick={action.onClick}
                                        className={`font-pretendard text-[12px] tracking-wide px-3 py-1.5 rounded-full transition-colors whitespace-nowrap ${action.variant === 'ghost'
                                            ? 'text-background/70 hover:text-background'
                                            : 'bg-background text-foreground hover:bg-background/85'
                                            }`}
                                    >
                                        {action.label}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <button
                                onClick={() => dismiss(t.id)}
                                aria-label="닫기"
                                className="ml-1 text-background/60 hover:text-background transition-colors shrink-0"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>
                );
            })}
        </div>
    );
}