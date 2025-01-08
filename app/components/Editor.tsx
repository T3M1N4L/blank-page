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
  isSplitScreen: boolean
}

export default function Editor({ content, updateContent, isRendered, isSplitScreen }: EditorProps) {
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

  const HeadingWithoutMenu = ({ level, children }: { level: number, children: React.ReactNode }) => {
    const Tag = `h${level}` as keyof JSX.IntrinsicElements
    const sizes = {
      1: 'text-4xl',
      2: 'text-3xl',
      3: 'text-2xl',
      4: 'text-xl',
      5: 'text-lg',
      6: 'text-base',
    }

    return (
      <Tag className={`${sizes[level as keyof typeof sizes]} font-bold mb-4`}>
        {children}
      </Tag>
    )
  }

  return (
    <div className={cn(
      "relative w-full max-w-none mx-auto mt-16",
      isSplitScreen ? "flex" : ""
    )}>
      <textarea
        ref={editorRef}
        onChange={handleInput}
        className={cn(
          "w-full min-h-[calc(100vh-4rem)] bg-black text-white",
          "outline-none resize-none",
          "text-lg leading-relaxed",
          "placeholder-gray-500",
          "p-4",
          isRendered && !isSplitScreen ? "hidden" : "block",
          isSplitScreen ? "flex-1" : ""
        )}
        placeholder="Start typing here..."
      />
      {(isRendered || isSplitScreen) && (
        <div className={cn(
          "w-full min-h-[calc(100vh-4rem)] overflow-auto p-4",
          isSplitScreen ? "flex-1" : ""
        )}>
          <ReactMarkdown
            className={cn(
              "prose prose-invert max-w-none",
              "text-lg leading-relaxed",
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
              h1: ({ children }) => <HeadingWithoutMenu level={1}>{children}</HeadingWithoutMenu>,
              h2: ({ children }) => <HeadingWithoutMenu level={2}>{children}</HeadingWithoutMenu>,
              h3: ({ children }) => <HeadingWithoutMenu level={3}>{children}</HeadingWithoutMenu>,
              h4: ({ children }) => <HeadingWithoutMenu level={4}>{children}</HeadingWithoutMenu>,
              h5: ({ children }) => <HeadingWithoutMenu level={5}>{children}</HeadingWithoutMenu>,
              h6: ({ children }) => <HeadingWithoutMenu level={6}>{children}</HeadingWithoutMenu>,
              code({node, inline, className, children, ...props}) {
                const match = /language-(\w+)/.exec(className || '')
                const id = Math.random().toString(36).substr(2, 9)
                return !inline || !match ? (
                  <div className="relative my-4 rounded-lg overflow-hidden border border-zinc-800">
                    <div className="flex items-center justify-between px-4 py-2 bg-black border-b border-zinc-800">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-zinc-700" />
                        <span className="text-sm text-zinc-400 font-mono">
                          {match ? match[1] : "plaintext"}
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
                        <code className={`!bg-black ${match ? `language-${match[1].toLowerCase()}` : ''}`}>
                          {String(children).replace(/\n$/, '')}
                        </code>
                      </pre>
                    </div>
                  </div>
                ) : (
                  <code className={cn("bg-zinc-900 rounded px-1.5 py-0.5 text-sm", className)} {...props}>
                    {children}
                  </code>
                )
              }
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      )}
    </div>
  )
}
