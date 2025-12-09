import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { MobileNav } from "@/components/MobileNav";
import { Outlet } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { PricingModal } from "@/components/PricingModal";


export function MainLayout() {
    const { isPricingOpen, setPricingOpen } = useApp();

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row">
            <Sidebar />
            <div className="flex-1 flex flex-col md:ml-64 min-h-screen transition-all duration-300 relative">
                <Header />
                <main className="flex-1 p-4 md:p-6 overflow-y-auto pb-24 md:pb-6">
                    <Outlet />
                </main>
                <MobileNav />
            </div>

            {/* Global Modals Rendered at Root Level to avoid Z-Index Issues */}
            <PricingModal isOpen={isPricingOpen} onClose={() => setPricingOpen(false)} />
        </div>
    );
}
