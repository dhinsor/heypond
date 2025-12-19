import { useTheme } from "../context/ThemeContext";
import { Moon, Sun } from "lucide-react";
import { Half2Icon } from "@radix-ui/react-icons";

// Theme toggle component using same icons as Better Todo app
// Icons: Moon (dark), Sun (light), Half2Icon (tan), Cloud (cloud)
export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  // Get the appropriate icon for current theme
  const getIcon = () => {
    switch (theme) {
      case "dark":
        return <Moon size={18} />;
      case "tan":
        // Half2Icon from Radix uses different sizing
        return <Sun style={{ width: 18, height: 18 }} />;
    }
  };

  // Get theme label for accessibility
  const getLabel = () => {
    switch (theme) {
      case "dark":
        return "Dark";
      case "tan":
        return "Tan";
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="theme-toggle"
      aria-label={`Current theme: ${getLabel()}. Click to toggle.`}
      title={`Theme: ${getLabel()}`}
    >
      {getIcon()}
    </button>
  );
}
