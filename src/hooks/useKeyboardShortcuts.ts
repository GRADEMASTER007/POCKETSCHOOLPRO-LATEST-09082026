import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export function useKeyboardShortcuts() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Use Alt + Key for shortcuts
      if (e.altKey) {
        switch (e.key.toLowerCase()) {
          case "d":
            e.preventDefault();
            navigate("/");
            break;
          case "a":
            e.preventDefault();
            navigate("/accessibility");
            break;
          case "p":
            e.preventDefault();
            navigate("/profile");
            break;
          case "t":
            e.preventDefault();
            navigate("/tutor");
            break;
          case "s":
            e.preventDefault();
            navigate("/sign-language");
            break;
          case "h":
            e.preventDefault();
            navigate("/guide");
            break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate]);
}
