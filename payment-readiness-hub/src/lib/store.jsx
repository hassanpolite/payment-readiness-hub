/**
 * App data, saved in the browser (localStorage). Nothing is sent to a server.
 * One object holds everything so backup (export) and restore (import) are simple.
 */
import { createContext, useCallback, useContext, useEffect, useState } from 'react'

const KEY = 'payment-readiness-hub:v1'

export const EMPTY = {
  profile: { name: '', businessName: '', phone: '', email: '', paymentDetails: '', kraPin: '' },
  answers: { legalStatus: 'recognised_refugee', workType: 'freelance', location: '', documents: {} },
  invoices: [],
  transactions: [],
  settings: { groqKey: '', language: 'en' },
  version: 1,
}

function load() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { ...EMPTY, isNew: true }
    const data = JSON.parse(raw)
    return { ...EMPTY, ...data, profile: { ...EMPTY.profile, ...data.profile }, answers: { ...EMPTY.answers, ...data.answers }, settings: { ...EMPTY.settings, ...data.settings } }
  } catch {
    return { ...EMPTY, isNew: true }
  }
}

export function newId() {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`
}

/** Checks an imported backup before replacing the current data. */
export function validateBackup(data) {
  if (!data || typeof data !== 'object') return 'This file is not a valid backup.'
  if (!Array.isArray(data.invoices) || !Array.isArray(data.transactions) || typeof data.answers !== 'object') {
    return 'This file is not a Payment Readiness Hub backup.'
  }
  return null
}

const StoreContext = createContext(null)

export function StoreProvider({ children }) {
  const [data, setData] = useState(load)
  const [saveError, setSaveError] = useState('')

  useEffect(() => {
    try {
      const { isNew, ...toSave } = data // eslint-disable-line no-unused-vars
      localStorage.setItem(KEY, JSON.stringify(toSave))
      setSaveError('')
    } catch {
      setSaveError('Your browser blocked saving. Changes will be lost when you close this tab. Export a backup from Settings.')
    }
  }, [data])

  const update = useCallback((part, value) => setData((d) => ({ ...d, isNew: false, [part]: typeof value === 'function' ? value(d[part]) : value })), [])
  const replaceAll = useCallback((next) => setData({ ...EMPTY, ...next, isNew: false }), [])

  return <StoreContext.Provider value={{ data, update, replaceAll, saveError }}>{children}</StoreContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useStore() {
  return useContext(StoreContext)
}
