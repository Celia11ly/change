
import { useState } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { authApi } from "@/services/authApi";
import { supabase } from "@/lib/supabase";

export default function ForgotPasswordPage() {
    const [step, setStep] = useState<1 | 2>(1); // 1: Send Code, 2: Reset Password

    // Form Data
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // UI State
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    const handleSendResetCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        try {
            await authApi.sendResetPasswordCode(email);
            setStep(2);
            setSuccessMsg("Reset code sent! Please check your email.");
        } catch (err: any) {
            setError(err.message || "Failed to send reset code.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setIsLoading(true);
        try {
            // 1. Verify Code (which logs user in for recovery session)
            await authApi.verifyCode(email, code, 'recovery');

            // 2. Update Password
            const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
            if (updateError) throw updateError;

            setSuccessMsg("Password updated successfully! You can now login.");
            // Wait a sec then maybe link to login
        } catch (err: any) {
            setError(err.message || "Failed to reset password. Code might be invalid or expired.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md space-y-8 animate-in fade-in duration-500">
            <div className="text-center relative">
                <Link to="/auth/login" className="absolute left-0 top-1 text-muted-foreground hover:text-foreground">
                    <ArrowLeft className="size-5" />
                </Link>
                <h2 className="mt-6 text-3xl font-bold tracking-tight">
                    Reset Password
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                    {step === 1 ? "Enter your email to receive a code" : "Enter code and new password"}
                </p>
            </div>

            {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm flex items-center gap-2">
                    <AlertCircle className="size-4 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {successMsg && (
                <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-500 text-sm font-medium text-center">
                    {successMsg}
                </div>
            )}

            {step === 1 ? (
                <form className="mt-8 space-y-6" onSubmit={handleSendResetCode}>
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
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex justify-center py-2.5 rounded-lg bg-primary text-primary-foreground font-bold hover:bg-primary/90 focus:ring-2 focus:ring-primary disabled:opacity-50 transition-all"
                    >
                        {isLoading ? "Sending..." : "Send Reset Code"}
                    </button>
                </form>
            ) : (
                <form className="mt-8 space-y-6" onSubmit={handleResetPassword}>
                    <div className="space-y-4">
                        {/* Verification Code */}
                        <div>
                            <label htmlFor="code" className="block text-xs font-medium text-muted-foreground mb-1">
                                Reset Code
                            </label>
                            <input
                                id="code"
                                type="text"
                                required
                                className="block w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                                placeholder="Enter code from email"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                            />
                        </div>

                        {/* New Password */}
                        <div>
                            <label htmlFor="newPassword" className="block text-xs font-medium text-muted-foreground mb-1">
                                New Password
                            </label>
                            <div className="relative">
                                <input
                                    id="newPassword"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    className="block w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none pr-10"
                                    placeholder="Min 6 characters"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
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
                                Confirm New Password
                            </label>
                            <input
                                id="confirmPassword"
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
                        {isLoading ? "Updating..." : "Set New Password"}
                    </button>

                    <div className="text-center text-sm">
                        <Link to="/auth/login" className="font-medium text-primary hover:text-primary/90">
                            Back to Login
                        </Link>
                    </div>
                </form>
            )}
        </div>
    );
}
