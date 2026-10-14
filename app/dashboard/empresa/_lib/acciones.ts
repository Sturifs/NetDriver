'use client'
import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../../../supabase'
import { CAMPOS_CONDUCTOR, EstadoPostulacion } from './datos'

export const SELECT_POSTULACION =
  `*, empleo:empleos(id, titulo, licencias, region, comuna, tipo_trabajo, es_relampago), conductor:profiles!postulaciones_conductor_id_fkey(${CAMPOS_CONDUCTOR})`

export const SELECT_ENTREVISTA =
  `*, empleo:empleos(id, titulo), conductor:profiles!entrevistas_conductor_id_fkey(${CAMPOS_CONDUCTOR})`

export async function cambiarEstadoPostulacion(id: string, estado: EstadoPostulacion) {
  const cambios: any = { estado, updated_at: new Date().toISOString() }
  if (estado === 'contratado') cambios.fecha_contratacion = new Date().toISOString()
  return supabase.from('postulaciones').update(cambios).eq('id', id)
}

// Conjunto de conductores guardados por la empresa + función para guardar/quitar
export function useGuardados(empresaId: string) {
  const [ids, setIds] = useState<Set<string>>(new Set())
  const cargar = useCallback(async () => {
    if (!empresaId) return
    const { data } = await supabase.from('conductores_guardados').select('conductor_id').eq('empresa_id', empresaId)
    setIds(new Set((data || []).map((g: any) => g.conductor_id)))
  }, [empresaId])
  useEffect(() => { cargar() }, [cargar])

  const alternar = useCallback(async (conductorId: string) => {
    const guardado = ids.has(conductorId)
    const { error } = guardado
      ? await supabase.from('conductores_guardados').delete().eq('empresa_id', empresaId).eq('conductor_id', conductorId)
      : await supabase.from('conductores_guardados').insert({ empresa_id: empresaId, conductor_id: conductorId })
    if (!error) {
      setIds(prev => { const n = new Set(prev); guardado ? n.delete(conductorId) : n.add(conductorId); return n })
      return !guardado
    }
    return null
  }, [ids, empresaId])

  return { guardados: ids, alternarGuardado: alternar, recargarGuardados: cargar }
}
