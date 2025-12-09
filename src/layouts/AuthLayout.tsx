import { Outlet } from "react-router-dom";

export function AuthLayout() {
    return (
        <div className="min-h-screen grid items-center justify-center bg-background relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background" />
            <div className="relative z-10 w-full max-w-md p-6">
                <div className="mb-8 text-center">
                    <div className="inline-flex size-12 rounded-xl bg-primary/20 items-center justify-center mb-4">
                        <div className="size-6 rounded-full bg-primary" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">Welcome to VidGenius</h1>
                </div>
                <Outlet />
            </div>
        </div>
    );
}
