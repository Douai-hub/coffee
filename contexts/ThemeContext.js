import React, { createContext, useContext, useState, useEffect } from "react";
import { useColorScheme } from "react-native";

const ThemeContext = createContext();

export const lightTheme = {
    background: "#f8f9fb",
    cardBackground: "#ffffff",
    text: "#2b2d42",
    textSecondary: "#6c757d",
    primary: "#e1e1e1ff",
    danger: "#ff6b6b",
    border: "#e0e0e0",
    shadowColor: "#000",
    inputBackground: "#fff",
};

export const darkTheme = {
    background: "#1a1a1a",
    cardBackground: "#2d2d2d",
    text: "#ffffff",
    textSecondary: "#a0a0a0",
    primary: "#4b4f4bff",
    danger: "#ff6b6b",
    border: "#404040",
    shadowColor: "#000",
    inputBackground: "#3a3a3a",
};

export function ThemeProvider({ children }) {
    const systemColorScheme = useColorScheme();
    const [isDarkMode, setIsDarkMode] = useState(systemColorScheme === "dark");

    useEffect(() => {
        setIsDarkMode(systemColorScheme === "dark");
    }, [systemColorScheme]);

    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode);
    };

    const theme = isDarkMode ? darkTheme : lightTheme;

    return (
        <ThemeContext.Provider value={{ theme, isDarkMode, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}