import { Outlet, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export function AdminLayout() {
    const [loading, setLoading] = useState(true);
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        const checkAdmin = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setAuthorized(false);
            } else {
                // Check Role in DB
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('is_admin')
                    .eq('id', user.id)
                    .single();

                if (profile?.is_admin) {
                    setAuthorized(true);
                } else {
                    setAuthorized(false);
                }
            }
            setLoading(false);
        };
        checkAdmin();
    }, []);

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-white text-gray-900">Loading Admin...</div>;

    // Redirect to standard login if not authorized (assuming 'cc' uses standard login)
    if (!authorized) return <Navigate to="/auth/login" replace />;

    return (
        // Force Light Mode by overriding CSS variables for this subtree
        <div
            className="min-h-screen bg-background text-foreground font-sans antialiased"
            style={{
                // @ts-ignore
                '--background': '0 0% 100%',
                '--foreground': '222.2 84% 4.9%',
                '--card': '0 0% 100%',
                '--card-foreground': '222.2 84% 4.9%',
                '--popover': '0 0% 100%',
                '--popover-foreground': '222.2 84% 4.9%',
                '--primary': '222.2 47.4% 11.2%',
                '--primary-foreground': '210 40% 98%',
                '--secondary': '210 40% 96.1%',
                '--secondary-foreground': '222.2 47.4% 11.2%',
                '--muted': '210 40% 96.1%',
                '--muted-foreground': '215.4 16.3% 46.9%',
                '--accent': '210 40% 96.1%',
                '--accent-foreground': '222.2 47.4% 11.2%',
                '--destructive': '0 84.2% 60.2%',
                '--destructive-foreground': '210 40% 98%',
                '--border': '214.3 31.8% 91.4%',
                '--input': '214.3 31.8% 91.4%',
                '--ring': '222.2 84% 4.9%',
                '--radius': '0.5rem',
                colorScheme: 'light'
            } as React.CSSProperties}
        >
            <Outlet />
        </div>
    );
}
