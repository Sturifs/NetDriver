'use client'
import { createContext, useContext } from 'react'

export type Contadores = { postulacionesNuevas: number; guardados: number; entrevistasProximas: number; empleosActivos: number }

export type EmpresaCtx = {
  userId: string
  perfil: any
  recargarPerfil: () => Promise<void>
  contadores: Contadores
  recargarContadores: () => Promise<void>
  faltaBaseDatos: boolean
  avisar: (texto: string, tipo?: 'ok' | 'error') => void
}

export const EmpresaContext = createContext<EmpresaCtx | null>(null)

export function useEmpresa() {
  const ctx = useContext(EmpresaContext)
  if (!ctx) throw new Error('useEmpresa debe usarse dentro del dashboard de empresa')
  return ctx
}

// Detecta el error de "la tabla no existe" (SQL aún no ejecutado en Supabase)
export const esFaltaTabla = (error: any) =>
  !!error && (error.code === '42P01' || error.code === 'PGRST205' || /does not exist|Could not find the table/i.test(error.message || ''))
