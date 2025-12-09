
import { useState, useEffect } from "react";

interface CountDownButtonProps {
    onClick: () => Promise<boolean>; // Returns true if API call succeeded
    initialSeconds?: number;
    className?: string;
    text?: string;
}

export function CountDownButton({
    onClick,
    initialSeconds = 60,
    className = "",
    text = "Send Code"
}: CountDownButtonProps) {
    const [seconds, setSeconds] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (seconds > 0) {
            const timer = setTimeout(() => setSeconds(seconds - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [seconds]);

    const handleClick = async (e: React.MouseEvent) => {
        e.preventDefault();
        if (isLoading || seconds > 0) return;

        setIsLoading(true);
        try {
            const success = await onClick();
            if (success) {
                setSeconds(initialSeconds);
            }
        } catch (err) {
            console.error("Failed to send code", err);
        } finally {
            setIsLoading(false);
        }
    };

    const isDisabled = isLoading || seconds > 0;

    return (
        <button
            onClick={handleClick}
            disabled={isDisabled}
            className={`min-w-[100px] px-3 py-2 rounded-md text-sm font-medium transition-colors 
                ${isDisabled
                    ? 'bg-muted text-muted-foreground cursor-not-allowed'
                    : 'bg-secondary text-primary hover:bg-secondary/80'
                } ${className}`}
        >
            {isLoading ? "Sending..." : seconds > 0 ? `${seconds}s` : text}
        </button>
    );
}
