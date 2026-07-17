import { useEffect } from "react";
import { useAppStore } from "@/store/app-store";

export function useThemeInit() {
  const theme = useAppStore((s) => s.theme);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);
}
