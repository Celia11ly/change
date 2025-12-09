import { X, Check } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useState } from "react";

interface PricingModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const PACKAGES = [
    { credits: 100, price: "$4.99", popular: false },
    { credits: 500, price: "$19.99", popular: true },
    { credits: 1000, price: "$35.99", popular: false },
];

export function PricingModal({ isOpen, onClose }: PricingModalProps) {
    const { addCredits } = useApp();
    const [selectedPackageIndex, setSelectedPackageIndex] = useState<number | null>(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const [purchasedCredits, setPurchasedCredits] = useState(0);

    const handlePurchase = (pkg: typeof PACKAGES[0]) => {
        // Simulate purchase
        // In real app, stripe checkout here
        addCredits(pkg.credits);
        setPurchasedCredits(pkg.credits);
        setShowSuccess(true);
        // Reset after view
    };

    const handleClose = () => {
        setShowSuccess(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] overflow-y-auto">
            {/* Centering Container */}
            <div className="flex min-h-screen items-center justify-center p-4">

                {/* Backdrop Layer */}
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                    onClick={handleClose}
                />

                {/* Modal Content */}
                <div className="relative z-10 w-full max-w-4xl bg-card border rounded-2xl shadow-2xl overflow-hidden flex flex-col my-8 animate-in fade-in zoom-in-95 duration-200">
                    {/* Close Button */}
                    <div className="absolute top-4 right-4 z-20">
                        <button
                            onClick={handleClose}
                            className="p-2 rounded-full hover:bg-muted bg-card/80 backdrop-blur border shadow-sm transition-colors"
                        >
                            <X className="size-5" />
                        </button>
                    </div>

                    {showSuccess ? (
                        // SUCCESS VIEW
                        <div className="flex flex-col items-center justify-center p-12 md:p-20 text-center animate-in zoom-in-50 duration-300">
                            <div className="mb-6 rounded-full bg-green-100 p-6 dark:bg-green-900/30 ring-8 ring-green-50 dark:ring-green-900/10">
                                <Check className="size-16 text-green-600 dark:text-green-400 animate-in spin-in-180 duration-700" />
                            </div>
                            <h2 className="text-3xl font-bold tracking-tight mb-2">Payment Successful!</h2>
                            <p className="text-muted-foreground text-lg mb-8">
                                Added {purchasedCredits} credits to your account.
                            </p>
                            <button
                                onClick={handleClose}
                                className="px-8 py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/25"
                            >
                                Start Creating
                            </button>
                        </div>
                    ) : (
                        // PRICING VIEW
                        <div className="p-6 md:p-8">
                            <div className="text-center mb-6 md:mb-10 mt-4">
                                <h2 className="text-2xl md:text-3xl font-bold mb-2">Get More Credits</h2>
                                <p className="text-muted-foreground text-sm md:text-base">Choose a package to continue creating amazing videos.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                                {PACKAGES.map((pkg, i) => {
                                    const isSelected = selectedPackageIndex === i;
                                    return (
                                        <div
                                            key={i}
                                            onClick={() => setSelectedPackageIndex(i)}
                                            className={`relative rounded-xl border p-6 flex flex-col items-center text-center transition-all cursor-pointer ${isSelected
                                                ? "border-primary bg-primary/5 ring-2 ring-primary/20 scale-102 md:scale-105 z-10 shadow-lg"
                                                : pkg.popular
                                                    ? "border-primary/50 bg-secondary/50 hover:border-primary/80"
                                                    : "bg-background hover:border-primary/50"
                                                }`}
                                        >
                                            {pkg.popular && (
                                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] md:text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap shadow-sm">
                                                    MOST POPULAR
                                                </div>
                                            )}
                                            <div className="text-3xl md:text-4xl font-bold mb-2">{pkg.price}</div>
                                            <div className="text-sm md:text-lg font-medium mb-4 md:mb-6 text-muted-foreground">{pkg.credits} Credits</div>

                                            <ul className="space-y-2 md:space-y-3 mb-6 md:mb-8 w-full text-xs md:text-sm text-left px-2">
                                                <li className="flex items-center gap-2">
                                                    <Check className="size-4 text-green-500 shrink-0" />
                                                    <span>Access to all templates</span>
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <Check className="size-4 text-green-500 shrink-0" />
                                                    <span>High priority generation</span>
                                                </li>
                                            </ul>

                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handlePurchase(pkg);
                                                }}
                                                className={`w-full py-2.5 rounded-lg font-bold transition-colors text-sm md:text-base mt-auto ${isSelected
                                                    ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md"
                                                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                                                    }`}
                                            >
                                                Purchase
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
