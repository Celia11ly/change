import { Link, useLocation } from "react-router-dom";
import { LayoutGrid, PlusCircle, Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";

export function MobileNav() {
    const location = useLocation();

    const NAV_ITEMS = [
        { icon: LayoutGrid, label: "Home", path: "/" },
        { icon: PlusCircle, label: "Create", path: "/studio" },
        { icon: Bookmark, label: "Saved", path: "/collection" },
        // Simple Profile link that goes to settings or just visual placeholder if no profile page exists yet
        // Since we have a modal for settings, let's just use home/create/saved for navigation.
    ];

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-background/80 backdrop-blur-xl border-t z-40 flex items-center justify-around px-2 pb-safe-area-inset-bottom">
            {NAV_ITEMS.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={cn(
                            "flex flex-col items-center justify-center gap-1 w-full h-full",
                            isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <item.icon className={cn("size-6 transition-all", isActive && "scale-110")} />
                        <span className="text-[10px] font-medium">{item.label}</span>
                    </Link>
                );
            })}
        </div>
    );
}
