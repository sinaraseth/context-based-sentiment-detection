"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Sparkles, Send, ThumbsUp, ThumbsDown, Minus } from "lucide-react"

type SentimentResult = {
  sentiment: "positive" | "negative" | "neutral"
  confidence: number
  keywords: string[]
}

export default function AnalysisPage() {
  const [inputText, setInputText] = useState("")
  const [analysis, setAnalysis] = useState<SentimentResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const handleAnalyze = async () => {
    if (!inputText.trim()) return

    setIsAnalyzing(true)
    // Simulate API call - replace with actual backend API
    await new Promise((resolve) => setTimeout(resolve, 1500))
    
    // Mock sentiment analysis result
    const mockResult: SentimentResult = {
      sentiment: inputText.toLowerCase().includes("good") || inputText.toLowerCase().includes("great") 
        ? "positive" 
        : inputText.toLowerCase().includes("bad") || inputText.toLowerCase().includes("terrible")
        ? "negative"
        : "neutral",
      confidence: Math.random() * 30 + 70, // Random confidence between 70-100%
      keywords: ["quality", "service", "experience", "product"]
    }
    
    setAnalysis(mockResult)
    setIsAnalyzing(false)
  }

  const getSentimentIcon = () => {
    if (!analysis) return null
    switch (analysis.sentiment) {
      case "positive":
        return <ThumbsUp className="h-6 w-6 text-green-500" />
      case "negative":
        return <ThumbsDown className="h-6 w-6 text-red-500" />
      case "neutral":
        return <Minus className="h-6 w-6 text-yellow-500" />
    }
  }

  const getSentimentColor = () => {
    if (!analysis) return ""
    switch (analysis.sentiment) {
      case "positive":
        return "text-green-500"
      case "negative":
        return "text-red-500"
      case "neutral":
        return "text-yellow-500"
    }
  }

  const getSentimentBgColor = () => {
    if (!analysis) return ""
    switch (analysis.sentiment) {
      case "positive":
        return "bg-green-500/10 border-green-500/20"
      case "negative":
        return "bg-red-500/10 border-red-500/20"
      case "neutral":
        return "bg-yellow-500/10 border-yellow-500/20"
    }
  }

  return (
    <div className="container max-w-4xl px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="mb-3 text-4xl font-bold tracking-tight text-balance md:text-5xl">
          Analyze Your Feedback
        </h1>
        <p className="text-lg text-muted-foreground text-pretty">
          Enter your feedback below and get instant sentiment analysis with AI-powered insights
        </p>
      </div>

      <div className="space-y-6">
        {/* Input Area */}
        <Card className="border-border p-6">
          <div className="space-y-4">
            <Textarea
              placeholder="Type or paste your feedback here..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="min-h-37.5 resize-none text-base leading-relaxed"
            />
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {inputText.length} characters
              </span>
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
                    Analyze Sentiment
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>

        {/* Results Area */}
        {analysis && (
          <Card className={`border p-6 ${getSentimentBgColor()}`}>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                {getSentimentIcon()}
                <h2 className="text-2xl font-bold capitalize">
                  <span className={getSentimentColor()}>{analysis.sentiment}</span> Sentiment
                </h2>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    Confidence Score
                  </span>
                  <span className="text-lg font-semibold">
                    {analysis.confidence.toFixed(1)}%
                  </span>
                </div>

                <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full transition-all duration-500 ${
                      analysis.sentiment === "positive"
                        ? "bg-green-500"
                        : analysis.sentiment === "negative"
                        ? "bg-red-500"
                        : "bg-yellow-500"
                    }`}
                    style={{ width: `${analysis.confidence}%` }}
                  />
                </div>
              </div>

              <div className="pt-2">
                <h3 className="mb-2 text-sm font-medium text-muted-foreground">
                  Key Aspects Detected
                </h3>
                <div className="flex flex-wrap gap-2">
                  {analysis.keywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="rounded-full bg-background px-3 py-1 text-sm font-medium"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4 rounded-lg bg-background/50 p-4">
                <p className="text-sm leading-relaxed text-foreground">
                  <span className="font-semibold">Analysis Summary:</span> The feedback
                  has been classified as{" "}
                  <span className={`font-semibold ${getSentimentColor()}`}>
                    {analysis.sentiment}
                  </span>{" "}
                  with {analysis.confidence.toFixed(1)}% confidence. This indicates{" "}
                  {analysis.sentiment === "positive"
                    ? "a favorable customer experience."
                    : analysis.sentiment === "negative"
                    ? "areas that need attention and improvement."
                    : "a balanced or mixed customer experience."}
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}