import { useState, useEffect } from 'react'

export const useDarkMode = () => {
  const [isDark, setIsDark] = useState(() => {
    const stored = localStorage.getItem('g360_dark_mode')
    if (stored !== null) return stored === 'true'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    localStorage.setItem('g360_dark_mode', String(isDark))
  }, [isDark])

  const toggleDark = () => setIsDark(!isDark)

  return { isDark, toggleDark }
}
