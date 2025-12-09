import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/Dialog";
import { useApp } from "@/context/AppContext";
import { WalletTransactionList } from "./WalletTransactionList";
import { Coins } from "lucide-react";

interface WalletModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function WalletModal({ isOpen, onClose }: WalletModalProps) {
    const { user, credits } = useApp();

    if (!user) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>My Wallet</DialogTitle>
                </DialogHeader>

                <div className="py-4">
                    {/* Balance Card */}
                    <div className="bg-primary/10 rounded-xl p-6 flex flex-col items-center justify-center mb-6 border border-primary/20">
                        <div className="p-3 bg-primary/20 rounded-full mb-3">
                            <Coins className="size-8 text-primary" />
                        </div>
                        <h3 className="text-3xl font-bold">{credits}</h3>
                        <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Available Credits</p>
                    </div>

                    {/* History */}
                    <h4 className="font-bold text-sm mb-3">Recent Transactions</h4>
                    <div className="max-h-[300px] overflow-y-auto pr-1">
                        <WalletTransactionList userId={user.id} />
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
