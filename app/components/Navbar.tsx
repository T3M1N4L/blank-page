'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import {
  FileText,
  Share,
  MoreVertical,
  Download,
  Save,
  Eye,
  EyeOff,
  Maximize,
  SpellCheckIcon as SpellcheckIcon,
  Columns as Columns2,
  Trash,
  Edit,
  Menu,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

interface NavbarProps {
  notes: { id: string; title: string; content: string; isRendered: boolean }[]
  currentNote: { id: string; title: string; content: string; isRendered: boolean } | null
  setCurrentNote: (note: { id: string; title: string; content: string; isRendered: boolean }) => void
  createNewNote: () => void
  show: boolean
  isRendered: boolean
  toggleRendering: () => void
  updateNoteTitle: (title: string) => void
  deleteNote: (id: string) => void
  renameNote: (id: string, newTitle: string) => void
  toggleSplitScreen: () => void
  isSplitScreen: boolean
}

export default function Navbar({
  notes,
  currentNote,
  setCurrentNote,
  createNewNote,
  show,
  isRendered,
  toggleRendering,
  updateNoteTitle,
  deleteNote,
  renameNote,
  toggleSplitScreen,
  isSplitScreen,
}: NavbarProps) {
  const [isCountingWords, setIsCountingWords] = useState(true)
  const [emailAddress, setEmailAddress] = useState('')
  const [showingWords, setShowingWords] = useState(false)


  const getCount = () => {
    if (!currentNote) return ''
    if (showingWords) {
      const wordCount = currentNote.content.trim().split(/\s+/).filter(Boolean).length
      return `${wordCount} words`
    }
    return `${currentNote.content.length} characters`
  }

  const toggleCounter = () => setIsCountingWords(!isCountingWords)

  const downloadMarkdown = () => {
    if (currentNote) {
      const element = document.createElement('a')
      const file = new Blob([currentNote.content], { type: 'text/markdown' })
      element.href = URL.createObjectURL(file)
      element.download = `${currentNote.title}.md`
      document.body.appendChild(element)
      element.click()
      document.body.removeChild(element)
    }
  }

  const emailMarkdown = (asRaw: boolean) => {
    if (currentNote) {
      const subject = encodeURIComponent(currentNote.title)
      const body = encodeURIComponent(
        asRaw ? currentNote.content : convertToHtml(currentNote.content)
      )
      window.location.href = `mailto:${emailAddress}?subject=${subject}&body=${body}`
    }
  }

  const convertToHtml = (markdown: string) => {
    return markdown
      .replace(/^(#{1,6})\s(.+)$/gm, (_, hashes, text) => {
        const level = hashes.length
        return `<h${level}>${text}</h${level}>`
      })
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/gm, '<br>')
  }

  return (
    <div
      className={`
        fixed top-0 left-0 right-0 
        transition-opacity duration-300 
        ${show ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        bg-background
        z-50
      `}
    >
      <div className="container mx-auto px-4 py-2 flex justify-between items-center text-foreground w-full">
        <div className="flex items-center space-x-4 w-full">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <FileText className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              {notes.map((note) => (
                <DropdownMenu key={note.id}>
                  <DropdownMenuTrigger className="w-full">
                    <DropdownMenuItem
                      onSelect={(e) => {
                        e.preventDefault()
                        setCurrentNote(note)
                      }}
                      className="flex items-center justify-between"
                    >
                      <div className="flex-1 truncate">{note.title}</div>
                      <MoreVertical className="h-4 w-4 ml-2" />
                    </DropdownMenuItem>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem
                      onSelect={() => renameNote(note.id, prompt('Enter new title') || note.title)}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => deleteNote(note.id)}
                      className="text-red-500"
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={createNewNote}>
                <Save className="mr-2 h-4 w-4" />
                <span>New Note</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="flex-1 min-w-[200px] max-w-[300px]">
            {currentNote && (
              <Input
                value={currentNote.title}
                onChange={(e) => updateNoteTitle(e.target.value)}
                className="h-8 bg-transparent border-none focus-visible:ring-0 px-2 text-sm placeholder:text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                placeholder="Untitled Note"
              />
            )}
          </div>
        </div>
        <div className="flex items-center space-x-4">
        <Button
            variant="ghost"
            className="text-sm text-muted-foreground"
            onClick={toggleCounter}
          >
            {getCount()}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleRendering}
            className="flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            {isRendered ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon">
                <Share className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Share Note</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <Button onClick={downloadMarkdown}>Download as .md</Button>
                <Input
                  placeholder="Email address"
                  value={emailAddress}
                  onChange={(e) => setEmailAddress(e.target.value)}
                />
                <Button onClick={() => emailMarkdown(false)}>Email as HTML</Button>
                <Button onClick={() => emailMarkdown(true)}>Email as Raw Markdown</Button>
              </div>
            </DialogContent>
          </Dialog>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onSelect={toggleSplitScreen}>
                <Columns2 className="mr-2 h-4 w-4" />
                Split Screen
                <span className="ml-auto text-xs text-muted-foreground">Ctrl+Shift+S</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Maximize className="mr-2 h-4 w-4" />
                Fullscreen
                <span className="ml-auto text-xs text-muted-foreground">Ctrl+Shift+F</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <SpellcheckIcon className="mr-2 h-4 w-4" />
                Spellcheck
                <span className="ml-auto text-xs text-muted-foreground">Ctrl+Shift+K</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}
