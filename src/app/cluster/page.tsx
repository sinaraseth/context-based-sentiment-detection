"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Sparkles, Send, ThumbsUp, ThumbsDown, Minus, Upload } from "lucide-react"
import * as XLSX from 'xlsx'

type ClusterResult = {
  text: string
  sentiment: string
  cluster_id: number
  topic: string
}

type SentimentSummary = {
  bad: { count: number; percentage: number }
  neutral: { count: number; percentage: number }
  good: { count: number; percentage: number }
}

type TopicCluster = {
  cluster_id: string
  topic: string
  count: number
  percentage_within_sentiment: number
}

type TopicSummary = {
  bad: TopicCluster[]
  good: TopicCluster[]
}

type ClusterResponse = {
  total_feedback: number
  sentiment_summary: SentimentSummary
  topic_summary: TopicSummary
}

const BUSINESS_TYPES = ["cafe", "ecommerce", "mobile_app", "bank"] as const
type BusinessType = typeof BUSINESS_TYPES[number]

const SAMPLE_DATA: Record<BusinessType, string> = {
  ecommerce: `I waited over two weeks for my package to arrive, and when it finally showed up, the item was completely damaged and unusable. This is absolutely unacceptable for an online retailer that claims fast shipping.
The customer service team was incredibly rude and unhelpful when I tried to return a defective product. They kept transferring me between departments and no one seemed willing to resolve the issue.
I've been a loyal customer for years, but the constant price increases without any improvement in quality or service are really disappointing. It's getting harder to justify shopping here.
The website checkout process is so confusing and buggy that I abandoned my cart multiple times. Simple things like applying discount codes don't work properly, which is frustrating.
Product descriptions are completely misleading - the item I received looks nothing like the photos and doesn't match the specifications listed. This feels like false advertising.
Shipping costs are outrageous for such small items, and the free shipping threshold is set so high that it defeats the purpose. I end up paying more in shipping than the product itself.
The return policy is unnecessarily complicated with too many restrictions. Other stores make it much easier to return items, so I'll be shopping elsewhere from now on.
I received the wrong size even though I double-checked my selection before ordering. The exchange process has been a nightmare with long wait times and poor communication.
Quality control seems nonexistent - I've received multiple items with manufacturing defects. For the prices you're charging, I expect much better quality assurance.
The mobile app crashes constantly and the search functionality is terrible. It's impossible to find products or track orders efficiently on the app.`,
  
  cafe: `The coffee here used to be amazing, but lately it tastes burnt and over-extracted. I've tried different blends and preparation methods, but nothing helps. It's really disappointing.
Service is incredibly slow during peak hours, with wait times exceeding 20 minutes for a simple coffee order. The staff seems overwhelmed and disorganized, which affects the whole experience.
Atmosphere is nice but the music is way too loud, making it difficult to have conversations or work. The volume level is uncomfortable and distracting for customers.
Prices have increased significantly over the past year without any corresponding improvement in quality or portion sizes. A basic latte now costs more than it should for what you get.
The pastries are stale and dry most mornings. I've complained multiple times about this, but nothing changes. Fresh baked goods should be a priority for a cafe.
WiFi connection is unreliable and slow, which is a big problem for people who come here to work. The internet drops frequently and the speed is inadequate for modern needs.
Cleanliness standards have declined noticeably. Tables aren't wiped down properly between customers, and the bathroom facilities are often in poor condition.
The seating arrangement is cramped and uncomfortable. There isn't enough space between tables, and the chairs are hard and not conducive to longer stays.
Menu options are limited and repetitive. After a few visits, you realize there aren't many choices, and the seasonal specials don't change often enough to keep things interesting.
Staff training appears inadequate - baristas forget orders, make drinks incorrectly, and lack knowledge about the products they're serving. This affects overall customer satisfaction.`,
  
  mobile_app: `The app crashes every time I try to upload photos, making it impossible to share content with my friends. This bug has been present for months without any fixes from the developers.
Battery drain is excessive - the app uses more power than any other application on my phone. It runs constantly in the background even when I'm not using it actively.
User interface is confusing and not intuitive. New users struggle to navigate basic features, and the onboarding process doesn't adequately explain how to use the app.
Push notifications are annoying and can't be customized properly. I get bombarded with irrelevant alerts that I can't turn off without disabling all notifications entirely.
Search functionality is broken - it doesn't return relevant results and often shows completely unrelated content. This makes finding specific information nearly impossible.
Loading times are painfully slow, especially when scrolling through feeds or opening profiles. The app feels sluggish and unresponsive compared to competitors.
Privacy settings are overly complicated and hard to understand. Users have no clear way to control what data is shared or who can see their information.
Offline functionality is severely limited. The app becomes almost useless without an internet connection, which defeats the purpose of having a mobile application.
In-app purchases are confusing with hidden fees and unclear pricing. Users are surprised by additional charges that weren't properly disclosed during checkout.
Customer support is unresponsive and unhelpful. When reporting bugs or issues, responses are delayed and often don't address the actual problem being reported.`,
  
  bank: `Online banking platform is constantly down for maintenance during business hours, making it impossible to manage finances when I need to. This is unacceptable for a financial institution.
Fees are hidden and excessive - I discovered multiple charges I wasn't aware of, including monthly service fees that weren't clearly disclosed when I opened the account.
Customer service wait times are ridiculous, often exceeding 45 minutes on hold. When I finally speak to someone, they seem unprepared and unable to resolve my issues efficiently.
Mobile app security features are inadequate. Two-factor authentication fails frequently, and there are no biometric login options available despite being standard in other banking apps.
Check deposit process is unnecessarily complicated and takes days to clear. Other banks offer instant deposits, so this service feels outdated and inefficient.
ATM fees are charged even at the bank's own machines in some locations. This is confusing and frustrating when you expect to avoid fees by using your bank's ATMs.
Account opening process was smooth, but closing an account has been a nightmare with multiple follow-ups and paperwork requirements that seem designed to discourage customers.
Interest rates on savings accounts are embarrassingly low compared to competitors. With inflation being what it is, my money is actually losing value while stored here.
Branch staff lack product knowledge and can't answer basic questions about services or accounts. They frequently need to consult with supervisors for simple inquiries.
Digital security alerts are overly sensitive and trigger false positives constantly. I receive security warnings for legitimate transactions, creating unnecessary anxiety.`
}

