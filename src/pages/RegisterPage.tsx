
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import { authApi } from "@/services/authApi";
import { CountDownButton } from "@/components/ui/CountDownButton";

export default function RegisterPage() {
    // const { register } = useApp(); // We use direct authApi now for more granular control
    const navigate = useNavigate();

    // Form State
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // UI State
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Validation
    const validatePassword = (pwd: string) => {
        // Rule: 6-20 alphanumeric
        const regex = /^[A-Za-z0-9]{6,20}$/;
        return regex.test(pwd);
    };

    // Handlers
    const handleSendCode = async () => {
        setError(null);
        if (!email) {
            setError("Please enter your email address first.");
            return false;
        }
        try {
            await authApi.sendCode(email);
            return true; // Success signals timer to start
        } catch (err: any) {
            setError(err.message || "Failed to send verification code.");
            return false;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Client-side Validation
        if (!name || !email || !code || !password || !confirmPassword) {
            setError("All fields are required.");
            return;
        }
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        if (!validatePassword(password)) {
            setError("Password must be 6-20 characters (letters or numbers).");
            return;
        }

        setIsLoading(true);

        try {
            await authApi.registerWithCodeAndPassword(email, code, password, name);
            // On success, redirect to login or home
            // Ideally auto-login happens, check session
            navigate("/");
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Registration failed. Please check your code.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md space-y-8 animate-in fade-in duration-500">
            <div className="text-center">
                <h2 className="mt-6 text-3xl font-bold tracking-tight">
                    Create an account
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                    Join via Email Verification
                </p>
            </div>

            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                {error && (
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm flex items-center gap-2">
                        <AlertCircle className="size-4 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                <div className="space-y-4">
                    {/* Name */}
                    <div>
                        <label htmlFor="name" className="block text-xs font-medium text-muted-foreground mb-1">
                            Full Name
                        </label>
                        <input
                            id="name"
                            type="text"
                            required
                            className="block w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                            placeholder="Your Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    {/* Email & Send Code */}
                    <div>
                        <label htmlFor="email" className="block text-xs font-medium text-muted-foreground mb-1">
                            Email
                        </label>
                        <div className="flex gap-2">
                            <input
                                id="email"
                                type="email"
                                required
                                className="block flex-1 rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <CountDownButton
                                onClick={handleSendCode}
                                text="Get Code"
                            />
                        </div>
                    </div>

                    {/* Verification Code */}
                    <div>
                        <label htmlFor="code" className="block text-xs font-medium text-muted-foreground mb-1">
                            Verification Code
                        </label>
                        <input
                            id="code"
                            type="text"
                            required
                            className="block w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                            placeholder="Enter verification code from email"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <label htmlFor="password" className="block text-xs font-medium text-muted-foreground mb-1">
                            Password (6-20 characters, letters or numbers)
                        </label>
                        <div className="relative">
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                required
                                className="block w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none pr-10"
                                placeholder="Set your password"
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

                    {/* Confirm Password */}
                    <div>
                        <label htmlFor="confirmPassword" className="block text-xs font-medium text-muted-foreground mb-1">
                            Confirm Password
                        </label>
                        <input
                            id="confirmPassword" // Fixed ID
                            type="password"
                            required
                            className="block w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                            placeholder="Type password again"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center py-2.5 rounded-lg bg-primary text-primary-foreground font-bold hover:bg-primary/90 focus:ring-2 focus:ring-primary disabled:opacity-50 transition-all shadow-md"
                >
                    {isLoading ? "Creating Account..." : "Sign Up"}
                </button>
            </form>

            <div className="text-center text-sm">
                <span className="text-muted-foreground">Already have an account? </span>
                <Link
                    to="/auth/login"
                    className="font-medium text-primary hover:text-primary/90"
                >
                    Sign in
                </Link>
            </div>
        </div>
    );
}
