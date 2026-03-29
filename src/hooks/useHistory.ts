import { useState, useEffect } from 'react'
import { HistoryItem } from '../types'

const STORAGE_KEY = 'g360_day_calculator_history'
const MAX_ITEMS = 50

export const useHistory = () => {
  const [history, setHistory] = useState<HistoryItem[]>([])

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        setHistory(JSON.parse(stored))
      } catch {
        setHistory([])
      }
    }
  }, [])

  const addToHistory = (item: HistoryItem) => {
    setHistory(prev => {
      const newHistory = [item, ...prev].slice(0, MAX_ITEMS)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory))
      return newHistory
    })
  }

  const clearHistory = () => {
    setHistory([])
    localStorage.removeItem(STORAGE_KEY)
  }

  return { history, addToHistory, clearHistory }
}
