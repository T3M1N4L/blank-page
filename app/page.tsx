'use client'

import { useState, useEffect } from 'react'
import Navbar from './components/Navbar'
import Editor from './components/Editor'
import { ThemeProvider } from './components/theme-provider'

export default function Home() {
  const [notes, setNotes] = useState<{ id: string; title: string; content: string }[]>([])
  const [currentNote, setCurrentNote] = useState<{ id: string; title: string; content: string } | null>(null)
  const [showNavbar, setShowNavbar] = useState(true)

  useEffect(() => {
    const savedNotes = localStorage.getItem('notes')
    if (savedNotes) {
      const parsedNotes = JSON.parse(savedNotes)
      setNotes(parsedNotes)
      
      const lastEditedNoteId = localStorage.getItem('lastEditedNoteId')
      if (lastEditedNoteId) {
        const lastNote = parsedNotes.find((note: { id: string }) => note.id === lastEditedNoteId)
        if (lastNote) {
          setCurrentNote(lastNote)
        } else {
          setCurrentNote(parsedNotes[0])
        }
      } else {
        setCurrentNote(parsedNotes[0])
      }
    } else {
      const initialNote = {
        id: Date.now().toString(),
        title: 'Untitled Note',
        content: '',
      }
      setNotes([initialNote])
      setCurrentNote(initialNote)
    }

    // Hide navbar when typing
    let timeout: NodeJS.Timeout
    const handleMouseMove = () => {
      setShowNavbar(true)
      clearTimeout(timeout)
      timeout = setTimeout(() => setShowNavbar(false), 2000)
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  useEffect(() => {
    localStorage.setItem('notes', JSON.stringify(notes))
    if (currentNote) {
      localStorage.setItem('lastEditedNoteId', currentNote.id)
    }
  }, [notes, currentNote])

  const createNewNote = () => {
    const newNote = {
      id: Date.now().toString(),
      title: 'Untitled Note',
      content: '',
    }
    setNotes([...notes, newNote])
    setCurrentNote(newNote)
  }

  const updateCurrentNote = (content: string) => {
    if (currentNote) {
      const updatedNote = { ...currentNote, content }
      setCurrentNote(updatedNote)
      setNotes(notes.map(note => note.id === currentNote.id ? updatedNote : note))
    }
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" forcedTheme="dark">
      <div className="min-h-screen bg-black text-white">
        <Navbar
          notes={notes}
          currentNote={currentNote}
          setCurrentNote={setCurrentNote}
          createNewNote={createNewNote}
          show={showNavbar}
        />
        <main className="container mx-auto px-4 py-8">
          {currentNote && (
            <Editor
              content={currentNote.content}
              updateContent={updateCurrentNote}
            />
          )}
        </main>
      </div>
    </ThemeProvider>
  )
}

