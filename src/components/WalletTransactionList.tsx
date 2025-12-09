import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useApp } from "@/context/AppContext";

interface Props {
    types?: string[]; // e.g. ['purchase', 'admin_topup']
    userId?: string; // Optional: Override user ID (for Admin view)
}

export function WalletTransactionList({ types, userId }: Props) {
    const { user } = useApp();
    const targetUserId = userId || user?.id;

    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!targetUserId) return;
        const fetch = async () => {
            setLoading(true);
            let query = supabase
                .from('credit_transactions')
                .select('*')
                .eq('user_id', targetUserId)
                .order('created_at', { ascending: false });

            if (types && types.length > 0) {
                query = query.in('type', types);
            }

            const { data } = await query;
            if (data) setTransactions(data);
            setLoading(false);
        };
        fetch();
    }, [targetUserId, types]); // Re-fetch if types or user changes

    if (loading) return <div className="text-sm text-muted-foreground">Loading history...</div>;

    if (transactions.length === 0) {
        return <div className="text-sm text-muted-foreground italic">No transactions found.</div>;
    }

    return (
        <div className="space-y-3">
            {transactions.map(t => (
                <div key={t.id} className="flex justify-between items-center p-3 rounded-lg border bg-card/50">
                    <div>
                        <div className="font-medium text-sm">{t.description || t.type}</div>
                        <div className="text-xs text-muted-foreground">
                            {new Date(t.created_at).toLocaleString()}
                        </div>
                    </div>
                    <div className={`font-mono font-bold ${t.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {t.amount > 0 ? '+' : ''}{t.amount}
                    </div>
                </div>
            ))}
        </div>
    );
}
