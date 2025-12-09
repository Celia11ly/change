import { Search, Bell, LogOut, Coins, Wallet } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { useState } from "react";


export function Header() {
    const { user, credits, logout, setPricingOpen } = useApp();
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const navigate = useNavigate();

    return (
        <header className="h-16 border-b border-border/50 backdrop-blur-xl sticky top-0 z-40 bg-background/80 flex items-center justify-between px-6">
            {/* Search Bar */}
            <div className="flex-1 max-w-xl relative hidden md:block">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                    type="text"
                    placeholder="Search templates..."
                    className="w-full h-9 pl-9 pr-4 rounded-full bg-secondary/50 border border-transparent focus:border-primary/50 outline-none text-sm transition-all"
                />
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-4 ml-auto">
                <button className="p-2 rounded-full hover:bg-secondary/80 text-muted-foreground relative">
                    <Bell className="size-5" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-background" />
                </button>

                {user ? (
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setPricingOpen(true)}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 hover:bg-primary/20 border border-primary/20 transition-all group"
                        >
                            <Coins className="size-4 text-primary group-hover:scale-110 transition-transform" />
                            <span className="text-sm font-bold text-primary">{credits} Credits</span>
                        </button>

                        <div className="relative">
                            <button
                                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                className="h-9 w-9 rounded-full bg-gradient-to-tr from-primary to-purple-500 p-[2px] cursor-pointer hover:shadow-lg transition-transform hover:scale-105"
                            >
                                <div className="h-full w-full rounded-full bg-background flex items-center justify-center overflow-hidden">
                                    <span className="font-bold text-xs">{user.name.substring(0, 2).toUpperCase()}</span>
                                </div>
                            </button>

                            {isUserMenuOpen && (
                                <div className="absolute top-12 right-0 w-48 bg-card border shadow-xl rounded-lg p-1 animate-in fade-in slide-in-from-top-2">
                                    <div className="px-2 py-1.5 text-sm font-semibold border-b mb-1">
                                        {user.name}
                                    </div>
                                    <button
                                        onClick={() => { navigate('/wallet'); setIsUserMenuOpen(false); }}
                                        className="w-full text-left px-3 py-2 text-sm hover:bg-muted rounded-md flex items-center gap-2"
                                    >
                                        <Wallet className="size-4" />
                                        My Wallet
                                    </button>

                                    <button
                                        onClick={logout}
                                        className="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-red-500/10 rounded-md flex items-center gap-2"
                                    >
                                        <LogOut className="size-4" />
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <Link to="/auth/login" className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-bold hover:bg-primary/90 text-sm">
                        Login
                    </Link>
                )}
            </div>
        </header>
    );
}
