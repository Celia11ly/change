import React, { createContext, useContext, useEffect, useState } from "react";
import { TEMPLATES, Template } from "@/constants/templates";
import { supabase } from "@/lib/supabase";
import { User as SupabaseUser } from "@supabase/supabase-js";

// --- Types ---
export interface User {
    id: string;
    email: string;
    name: string;
    avatarUrl: string;
    isAdmin: boolean;
}



interface AppContextType {
    // Auth State
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    logout: () => Promise<void>;

    // Current User Data Accessors
    credits: number;
    addCredits: (amount: number) => void;
    deductCredits: (amount: number) => Promise<{ success: boolean; error?: string }>;

    savedTemplateIds: string[];
    toggleSaveTemplate: (templateId: string) => void;
    isSaved: (id: string) => boolean;

    myTemplates: Template[];
    officialTemplates: Template[];
    categories: { id: string, label: string }[]; // Add categories
    addCustomTemplate: (template: Template) => void;
    deleteCustomTemplate: (id: string) => void;

    // UI Globals
    isPricingOpen: boolean;
    setPricingOpen: (open: boolean) => void;
    isSettingsOpen: boolean;
    setSettingsOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
    // --- Auth State ---
    const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // --- Domain State (Synced with Supabase) ---
    const [credits, setCredits] = useState(0);
    const [isAdmin, setIsAdmin] = useState(false);
    const [savedTemplateIds, setSavedTemplateIds] = useState<string[]>([]);
    const [myTemplates, setMyTemplates] = useState<Template[]>([]);
    const [officialTemplates, setOfficialTemplates] = useState<Template[]>(TEMPLATES);
    const [categories, setCategories] = useState<{ id: string, label: string }[]>([
        { id: "All", label: "全部" }, // Default fallback
        { id: "Cinematic", label: "影视" },
        { id: "Funny", label: "搞笑" },
        { id: "Fashion", label: "时尚" },
        { id: "Classic", label: "经典" },
        { id: "Nature", label: "其他" },
    ]);

    // --- Initialization ---
    useEffect(() => {
        // 1. Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSupabaseUser(session?.user ?? null);
            setIsLoading(false);
        });

