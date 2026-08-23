import { useEffect, useState } from "react";

const THEME_KEY = 'folio-theme';

function getInitialTheme(): boolean {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'dark') return true;
    if (saved === 'light') return false;

    return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function useTheme() {
    const [isDark, setIsDark] = useState(getInitialTheme);

    useEffect(() => {
        document.documentElement.classList.toggle('dark', isDark);
        localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light');
    }, [isDark]);

    function toggleTheme() {
        setIsDark((prev) => !prev);
    }

    return { isDark, toggleTheme }
}