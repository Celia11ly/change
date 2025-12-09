import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { WalletTransactionList } from "@/components/WalletTransactionList";
import { Wallet, CreditCard, Activity } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function WalletPage() {
    const { credits, setPricingOpen } = useApp();
    const [activeTab, setActiveTab] = useState<'recharge' | 'consumption'>('recharge');

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto">
            {/* Header Card */}
            <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 border rounded-2xl p-8 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-4">
                    <div className="p-4 bg-primary/20 text-primary rounded-full">
                        <Wallet className="size-8" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">My Wallet</h1>
                        <p className="text-muted-foreground">Manage your credits and history</p>
                    </div>
                </div>

                <div className="text-center md:text-right">
                    <div className="text-sm text-muted-foreground uppercase tracking-wider mb-1">Current Balance</div>
                    <div className="text-4xl font-bold font-mono text-primary">{credits}</div>
                    <Button onClick={() => setPricingOpen(true)} className="mt-4" size="sm">
                        + Top Up Credits
                    </Button>
                </div>
            </div>

            {/* Tabs & Content */}
            <div className="space-y-4">
                {/* Custom Tabs */}
                <div className="flex border-b">
                    <button
                        onClick={() => setActiveTab('recharge')}
                        className={`px-6 py-3 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'recharge'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        <CreditCard className="size-4" />
                        Recharge Records
                    </button>
                    <button
                        onClick={() => setActiveTab('consumption')}
                        className={`px-6 py-3 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'consumption'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        <Activity className="size-4" />
                        Consumption Records
                    </button>
                </div>

                {/* Tab Content */}
                <div className="bg-card border rounded-lg p-6 min-h-[400px]">
                    {activeTab === 'recharge' && (
                        <div className="animate-in fade-in slide-in-from-left-4 duration-300">
                            <h3 className="font-semibold mb-4 text-sm text-muted-foreground uppercase tracking-wide">
                                History of Top-ups & Grants
                            </h3>
                            <WalletTransactionList types={['admin_topup', 'purchase', 'initial_grant']} />
                        </div>
                    )}

                    {activeTab === 'consumption' && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                            <h3 className="font-semibold mb-4 text-sm text-muted-foreground uppercase tracking-wide">
                                History of Consumption
                            </h3>
                            <WalletTransactionList types={['generation_cost']} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
