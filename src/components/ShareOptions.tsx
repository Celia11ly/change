import { Copy, Twitter, Facebook, MessageCircle, Check } from "lucide-react";
import { useState } from "react";

interface ShareOptionsProps {
    url: string;
    title: string;
}

export function ShareOptions({ url, title }: ShareOptionsProps) {
    const [copied, setCopied] = useState(false);

    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title);

    const handleCopy = () => {
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const SHARE_LINKS = [
        {
            icon: Twitter,
            label: "X / Twitter",
            href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
            color: "bg-black text-white"
        },
        {
            icon: Facebook,
            label: "Facebook",
            href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
            color: "bg-blue-600 text-white"
        },
        {
            icon: MessageCircle, // WhatsApp equivalent icon
            label: "WhatsApp",
            href: `https://wa.me/?text=${encodedTitle} ${encodedUrl}`,
            color: "bg-green-500 text-white"
        }
    ];

    return (
        <div className="grid grid-cols-4 gap-2 mt-2">
            {SHARE_LINKS.map((link) => (
                <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-1 group"
                >
                    <div className={`size-10 rounded-full flex items-center justify-center shadow-sm transition-transform group-hover:scale-110 ${link.color}`}>
                        <link.icon className="size-5" />
                    </div>
                    <span className="text-[10px] text-muted-foreground">{link.label}</span>
                </a>
            ))}

            <button
                onClick={handleCopy}
                className="flex flex-col items-center gap-1 group"
            >
                <div className={`size-10 rounded-full flex items-center justify-center shadow-sm transition-transform group-hover:scale-110 ${copied ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-700"}`}>
                    {copied ? <Check className="size-5" /> : <Copy className="size-5" />}
                </div>
                <span className="text-[10px] text-muted-foreground">{copied ? "Copied" : "Copy Link"}</span>
            </button>
        </div>
    );
}
