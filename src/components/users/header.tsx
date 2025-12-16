import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <nav className="flex items-center justify-between gap-4 py-4 px-8">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold">FeedbackAnalyzer</span>
        </div>
        <div className="flex items-center gap-6">
          <a
            href="/"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Sentiment Analysis
          </a>
          <a
            href="/users"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Batch Analysis
          </a>
          <a
            href="/cluster"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Clustering
          </a>
          <a
            href="#"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            About
          </a>
          <a
            href="#"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Documentation
          </a>
          <Button variant="outline" size="sm">
            Sign In
          </Button>
        </div>
      </nav>
    </header>
  );
}
