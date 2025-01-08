'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

interface EditorProps {
  content: string
  updateContent: (content: string) => void
}

export default function Editor({ content, updateContent }: EditorProps) {
  const [html, setHtml] = useState('')
  const editorRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.value = content
    }
  }, [content])

  const processMarkdown = (text: string) => {
    // Process headings
    text = text.replace(/^(#{1,6})\s(.+)$/gm, (_, level, content) => {
      const size = 7 - level.length // h1 = 6, h2 = 5, etc.
      return `<h${level} class="text-${size}xl font-bold my-4">${content}</h${level}>`
    })

    // Process bold
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')

    // Process italic
    text = text.replace(/\*(.*?)\*/g, '<em>$1</em>')

    // Process code blocks
    text = text.replace(/```(\w+)?\n([\s\S]*?)\n```/g, (_, lang, code) => {
      return `<pre><code class="language-${lang || ''}">${code}</code></pre>`
    })

    // Wrap plain text in paragraphs
    text = text.replace(/^(?!(#|<h|<pre|<p))(.+)$/gm, '<p>$2</p>')

    return text
  }

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value
    updateContent(newContent)
    setHtml(processMarkdown(newContent))
  }

  return (
    <div className="relative w-[80%] mx-auto mt-16">
      <textarea
        ref={editorRef}
        onChange={handleInput}
        className={cn(
          "w-full min-h-[calc(100vh-4rem)] bg-black text-white",
          "outline-none resize-none",
          "text-lg leading-relaxed",
          "placeholder-gray-500",
          "absolute top-0 left-0 z-10 opacity-0"
        )}
        placeholder="Start typing here..."
      />
      <div
        className={cn(
          "w-full min-h-[calc(100vh-4rem)]",
          "prose prose-invert max-w-none",
          "text-lg leading-relaxed",
          "[&>*]:my-1 [&>h1]:mt-6 [&>h2]:mt-5 [&>h3]:mt-4"
        )}
        dangerouslySetInnerHTML={{ __html: html || '<p></p>' }}
      />
    </div>
  )
}