        // 2. Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSupabaseUser(session?.user ?? null);
            setIsLoading(false);
        });

        // 3. Fetch Official Templates (Public) & Categories
        const fetchData = async () => {
            // Templates - Sorted by sort_order
            const { data: tData, error: tError } = await supabase
                .from('official_templates')
                .select('*')
                .order('sort_order', { ascending: true }) // Sort by Order !!
                .order('created_at', { ascending: false });

            if (!tError && tData) {
                const mapped: Template[] = tData.map(item => ({
                    id: item.id,
                    title: item.title,
                    description: item.description,
                    thumbnailUrl: item.thumbnail_url,
                    coverUrl: item.cover_url,
                    videoUrl: item.video_url,
                    fullPrompt: item.prompt,
                    rating: item.rating,
                    likes: item.likes,
                    isPremium: item.is_premium,
                    category: item.category,
                    ratio: item.ratio,
                    badge: item.badge as 'New' | 'Hot' | 'Pro' // Map badge
                }));
                setOfficialTemplates(mapped);
            }

            // Categories
            const { data: cData, error: cError } = await supabase
                .from('template_categories')
                .select('*')
                .order('created_at', { ascending: true });

            if (!cError && cData && cData.length > 0) {
                // Map DB categories to App format.
                const mappedCats = [
                    { id: "All", label: "All" },
                    ...cData.map(c => ({ id: c.label, label: c.label })).filter(c => c.label !== 'Others'),
                    { id: "Others", label: "Others" } // Always append Others at end
                ];
                setCategories(mappedCats);
            }
        };
        fetchData();

        return () => subscription.unsubscribe();
    }, []);

    // --- Data Fetching (User Specific) ---
    useEffect(() => {
        if (!supabaseUser) {
            // Reset user-specific state on logout
            setCredits(0);
            setIsAdmin(false);
            setSavedTemplateIds([]);
            setMyTemplates([]);
            return;
        }

        const fetchData = async () => {
            // 1. Fetch Profile (Credits & Admin Status)
            const { data: profile } = await supabase
                .from('profiles')
                .select('credits, is_admin')
                .eq('id', supabaseUser.id)
                .single();

            if (profile) {
                setCredits(profile.credits);
                setIsAdmin(profile.is_admin || false);
            } else {
                // If no profile, create one with default credits
                await supabase
                    .from('profiles')
                    .insert({ id: supabaseUser.id, credits: 300 });
                setCredits(300);
            }

            // 2. Fetch Saved Templates
            const { data: saved } = await supabase
                .from('saved_templates')
                .select('template_id')
                .eq('user_id', supabaseUser.id);

            if (saved) setSavedTemplateIds(saved.map(item => item.template_id));

            // 3. Fetch Custom Templates
            const { data: custom } = await supabase
                .from('custom_templates')
                .select('*')
                .eq('user_id', supabaseUser.id)
                .order('created_at', { ascending: false });

            if (custom) {
                // Map DB snake_case to frontend camelCase if needed, 
                // but our DB columns match Template interface mostly.
                // We need to adapt the shape to match 'Template' interface.
                const mappedTemplates: Template[] = custom.map(item => ({
                    id: item.id,
                    title: item.label,
                    label: item.label,
                    coverUrl: item.cover_url,
                    thumbnailUrl: item.cover_url,
                    videoUrl: item.video_url,
                    description: item.prompt || "Custom Video",
                    fullPrompt: item.prompt,
                    rating: 5,
                    likes: 0,
                    isPremium: true,
                    category: 'Custom',
                    ratio: item.ratio
                }));
                // Combine custom templates logic if needed, but here we store separately
                setMyTemplates(mappedTemplates);
            }
        };

        fetchData();
    }, [supabaseUser]);

    // --- Derived User Object ---
    const user: User | null = supabaseUser ? {
        id: supabaseUser.id,
        email: supabaseUser.email!,
        name: supabaseUser.user_metadata?.full_name || supabaseUser.email?.split('@')[0] || "User",
        avatarUrl: supabaseUser.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(supabaseUser.email || 'User')}&background=random`,
        isAdmin: isAdmin // Pass derived state
    } : null;

    const logout = async () => {
        await supabase.auth.signOut();
    };

    // --- Actions ---

    const addCredits = async (amount: number) => {
        if (!supabaseUser) return;
        const newAmount = credits + amount;
        setCredits(newAmount); // Optimistic update

        const { error } = await supabase
            .from('profiles')
            .update({ credits: newAmount })
            .eq('id', supabaseUser.id);

        if (!error) {
            // Log Transaction
            await supabase.from('credit_transactions').insert({
                user_id: supabaseUser.id,
                amount: amount,
                type: 'purchase', // Default for client-side add
                description: 'Purchase'
            });
        }
    };

    const deductCredits = async (amount: number) => {
        console.log(`[AppContext] Attempting to deduct ${amount} credits.`);
        if (!supabaseUser || credits < amount) {
            return { success: false, error: "Insufficient credits or no user" };
        }

        const newAmount = credits - amount;

        // Optimistic update
        setCredits(newAmount);

        const { error } = await supabase
            .from('profiles')
            .update({ credits: newAmount })
            .eq('id', supabaseUser.id);

        if (error) {
            console.error("[AppContext] DB Update Error:", error);
            // Revert optimistic? 
            // setCredits(credits); // Optional: Revert if strict
            return { success: false, error: error.message };
        }

        // Log Transaction
        await supabase.from('credit_transactions').insert({
            user_id: supabaseUser.id,
            amount: -amount,
            type: 'generation_cost',
            description: 'Video Generation'
        });

        console.log("[AppContext] Deduct Success");
        return { success: true };
    };



    const toggleSaveTemplate = async (templateId: string) => {
        if (!supabaseUser) return;

        const isAlreadySaved = savedTemplateIds.includes(templateId);

        // Optimistic Update
        setSavedTemplateIds(prev =>
            isAlreadySaved ? prev.filter(id => id !== templateId) : [...prev, templateId]
        );

        if (isAlreadySaved) {
            await supabase
                .from('saved_templates')
                .delete()
                .match({ user_id: supabaseUser.id, template_id: templateId });
        } else {
            await supabase
                .from('saved_templates')
                .insert({ user_id: supabaseUser.id, template_id: templateId });
        }
    };

    const isSaved = (id: string) => savedTemplateIds.includes(id);

    const addCustomTemplate = async (template: Template) => {
        if (!supabaseUser) return;

        // Note: Realistically, we should upload file first, but here we assume template has URLs.
        // We do Client-Side insert for Custom Template metadata

        const dbPayload = {
            user_id: supabaseUser.id,
            label: template.title,      // Map 'title' to DB 'label'
            cover_url: template.coverUrl,
            video_url: template.videoUrl,
            prompt: template.fullPrompt ?? "", // Map 'fullPrompt' to DB 'prompt'
            ratio: (template as any).ratio || "16:9" // Use passed ratio (cast as any since Template interface update pending)
        };

        const { data, error } = await supabase
            .from('custom_templates')
            .insert(dbPayload)
            .select()
            .single();

        if (data && !error) {
            const newTemplate: Template = {
                id: data.id,
                label: data.label,
                coverUrl: data.cover_url,
                thumbnailUrl: data.cover_url,
                videoUrl: data.video_url,
                category: 'Custom',
                fullPrompt: data.prompt,
                ratio: data.ratio,
                title: data.label,
                description: data.prompt || "Custom Video",
                rating: 5,
                likes: 0,
                isPremium: true
            };
            setMyTemplates(prev => [newTemplate, ...prev]);
        }
    };

    const deleteCustomTemplate = async (id: string) => {
        if (!supabaseUser) return;

        setMyTemplates(prev => prev.filter(t => t.id !== id)); // Optimistic

        await supabase
            .from('custom_templates')
            .delete()
            .eq('id', id);
    };

    // --- UI State ---
    const [isPricingOpen, setPricingOpen] = useState(false);
    const [isSettingsOpen, setSettingsOpen] = useState(false);

    return (
        <AppContext.Provider value={{
            user,
            isAuthenticated: !!user,
            isLoading,
            logout,
            credits,
            addCredits,
            /* 
             * Note: In a real app, deductCredits returning true/false synchronously 
             * while doing async DB call is risky for race conditions, 
             * but acceptable for this MVP level.
             */
            deductCredits,
            savedTemplateIds,
            toggleSaveTemplate,
            isSaved,
            myTemplates,
            officialTemplates, // Add this
            categories, // Add this
            addCustomTemplate,
            deleteCustomTemplate,
            isPricingOpen,
            setPricingOpen,
            isSettingsOpen,
            setSettingsOpen
        }}>
            {children}
        </AppContext.Provider>
    );
}

export function useApp() {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error("useApp must be used within an AppProvider");
    }
    return context;
}
