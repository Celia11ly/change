
import { supabase } from "@/lib/supabase";

export const authApi = {
    /**
     * Send Verification Code (OTP) to email.
     * Used for both Registration (Sign Up) and Login via Code.
     */
    sendCode: async (email: string) => {
        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                // If you want to use a specific template for registration vs login, 
                // Supabase handles this automatically based on if user exists.
                // Ensure "Email OTP" is enabled in Supabase.
            }
        });
        if (error) throw error;
        return { success: true };
    },

    /**
     * Verify OTP (Code)
     * Used for Login or completing Registration.
     */
    verifyCode: async (email: string, code: string, _type: 'signup' | 'magiclink' | 'recovery' | 'invite' = 'magiclink') => {
        const { data, error } = await supabase.auth.verifyOtp({
            email,
            token: code,
            type: 'email' // 'email' type covers both magiclink/signup in new SDK versions broadly, or specifically 'signup'/'magiclink'
        });

        if (error) throw error;
        return { success: true, user: data.user, session: data.session };
    },

    /**
     * Register with Email & Password.
     * Note: Supabase sign up with password usually requires email confirmation.
     * If using "Code" flow for registration, we might use signUp with password + auto-confirm enabled 
     * OR we use OTP to verify email first then update password.
     * 
     * Strategy per user request: "Input Email -> Get Code -> Input Code + Password".
     * 
     * Optimization: 
     * 1. Call verifyCode to log them in.
     * 2. Once logged in (session active), call updateUser to set password.
     */
    registerWithCodeAndPassword: async (email: string, code: string, password: string, name: string) => {
        // 1. Verify OTP to get session
        const { data, error: verifyError } = await supabase.auth.verifyOtp({
            email,
            token: code,
            type: 'email' // Use 'email' to handle both signup and login OTPs from signInWithOtp
        });

        // Supabase behavior: If user doesn't exist, 'magiclink' type might not work for initial signup unless configured.
        // Fallback or specific handling: We assume 'signup' or generic 'email' type work.
        // Actually, best flow for "Code + Password" reg:
        // A. verifyOtp (logs user in)
        // B. update user (set password & metadata)

        if (verifyError) {
            // Try 'magiclink' if 'signup' failed (maybe user exists?)
            // Or throw
            throw verifyError;
        }

        if (!data.user) throw new Error("Verification failed, no user returned.");

        // 2. Set Password and User Metadata
        const { error: updateError } = await supabase.auth.updateUser({
            password: password,
            data: { full_name: name }
        });

        if (updateError) throw updateError;

        return { success: true, user: data.user };
    },

    /**
     * Login with Email & Password
     */
    loginWithPassword: async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        if (error) throw error;
        return { success: true, user: data.user, session: data.session };
    },

    /**
     * Reset Password Flow
     * 1. Send Reset Code
     */
    sendResetPasswordCode: async (email: string) => {
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        if (error) throw error;
        return { success: true };
    },

    /**
     * Update Password (for logged in users or running reset flow)
     */
    updatePassword: async (newPassword: string) => {
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) throw error;
        return { success: true };
    }
};
