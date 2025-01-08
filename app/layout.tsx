import './globals.css'
import { Inter } from 'next/font/google'
import { FileText } from 'lucide-react'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Scribbled Page',
  description: 'A modern note-taking app',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}

