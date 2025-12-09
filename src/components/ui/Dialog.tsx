import React from "react";

interface DialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    children: React.ReactNode;
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="fixed inset-0" onClick={() => onOpenChange(false)}></div>
            <div className="relative z-50 w-full">
                {children}
            </div>
        </div>
    );
}

export function DialogContent({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={`bg-background rounded-lg shadow-lg border p-6 w-full max-w-lg mx-auto ${className}`}>
            {children}
        </div>
    );
}

export function DialogHeader({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={`flex flex-col space-y-1.5 text-center sm:text-left mb-4 ${className}`}>
            {children}
        </div>
    );
}

export function DialogTitle({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    return (
        <h3 className={`text-lg font-semibold leading-none tracking-tight ${className}`}>
            {children}
        </h3>
    );
}

export function DialogFooter({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={`flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-4 ${className}`}>
            {children}
        </div>
    );
}
