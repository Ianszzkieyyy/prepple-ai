import { LogoutButton } from "@/components/logout-button";
import { ThemeSwitcher } from "@/components/theme-switcher";

export default function Navbar(userProfile?: { name: string }) {
    return (
        <nav className="w-full px-32 py-4 border-b-2 border-border/50">
            <div className="flex justify-between items-center">
                <h1 className="text-lg font-bold">PreppleAI</h1>
                <div className="flex items-center gap-4">
                    <ThemeSwitcher />
                    {userProfile && 
                        <span >Hello, {userProfile.name}</span>
                    }
                    <LogoutButton />
                </div>
            </div>
        </nav>
    )
}