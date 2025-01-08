import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Menu, Share, MoreVertical } from 'lucide-react'

interface NavbarProps {
  notes: { id: string; title: string; content: string }[]
  currentNote: { id: string; title: string; content: string } | null
  setCurrentNote: (note: { id: string; title: string; content: string }) => void
  createNewNote: () => void
  show: boolean
}

export default function Navbar({
  notes,
  currentNote,
  setCurrentNote,
  createNewNote,
  show,
}: NavbarProps) {
  const [isCountingWords, setIsCountingWords] = useState(true)
  const [emailAddress, setEmailAddress] = useState('')

  const wordCount = currentNote ? currentNote.content.trim().split(/\s+/).length : 0
  const characterCount = currentNote ? currentNote.content.length : 0

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
      const body = encodeURIComponent(asRaw ? currentNote.content : convertToHtml(currentNote.content))
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
    <nav 
      className={`
        fixed top-0 left-0 right-0 
        transition-opacity duration-300 
        ${show ? 'opacity-100' : 'opacity-0'}
        bg-black
      `}
    >
      <div className="container mx-auto px-4 py-2 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onSelect={createNewNote}>New Note</DropdownMenuItem>
              {notes.map(note => (
                <DropdownMenuItem key={note.id} onSelect={() => setCurrentNote(note)}>
                  {note.title}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="ghost" onClick={toggleCounter} className="text-sm">
            {isCountingWords ? `${wordCount} words` : `${characterCount} characters`}
          </Button>
        </div>
        <div className="flex items-center space-x-4">
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
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>
                Fullscreen
                <span className="ml-auto text-xs text-muted-foreground">Ctrl+Shift+F</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                Spellcheck
                <span className="ml-auto text-xs text-muted-foreground">Ctrl+Shift+K</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  )
}

