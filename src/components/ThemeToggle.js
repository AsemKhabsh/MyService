"use client";

import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    if (savedTheme !== theme) {
      setTheme(savedTheme);
    }
    document.documentElement.setAttribute("data-theme", savedTheme);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
  };

  return (
    <button
      onClick={toggleTheme}
      className="btn btn-ghost btn-circle btn-sm"
      aria-label="Toggle Theme"
      type="button"
    >
      {theme === "light" ? (
        <Moon className="w-5 h-5 text-base-content" />
      ) : (
        <Sun className="w-5 h-5 text-warning" />
      )}
    </button>
  );
}
