"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Sparkles, Send } from "lucide-react"

export default function AnalysisPage() {
  const [inputText, setInputText] = useState("")
  const [analysis, setAnalysis] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const handleAnalyze = async () => {
    if (!inputText.trim()) return

    setIsAnalyzing(true)
    // Simulate analysis - replace with actual API call
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setAnalysis(
      `Analysis complete! Your text has ${inputText.length} characters, ${inputText.split(" ").length} words, and ${inputText.split(/[.!?]+/).length - 1} sentences.`,
    )
    setIsAnalyzing(false)
  }

  return (
    <div className="container max-w-4xl px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="mb-3 text-4xl font-bold tracking-tight text-balance md:text-5xl">Analyze Your Text</h1>
        <p className="text-lg text-muted-foreground text-pretty">
          Enter your text below and get instant insights with AI-powered analysis
        </p>
      </div>

      <div className="space-y-6">
        {/* Input Area */}
        <Card className="border-border p-6">
          <div className="space-y-4">
            <Textarea
              placeholder="Type or paste your text here..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="min-h-[200px] resize-none text-base leading-relaxed"
            />
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{inputText.length} characters</span>
              <Button
                onClick={handleAnalyze}
                disabled={!inputText.trim() || isAnalyzing}
                size="lg"
                className="gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Analyze
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>

        {/* Results Area */}
        {analysis && (
          <Card className="border-border bg-muted/50 p-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold">Analysis Results</h2>
              </div>
              <p className="text-base leading-relaxed text-foreground">{analysis}</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}