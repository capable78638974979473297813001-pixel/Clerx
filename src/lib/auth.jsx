import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { api } from './api'

const AuthCtx = createContext(null)
export const useAuth = () => useContext(AuthCtx)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [company, setCompany] = useState(null)
  const [loading, setLoading] = useState(true)

  const apply = (data) => { setUser(data.user); setCompany(data.company) }

  const refresh = useCallback(async () => {
    try { const d = await api.me(); apply(d) }
    catch { setUser(null); setCompany(null) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { refresh() }, [refresh])

  const login = async (email, password) => { apply(await api.login(email, password)) }
  const signup = async (payload) => { apply(await api.signup(payload)) }
  const demo = async () => { apply(await api.demo()) }
  const logout = async () => { await api.logout(); setUser(null); setCompany(null) }

  return (
    <AuthCtx.Provider value={{ user, company, loading, login, signup, demo, logout, refresh, setCompany }}>
      {children}
    </AuthCtx.Provider>
  )
}
