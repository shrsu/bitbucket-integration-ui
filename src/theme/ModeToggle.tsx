import { Button } from "@/components/ui/button";
import { type JSX } from "react";
import { PiMoonBold, PiSunBold } from "react-icons/pi";
import { useTheme } from "./ThemeProvider";

export function ModeToggle(): JSX.Element {
  const { theme, setTheme } = useTheme();

  const toggleTheme = (): void => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <Button
      onClick={toggleTheme}
      variant="ghost"
      className="relative h-8 w-8 cursor-pointer border"
    >
      <PiSunBold className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
      <PiMoonBold className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
