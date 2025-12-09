
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertCircle, Eye, EyeOff, Mail, Key } from "lucide-react";
import { authApi } from "@/services/authApi";
import { CountDownButton } from "@/components/ui/CountDownButton";

export default function LoginPage() {
    // const { login } = useApp(); // Using authApi directly
    const navigate = useNavigate();

    // UI State
    const [loginMethod, setLoginMethod] = useState<'password' | 'code'>('password');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    // Form State
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [code, setCode] = useState("");

    // Handlers
    const handleSendCode = async () => {
        setError(null);
        if (!email) {
            setError("Please enter your email address first.");
            return false;
        }
        try {
            await authApi.sendCode(email);
            return true;
        } catch (err: any) {
            setError(err.message || "Failed to send verification code.");
            return false;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!email) {
            setError("Email is required.");
            return;
        }

        if (loginMethod === 'password' && !password) {
            setError("Password is required.");
            return;
        }

        if (loginMethod === 'code' && !code) {
            setError("Verification code is required.");
            return;
        }

        setIsLoading(true);

        try {
            if (loginMethod === 'password') {
                await authApi.loginWithPassword(email, password);
            } else {
                await authApi.verifyCode(email, code);
            }
            // Success
            navigate("/");
        } catch (err: any) {
            console.error(err);
            if (err.message.includes("Invalid login credentials")) {
                setError("Invalid email or password.");
            } else {
                setError(err.message || "Login failed.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md space-y-8 animate-in fade-in duration-500">
            <div className="text-center">
                <h2 className="mt-6 text-3xl font-bold tracking-tight">
                    Welcome back
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                    Sign in to your account
                </p>
            </div>

            {/* Login Method Tabs */}
            <div className="flex bg-secondary/50 p-1 rounded-lg">
                <button
                    onClick={() => { setLoginMethod('password'); setError(null); }}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${loginMethod === 'password'
                        ? 'bg-background shadow-sm text-primary'
                        : 'text-muted-foreground hover:text-primary'
                        }`}
                >
                    <Key className="size-4" />
                    Password
                </button>
                <button
                    onClick={() => { setLoginMethod('code'); setError(null); }}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${loginMethod === 'code'
                        ? 'bg-background shadow-sm text-primary'
                        : 'text-muted-foreground hover:text-primary'
                        }`}
                >
                    <Mail className="size-4" />
                    Code Login
                </button>
            </div>

            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                {error && (
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm flex items-center gap-2">
                        <AlertCircle className="size-4 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                <div className="space-y-4">
                    {/* Email Input (Common) */}
                    <div>
                        <label htmlFor="email" className="block text-xs font-medium text-muted-foreground mb-1">
                            Email address
                        </label>
                        <input
                            id="email"
                            type="email"
                            required
                            className="block w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    {/* Password Mode Inputs */}
                    {loginMethod === 'password' && (
                        <div className="animate-in fade-in slide-in-from-left-2 duration-300">
                            <div className="flex items-center justify-between mb-1">
                                <label htmlFor="password" className="block text-xs font-medium text-muted-foreground">
                                    Password
                                </label>
                                <Link
                                    to="/auth/forgot-password"
                                    className="text-xs font-medium text-primary hover:text-primary/90"
                                >
                                    Forgot password?
                                </Link>
                            </div>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    required={loginMethod === 'password'}
                                    className="block w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none pr-10"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                                >
                                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Code Mode Inputs */}
                    {loginMethod === 'code' && (
                        <div className="animate-in fade-in slide-in-from-right-2 duration-300">
                            <label htmlFor="code" className="block text-xs font-medium text-muted-foreground mb-1">
                                Verification Code
                            </label>
                            <div className="flex gap-2">
                                <input
                                    id="code"
                                    type="text"
                                    required={loginMethod === 'code'}
                                    className="block flex-1 rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                                    placeholder="Verification code"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                />
                                <CountDownButton
                                    onClick={handleSendCode}
                                    text="Get Code"
                                />
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex items-center">
                    <input
                        id="remember-me"
                        name="remember-me"
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <label
                        htmlFor="remember-me"
                        className="ml-2 block text-sm text-muted-foreground"
                    >
                        Remember me
                    </label>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center py-2.5 rounded-lg bg-primary text-primary-foreground font-bold hover:bg-primary/90 focus:ring-2 focus:ring-primary disabled:opacity-50 transition-all shadow-md"
                >
                    {isLoading ? "Signing in..." : "Sign in"}
                </button>
            </form>

            <div className="text-center text-sm">
                <span className="text-muted-foreground">Don't have an account? </span>
                <Link
                    to="/auth/register"
                    className="font-medium text-primary hover:text-primary/90"
                >
                    Sign up
                </Link>
            </div>
        </div>
    );
}
