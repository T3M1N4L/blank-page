'use client'

import { useState, useEffect } from 'react'
import Navbar from './components/Navbar'
import Editor from './components/Editor'
import { ThemeProvider } from './components/theme-provider'

export default function Home() {
  const [notes, setNotes] = useState<{ id: string; title: string; content: string; isRendered: boolean }[]>([])
  const [currentNote, setCurrentNote] = useState<{ id: string; title: string; content: string; isRendered: boolean } | null>(null)
  const [showNavbar, setShowNavbar] = useState(true)
  const [isRendered, setIsRendered] = useState(false)
  const [isSplitScreen, setIsSplitScreen] = useState(false)

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
          setIsRendered(lastNote.isRendered)
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
        isRendered: false,
      }
      setNotes([initialNote])
      setCurrentNote(initialNote)
    }

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
      isRendered: false,
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

  const updateNoteTitle = (title: string) => {
    if (currentNote) {
      const updatedNote = { ...currentNote, title }
      setCurrentNote(updatedNote)
      setNotes(notes.map(note => note.id === currentNote.id ? updatedNote : note))
    }
  }

  const toggleRendering = () => {
    if (currentNote) {
      const updatedNote = { ...currentNote, isRendered: !currentNote.isRendered }
      setCurrentNote(updatedNote)
      setNotes(notes.map(note => note.id === currentNote.id ? updatedNote : note))
      setIsRendered(!isRendered)
    }
  }

  const toggleSplitScreen = () => {
    setIsSplitScreen(!isSplitScreen)
  }

  const deleteNote = (id: string) => {
    const updatedNotes = notes.filter(note => note.id !== id)
    setNotes(updatedNotes)
    if (currentNote && currentNote.id === id) {
      setCurrentNote(updatedNotes[0] || null)
    }
  }

  const renameNote = (id: string, newTitle: string) => {
    const updatedNotes = notes.map(note => 
      note.id === id ? { ...note, title: newTitle } : note
    )
    setNotes(updatedNotes)
    if (currentNote && currentNote.id === id) {
      setCurrentNote({ ...currentNote, title: newTitle })
    }
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <div className="min-h-screen bg-background text-foreground">
        <Navbar
          notes={notes}
          currentNote={currentNote}
          setCurrentNote={setCurrentNote}
          createNewNote={createNewNote}
          show={showNavbar}
          isRendered={isRendered}
          toggleRendering={toggleRendering}
          updateNoteTitle={updateNoteTitle}
          deleteNote={deleteNote}
          renameNote={renameNote}
          toggleSplitScreen={toggleSplitScreen}
          isSplitScreen={isSplitScreen}
        />
        <main className="container mx-auto px-4 py-8">
          {currentNote && (
            <Editor
              key={currentNote.id}
              content={currentNote.content}
              updateContent={updateCurrentNote}
              isRendered={isRendered}
              isSplitScreen={isSplitScreen}
            />
          )}
        </main>
      </div>
    </ThemeProvider>
  )
}

