"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Sparkles, Send } from "lucide-react"

export default function AnalysisPage() {
  const [inputText, setInputText] = useState("")
  const [analysis, setAnalysis] = useState<{text: string, sentiment: string, confidence: number}[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAnalyze = async () => {
    if (!inputText.trim()) return

    setIsAnalyzing(true)
    setError(null)
    try {
      const inputs = inputText.split('\n').map(line => line.trim()).filter(line => line.length > 0)
      const response = await fetch('http://127.0.0.1:8000/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inputs }),
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setAnalysis(data.results)
    } catch (error) {
      console.error('Error analyzing text:', error)
      setError(error instanceof Error ? error.message : 'An unknown error occurred')
      setAnalysis([])
    }
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
              placeholder="Enter text to analyze (one sentence per line for multiple analyses)..."
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
        {analysis.length > 0 && (
          <Card className="border-border bg-muted/50 p-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold">Analysis Results</h2>
              </div>
              <div className="space-y-4">
                {analysis.map((result, index) => (
                  <div key={index} className="border-l-4 border-primary pl-4">
                    <p className="text-base leading-relaxed text-foreground mb-2">"{result.text}"</p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className={`font-medium ${result.sentiment === 'good' ? 'text-green-600' : 'text-red-600'}`}>
                        Sentiment: {result.sentiment}
                      </span>
                      <span className="text-muted-foreground">
                        Confidence: {(result.confidence * 100).toFixed(2)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* Error Area */}
        {error && (
          <Card className="border-red-500 bg-red-50 p-6">
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 text-red-500">⚠️</div>
              <h2 className="text-lg font-semibold text-red-700">Analysis Error</h2>
            </div>
            <p className="mt-2 text-red-600">{error}</p>
          </Card>
        )}
      </div>
    </div>
  )
}