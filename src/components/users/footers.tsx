import { Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <nav className="flex items-center justify-between gap-4 py-4 px-8">
        <div className="flex h-8 w-auto items-center justify-center rounded-lg">
          <span className="text-sm text-muted-foreground">
            © 2025 FeedbackAnalyzer by Group3 CADT-Gen9. All rights reserved.
          </span>
        </div>
        <div className="flex items-center gap-6">
            <a
          href="#"
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          Privacy Policy
        </a>
        <a
          href="#"
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          Terms of Service
        </a>
        <a
          href="#"
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          Contact
        </a>
        </div>
        
      </nav>
    </footer>
  );
}
