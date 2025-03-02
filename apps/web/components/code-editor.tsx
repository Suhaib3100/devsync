"use client"

import { useState, useEffect } from "react"
import { Check, Copy, Terminal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

interface CodeEditorProps {
  content: string
  onChange: (value: string) => void
  readOnly?: boolean
}

export default function CodeEditor({ content, onChange, readOnly }: CodeEditorProps) {
  const [language, setLanguage] = useState("plaintext")
  const [copied, setCopied] = useState(false)
  const [lineNumbers, setLineNumbers] = useState<number[]>([])

  useEffect(() => {
    // Detect language based on content
    const detectLanguage = () => {
      if (content.includes("<?php")) return "php"
      if (content.includes("<!DOCTYPE html") || content.includes("<html")) return "html"
      if (content.includes("import ") && content.includes("from ")) return "javascript"
      if (content.includes("def ") || content.includes("print(")) return "python"
      if (content.includes("public class ") || content.includes("public static void")) return "java"
      if (content.includes("#include")) return "cpp"
      return "plaintext"
    }

    setLanguage(detectLanguage())

    // Update line numbers
    const lines = content.split("\n").length
    setLineNumbers(Array.from({ length: lines }, (_, i) => i + 1))
  }, [content])

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const getLanguageColor = () => {
    const colors: { [key: string]: string } = {
      html: "text-orange-500",
      javascript: "text-yellow-500",
      python: "text-blue-500",
      java: "text-red-500",
      php: "text-purple-500",
      cpp: "text-cyan-500",
      plaintext: "text-zinc-500",
    }
    return colors[language] || colors.plaintext
  }

  return (
    <div className="rounded-lg border border-zinc-800 bg-black/50 backdrop-blur-sm overflow-hidden">
      {/* Editor Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <Terminal className={`h-4 w-4 ${getLanguageColor()}`} />
          <span className={`text-sm font-medium ${getLanguageColor()}`}>
            {language.charAt(0).toUpperCase() + language.slice(1)}
          </span>
        </div>
        <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-emerald-500" onClick={handleCopy}>
          {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>

      {/* Editor Content */}
      <div className="p-4 font-mono text-sm relative">
        <div className="flex">
          {/* Line Numbers */}
          <div className="select-none text-right pr-4 text-zinc-600">
            {lineNumbers.map((num) => (
              <div key={num} className="h-6">
                {num}
              </div>
            ))}
          </div>

          {/* Code Content */}
          <div className="flex-1 overflow-x-auto">
            <textarea
              value={content}
              onChange={(e) => onChange(e.target.value)}
              className="w-full bg-transparent text-zinc-300 focus:outline-none resize-none min-h-[200px]"
              style={{ lineHeight: "24px" }}
              spellCheck="false"
              readOnly={readOnly}
            />
          </div>
        </div>

        {/* Language Indicator */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium bg-zinc-900/50 border border-zinc-800"
        >
          {language}
        </motion.div>
      </div>
    </div>
  )
}