export default function ClusterPage() {
  const [businessType, setBusinessType] = useState<BusinessType>("ecommerce")
  const [feedbackTexts, setFeedbackTexts] = useState<string[]>([])
  const [uploadedFileName, setUploadedFileName] = useState<string>("")
  const [results, setResults] = useState<ClusterResponse | null>(null)
  const [isClustering, setIsClustering] = useState(false)
  const [isProcessingFile, setIsProcessingFile] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Handle Excel file upload and extract feedback texts
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsProcessingFile(true)
    setError(null)

    try {
      const data = await file.arrayBuffer()
      const workbook = XLSX.read(data)
      const worksheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[worksheetName]

      // Convert to JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][]

      if (jsonData.length < 2) {
        throw new Error("Excel file must contain at least a header row and one data row")
      }

      // Find the "Feedback Text" column index
      const headerRow = jsonData[0]
      const feedbackTextIndex = headerRow.findIndex((header: any) =>
        String(header).toLowerCase().includes('feedback') &&
        String(header).toLowerCase().includes('text')
      )

      if (feedbackTextIndex === -1) {
        throw new Error("Could not find 'Feedback Text' column in the Excel file. Please ensure your file has a column with 'Feedback Text' in the header.")
      }

      // Extract feedback texts from the identified column
      const extractedTexts: string[] = []
      for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i]
        const feedbackText = row[feedbackTextIndex]
        if (feedbackText && String(feedbackText).trim()) {
          extractedTexts.push(String(feedbackText).trim())
        }
      }

      if (extractedTexts.length === 0) {
        throw new Error("No feedback texts found in the 'Feedback Text' column")
      }

      setFeedbackTexts(extractedTexts)
      setUploadedFileName(file.name)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process Excel file")
      setFeedbackTexts([])
      setUploadedFileName("")
    } finally {
      setIsProcessingFile(false)
    }
  }

  const handleCluster = async () => {
    if (feedbackTexts.length === 0) return

    setIsClustering(true)
    setError(null)
    try {
      const response = await fetch('http://127.0.0.1:8000/cluster', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ business_type: businessType, inputs: feedbackTexts }),
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data: ClusterResponse = await response.json()
      setResults(data)
    } catch (error) {
      console.error('Error clustering text:', error)
      setError(error instanceof Error ? error.message : 'An unknown error occurred')
      setResults(null)
    }
    setIsClustering(false)
  }



  return (
    <div className="container max-w-4xl px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="mb-3 text-4xl font-bold tracking-tight text-balance md:text-5xl">Cluster Feedback</h1>
        <p className="text-lg text-muted-foreground text-pretty">
          Group similar feedback into clusters with topics and sentiment analysis
        </p>
      </div>

      <div className="space-y-6">
        {/* Input Area */}
        <Card className="border-border p-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Business Type</label>
              <select
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value as BusinessType)}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {BUSINESS_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Excel File Upload</label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="excel-upload"
                  disabled={isProcessingFile}
                />
                <label htmlFor="excel-upload" className="cursor-pointer">
                  <div className="flex flex-col items-center gap-3">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium">
                        {isProcessingFile ? "Processing file..." : "Click to upload Excel file"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Supports .xlsx and .xls files with a "Feedback Text" column
                      </p>
                    </div>
                  </div>
                </label>
              </div>

              {uploadedFileName && (
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
                  <div className="h-4 w-4 text-green-600">✓</div>
                  <div className="text-sm">
                    <span className="font-medium">{uploadedFileName}</span>
                    <span className="text-muted-foreground ml-2">
                      ({feedbackTexts.length} feedback texts extracted)
                    </span>
                  </div>
                </div>
              )}

              {feedbackTexts.length > 0 && (
                <div className="text-xs text-muted-foreground">
                  Preview of extracted feedback texts:
                  <div className="mt-2 max-h-32 overflow-y-auto bg-gray-50 p-2 rounded text-xs font-mono">
                    {feedbackTexts.slice(0, 3).map((text, index) => (
                      <div key={index} className="truncate mb-1">
                        {index + 1}. {text}
                      </div>
                    ))}
                    {feedbackTexts.length > 3 && (
                      <div className="text-muted-foreground">
                        ... and {feedbackTexts.length - 3} more texts
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <Button
              onClick={handleCluster}
              disabled={feedbackTexts.length === 0 || isClustering || isProcessingFile}
              size="lg"
              className="gap-2"
            >
              {isClustering ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                  Clustering...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Cluster Feedback
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* Results Area */}
        {results && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold">Clustering Results</h2>
              <p className="text-muted-foreground">
                Analysis of {results.total_feedback} feedback items
              </p>
            </div>

            {/* Sentiment Summary */}
            <Card className="border-border p-6">
              <h3 className="text-lg font-semibold mb-4">Sentiment Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <ThumbsDown className="h-6 w-6 text-red-600" />
                  <div>
                    <div className="text-2xl font-bold text-red-700">{results.sentiment_summary.bad.count}</div>
                    <div className="text-sm text-red-600">Bad ({results.sentiment_summary.bad.percentage}%)</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <Minus className="h-6 w-6 text-yellow-600" />
                  <div>
                    <div className="text-2xl font-bold text-yellow-700">{results.sentiment_summary.neutral.count}</div>
                    <div className="text-sm text-yellow-600">Neutral ({results.sentiment_summary.neutral.percentage}%)</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <ThumbsUp className="h-6 w-6 text-green-600" />
                  <div>
                    <div className="text-2xl font-bold text-green-700">{results.sentiment_summary.good.count}</div>
                    <div className="text-sm text-green-600">Good ({results.sentiment_summary.good.percentage}%)</div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Topic Summaries */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Bad Topics */}
              <Card className="border-border p-6">
                <h3 className="text-lg font-semibold mb-4 text-red-700">Bad Feedback Topics</h3>
                <div className="space-y-3">
                  {results.topic_summary.bad.map((cluster, index) => (
                    <div key={index} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium text-red-800">{cluster.topic}</span>
                        <span className="text-sm text-red-600">{cluster.percentage_within_sentiment}%</span>
                      </div>
                      <div className="text-sm text-red-700">{cluster.count} feedbacks</div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Good Topics */}
              <Card className="border-border p-6">
                <h3 className="text-lg font-semibold mb-4 text-green-700">Good Feedback Topics</h3>
                <div className="space-y-3">
                  {results.topic_summary.good.map((cluster, index) => (
                    <div key={index} className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium text-green-800">{cluster.topic}</span>
                        <span className="text-sm text-green-600">{cluster.percentage_within_sentiment}%</span>
                      </div>
                      <div className="text-sm text-green-700">{cluster.count} feedbacks</div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Error Area */}
        {error && (
          <Card className="border-red-500 bg-red-50 p-6">
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 text-red-500">⚠️</div>
              <h2 className="text-lg font-semibold text-red-700">Clustering Error</h2>
            </div>
            <p className="mt-2 text-red-600">{error}</p>
          </Card>
        )}
      </div>
    </div>
  )
}