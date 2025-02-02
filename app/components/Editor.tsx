'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import ReactMarkdown from 'react-markdown'
import hljs from 'highlight.js'
import 'highlight.js/styles/github-dark.css'
import { Button } from '@/components/ui/button'
import { Copy, Check } from 'lucide-react'

interface EditorProps {
  content: string
  updateContent: (content: string) => void
  isRendered: boolean
}

export default function Editor({ content, updateContent, isRendered }: EditorProps) {
  const editorRef = useRef<HTMLTextAreaElement>(null)
  const [copied, setCopied] = useState<string | null>(null)

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.value = content
    }
  }, [content])

  useEffect(() => {
    const applyHighlighting = () => {
      if (isRendered) {
        document.querySelectorAll('pre code').forEach((block) => {
          hljs.highlightElement(block as HTMLElement)
        })
      }
    }

    applyHighlighting()

    const observer = new MutationObserver(applyHighlighting)
    observer.observe(document.body, { childList: true, subtree: true })

    return () => observer.disconnect()
  }, [content, isRendered])

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value
    updateContent(newContent)
  }

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(id)
      setTimeout(() => setCopied(null), 2000)
    })
  }

  return (
    <div className="relative w-full max-w-3xl mx-auto mt-16">
      <textarea
        ref={editorRef}
        onChange={handleInput}
        className={cn(
          "w-full min-h-[calc(100vh-8rem)] bg-black text-white",
          "outline-none resize-none",
          "text-lg leading-relaxed",
          "placeholder-gray-500",
          "scrollbar-thin scrollbar-thumb-zinc-900 scrollbar-track-transparent",
          isRendered ? "hidden" : "block"
        )}
        placeholder="Start typing here..."
      />
      {isRendered && (
        <div className="w-full min-h-[calc(100vh-8rem)] overflow-auto scrollbar-thin scrollbar-thumb-zinc-900 scrollbar-track-transparent">
          <ReactMarkdown
            className={cn(
              "prose prose-invert max-w-none",
              "text-lg leading-relaxed",
              "[&>h1]:text-4xl [&>h2]:text-3xl [&>h3]:text-2xl [&>h4]:text-xl [&>h5]:text-lg [&>h6]:text-base",
              "[&>h1]:font-bold [&>h2]:font-bold [&>h3]:font-bold [&>h4]:font-semibold [&>h5]:font-semibold [&>h6]:font-semibold",
              "[&>h1]:mb-4 [&>h2]:mb-3 [&>h3]:mb-2 [&>h4]:mb-2 [&>h5]:mb-2 [&>h6]:mb-2",
              "[&>p]:mb-4",
              "[&>ul]:list-disc [&>ul]:ml-6 [&>ul]:mb-4",
              "[&>ol]:list-decimal [&>ol]:ml-6 [&>ol]:mb-4",
              "[&>blockquote]:border-l-4 [&>blockquote]:border-zinc-700 [&>blockquote]:pl-4 [&>blockquote]:italic",
              "[&>hr]:my-8 [&>hr]:border-zinc-800",
              "[&>table]:w-full [&>table]:my-6 [&>table]:border-collapse",
              "[&>table>thead>tr>th]:border [&>table>thead>tr>th]:border-zinc-800 [&>table>thead>tr>th]:p-2 [&>table>thead>tr>th]:bg-zinc-900",
              "[&>table>tbody>tr>td]:border [&>table>tbody>tr>td]:border-zinc-800 [&>table>tbody>tr>td]:p-2",
              "text-white"
            )}
            components={{
              code({node, inline, className, children, ...props}) {
                const match = /language-(\w+)/.exec(className || '')
                const id = Math.random().toString(36).substr(2, 9)

                if (inline) {
                  return (
                    <code className={cn("bg-zinc-900 rounded px-1.5 py-0.5 text-sm", className)} {...props}>
                      {children}
                    </code>
                  )
                }

                return match ? (
                  <div className="relative my-4 rounded-lg overflow-hidden border border-zinc-800">
                    <div className="flex items-center justify-between px-4 py-2 bg-black border-b border-zinc-800">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-zinc-700" />
                        <span className="text-sm text-zinc-400 font-mono">
                          {match[1]}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(String(children), id)}
                        className="h-8 w-8 p-0 hover:bg-zinc-800"
                      >
                        {copied === id ? (
                          <Check className="h-4 w-4 text-zinc-400" />
                        ) : (
                          <Copy className="h-4 w-4 text-zinc-400" />
                        )}
                        <span className="sr-only">Copy code</span>
                      </Button>
                    </div>
                    <div className="p-4 bg-black">
                      <pre className="!m-0 !bg-black">
                        <code className={`!bg-black language-${match[1].toLowerCase()}`}>
                          {String(children).replace(/\n$/, '')}
                        </code>
                      </pre>
                    </div>
                  </div>
                ) : (
                  <div className="relative my-4 rounded-lg overflow-hidden border border-zinc-800">
                    <pre className="!m-0 !bg-black">
                      <code className="!bg-black">{String(children).replace(/\n$/, '')}</code>
                    </pre>
                  </div>
                )
              },
              // Other components (like h1, h2, etc.) are unchanged
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      )}
    </div>
  )
}
