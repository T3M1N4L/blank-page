'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import hljs from 'highlight.js'
import 'highlight.js/styles/github-dark.css'

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
    setHtml(processMarkdown(content))
  }, [content])

  useEffect(() => {
    hljs.highlightAll()
  }, [html])

  const processMarkdown = (text: string) => {
    // Process headings
    text = text.replace(/^(#{1,6})\s(.+)$/gm, (match, hashes, content) => {
      const level = hashes.length
      const size = 7 - level // h1 = 6, h2 = 5, etc.
      return `<h${level} class="text-${size}xl font-bold my-4">${match}</h${level}>`
    })

    // Process bold
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$&</strong>')

    // Process italic
    text = text.replace(/\*(.*?)\*/g, '<em>$&</em>')

    // Process code blocks
    text = text.replace(/```(\w+)?\n([\s\S]*?)\n```/g, (match, lang, code) => {
      const language = lang || 'plaintext'
      const highlightedCode = hljs.highlight(code, { language }).value
      return `
        <div class="relative my-4">
          <div class="absolute top-0 right-0 bg-gray-700 text-white text-xs px-2 py-1 rounded-bl">${language}</div>
          <button class="absolute top-0 right-16 bg-gray-700 text-white text-xs px-2 py-1 rounded-bl copy-btn" data-code="${encodeURIComponent(code)}">Copy</button>
          <pre><code class="hljs language-${language}">${highlightedCode}</code></pre>
        </div>
      `
    })

    // Process inline code
    text = text.replace(/`([^`]+)`/g, '<code class="bg-gray-800 rounded px-1">$&</code>')

    // Process bullet points
    text = text.replace(/^(\s*)-\s(.+)$/gm, (match, spaces, content) => {
      const indent = spaces.length
      return `<li class="ml-${indent * 4}">${match}</li>`
    })

    // Process checkboxes
    text = text.replace(/^(\s*)-\s\[(x| )\]\s(.+)$/gm, (match, spaces, checked, content) => {
      const indent = spaces.length
      const isChecked = checked === 'x'
      return `
        <div class="flex items-center ml-${indent * 4} my-1">
          <input type="checkbox" ${isChecked ? 'checked' : ''} class="mr-2 form-checkbox h-4 w-4 text-blue-600" disabled />
          <span>${match}</span>
        </div>
      `
    })

    // Wrap plain text in paragraphs
    text = text.replace(/^(?!(#|<h|<pre|<p|<li|<div))(.+)$/gm, '<p>$&</p>')

    return text
  }

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value
    updateContent(newContent)
    setHtml(processMarkdown(newContent))
  }

  useEffect(() => {
    const copyButtons = document.querySelectorAll('.copy-btn')
    copyButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = e.target as HTMLButtonElement
        const code = decodeURIComponent(target.getAttribute('data-code') || '')
        navigator.clipboard.writeText(code).then(() => {
          target.textContent = 'Copied!'
          setTimeout(() => {
            target.textContent = 'Copy'
          }, 2000)
        })
      })
    })
  }, [html])

  return (
    <div className="relative w-full max-w-3xl mx-auto mt-16">
      <textarea
        ref={editorRef}
        onChange={handleInput}
        className={cn(
          "w-full min-h-[calc(100vh-4rem)] bg-black text-white",
          "outline-none resize-none",
          "text-lg leading-relaxed",
          "placeholder-gray-500",
          "absolute top-0 left-0 z-10 opacity-30"
        )}
        placeholder="Start typing here..."
      />
      <div
        className={cn(
          "w-full min-h-[calc(100vh-4rem)]",
          "prose prose-invert max-w-none",
          "text-lg leading-relaxed",
          "[&>*]:my-1 [&>h1]:mt-6 [&>h2]:mt-5 [&>h3]:mt-4",
          "text-white",
          "pointer-events-none"
        )}
        dangerouslySetInnerHTML={{ __html: html || '<p></p>' }}
      />
    </div>
  )
}

