import Chat from "./components/Chat";
import Sidebar from "./components/Sidebar";
import { useTheme } from "./hooks/useTheme";

export default function Home() {
    const { isDark, toggleTheme } = useTheme()
    return (
        <div className="flex h-screen overflow-hidden bg-background">
            <Sidebar />
            <Chat isDark={isDark} toggleTheme={toggleTheme} />
        </div>
    )
}