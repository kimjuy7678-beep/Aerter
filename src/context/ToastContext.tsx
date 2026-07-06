import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';

type ToastType = 'success' | 'info' | 'error' | 'confirm';

interface ToastAction {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'ghost';
}

interface ToastItem {
    id: string;
    type: ToastType;
    message: string;
    actions?: ToastAction[];
}

interface ToastContextValue {
    toasts: ToastItem[];
    showToast: (message: string, type?: Exclude<ToastType, 'confirm'>, duration?: number) => void;
    showConfirm: (message: string, actions: ToastAction[]) => void;
    dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

function makeId() {
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<ToastItem[]>([]);

    const dismiss = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const showToast = useCallback(
        (message: string, type: Exclude<ToastType, 'confirm'> = 'success', duration = 2500) => {
            const id = makeId();
            setToasts((prev) => [...prev, { id, type, message }]);
            window.setTimeout(() => dismiss(id), duration);
        },
        [dismiss]
    );

    const showConfirm = useCallback(
        (message: string, actions: ToastAction[]) => {
            const id = makeId();
            const wrappedActions = actions.map((action) => ({
                ...action,
                onClick: () => {
                    action.onClick();
                    dismiss(id);
                },
            }));
            setToasts((prev) => [...prev, { id, type: 'confirm', message, actions: wrappedActions }]);
        },
        [dismiss]
    );

    return (
        <ToastContext.Provider value={{ toasts, showToast, showConfirm, dismiss }}>
            {children}
        </ToastContext.Provider>
    );
}

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be used within a ToastProvider');
    return ctx;
}