import { AlertTriangle, X } from "lucide-react";

interface AlertDialogProps {
    isOpen: boolean;
    title: string;
    description: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: "danger" | "default";
    onConfirm: () => void;
    onCancel: () => void;
}

export function AlertDialog({
    isOpen,
    title,
    description,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    variant = "default",
    onConfirm,
    onCancel
}: AlertDialogProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={onCancel}
            />

            {/* Modal */}
            <div className="relative w-full max-w-md overflow-hidden rounded-xl border bg-card p-6 shadow-2xl animate-in zoom-in-95 duration-200">
                <button
                    onClick={onCancel}
                    className="absolute right-4 top-4 rounded-full p-1 opacity-70 transition-opacity hover:bg-muted hover:opacity-100"
                >
                    <X className="h-4 w-4" />
                </button>

                <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
                    <div className={`mb-4 rounded-full p-3 ${variant === 'danger' ? 'bg-red-100 text-red-600 dark:bg-red-900/30' : 'bg-primary/10 text-primary'}`}>
                        <AlertTriangle className="h-6 w-6" />
                    </div>

                    <h2 className="text-xl font-semibold tracking-tight mb-2">
                        {title}
                    </h2>
                    <p className="text-muted-foreground text-sm mb-6">
                        {description}
                    </p>

                    <div className="flex w-full gap-3 sm:justify-end">
                        <button
                            onClick={onCancel}
                            className="flex-1 rounded-lg border bg-background px-4 py-2 font-medium transition-colors hover:bg-accent hover:text-accent-foreground sm:flex-none"
                        >
                            {cancelLabel}
                        </button>
                        <button
                            onClick={onConfirm}
                            className={`flex-1 rounded-lg px-4 py-2 font-medium text-white shadow-sm transition-colors sm:flex-none
                                ${variant === 'danger'
                                    ? 'bg-red-600 hover:bg-red-700'
                                    : 'bg-primary hover:bg-primary/90'
                                }`}
                        >
                            {confirmLabel}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
