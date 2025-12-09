import { Link, useLocation } from "react-router-dom";
import { LayoutGrid, PlusCircle, Bookmark, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
    { icon: LayoutGrid, label: "Templates", path: "/" },
    { icon: PlusCircle, label: "Creation", path: "/studio" },
    { icon: Bookmark, label: "Collection", path: "/collection" },
];

export function Sidebar() {
    const location = useLocation();

    return (
        <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-card/50 backdrop-blur-xl hidden md:flex flex-col">
            <div className="flex h-16 items-center px-6 border-b">
                <Link to="/" className="flex items-center gap-2 font-bold text-xl text-primary">
                    <div className="size-8 rounded-lg bg-primary/20 flex items-center justify-center">
                        <div className="size-4 rounded-full bg-primary" />
                    </div>
                    <span>VidGenius</span>
                </Link>
            </div>

            <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
                <div className="text-xs font-semibold text-muted-foreground px-2 mb-2 uppercase tracking-wider">
                    Menu
                </div>
                {NAV_ITEMS.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                                isActive
                                    ? "bg-primary/10 text-primary"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            <item.icon className="size-5" />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t">
                <button
                    onClick={() => { /* Handle logout */ }}
                    className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm font-medium text-destructive/80 hover:bg-destructive/10 hover:text-destructive transition-all mt-1"
                >
                    <LogOut className="size-5" />
                    Logout
                </button>
            </div>
        </aside>
    );
}
