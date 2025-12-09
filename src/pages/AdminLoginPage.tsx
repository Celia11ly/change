import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Loader2, ShieldCheck } from "lucide-react";

export default function AdminLoginPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            // 1. Authenticate with Supabase (Standard User)
            const { data, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (authError) throw authError;
            if (!data.user) throw new Error("No user found");

            // 2. Check Admin Privileges
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('is_admin')
                .eq('id', data.user.id)
                .single();

            if (profileError) console.error("Profile check error:", profileError);

            if (!profile?.is_admin) {
                await supabase.auth.signOut();
                throw new Error("Access Denied: You do not have administrator privileges.");
            }

            // 3. Success -> Redirect
            navigate("/admin");

        } catch (err: any) {
            console.error(err);
            setError(err.message || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-900">
            <div className="max-w-md w-full p-8 bg-white rounded-xl shadow-lg space-y-6 border">
                <div className="text-center space-y-2">
                    <div className="mx-auto bg-purple-100 p-3 rounded-full w-fit">
                        <ShieldCheck className="size-8 text-purple-600" />
                    </div>
                    <h1 className="text-2xl font-bold">Admin Portal</h1>
                    <p className="text-sm text-gray-500">Restricted Access Only</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-200">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-gray-700">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            disabled={loading}
                            className="bg-white text-gray-900 border-gray-300 placeholder:text-gray-400 focus:ring-purple-500 focus:border-purple-500"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password" className="text-gray-700">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            disabled={loading}
                            className="bg-white text-gray-900 border-gray-300 placeholder:text-gray-400 focus:ring-purple-500 focus:border-purple-500"
                        />
                    </div>

                    <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white" disabled={loading}>
                        {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
                        Login to Admin
                    </Button>
                </form>

                <div className="text-center text-xs text-gray-400">
                    VidGenius Internal System
                </div>
            </div>
        </div>
    );
}
