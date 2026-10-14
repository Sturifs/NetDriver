'use client'
import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../supabase'
import { useEmpresa } from '../_lib/contexto'
import { colorPara, mensajeWhatsApp } from '../_lib/componentes'
import { CAMPOS_CONDUCTOR, enlaceWhatsApp, haceCuanto, nombreConductor, RUTA } from '../_lib/datos'
import { Avatar, Btn, C, Card, Cargando, IconBtn, inputStyle, PageHeader, Vacio } from '../_lib/ui'

export default function Guardados() {
  const router = useRouter()
  const { userId, perfil, avisar, recargarContadores } = useEmpresa()
  const [items, setItems] = useState<any[]>([])
  const [cargando, setCargando] = useState(true)
  const [notas, setNotas] = useState<Record<string, string>>({})

  const cargar = useCallback(async () => {
    const { data } = await supabase.from('conductores_guardados')
      .select(`*, conductor:profiles!guardados_conductor_id_fkey(${CAMPOS_CONDUCTOR})`)
      .eq('empresa_id', userId).order('created_at', { ascending: false })
    setItems(data || [])
    setNotas(Object.fromEntries((data || []).map((g: any) => [g.conductor_id, g.nota || ''])))
    setCargando(false)
  }, [userId])
  useEffect(() => { cargar() }, [cargar])

  const quitar = async (conductorId: string) => {
    const { error } = await supabase.from('conductores_guardados').delete().eq('empresa_id', userId).eq('conductor_id', conductorId)
    if (error) return avisar('No se pudo quitar', 'error')
    setItems(x => x.filter(g => g.conductor_id !== conductorId)); recargarContadores(); avisar('Conductor quitado de guardados')
  }
  const guardarNota = async (conductorId: string) => {
    const { error } = await supabase.from('conductores_guardados').update({ nota: notas[conductorId] || null }).eq('empresa_id', userId).eq('conductor_id', conductorId)
    avisar(error ? 'No se pudo guardar la nota' : 'Nota guardada', error ? 'error' : 'ok')
  }

  return (
    <div>
      <PageHeader titulo="Conductores guardados" sub="Tu lista de conductores de interés para futuras contrataciones.">
        <Btn onClick={() => router.push(`${RUTA}/busqueda`)}>🔍 Buscar más conductores</Btn>
      </PageHeader>
      {cargando ? <Cargando /> : items.length === 0
        ? <Card><Vacio icono="🔖" titulo="Aún no guardas conductores" texto="Marca con ☆ a los conductores que te interesen desde la búsqueda o las postulaciones." accion="Buscar conductores" onAccion={() => router.push(`${RUTA}/busqueda`)} /></Card>
        : (
          <div className="nd-grid-2">
            {items.map(g => {
              const c = g.conductor || {}
              const wa = enlaceWhatsApp(c.telefono, mensajeWhatsApp(perfil.nombre_empresa || 'nuestra empresa', c))
              return (
                <Card key={g.conductor_id}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', cursor: 'pointer' }} onClick={() => router.push(`${RUTA}/conductores/${c.id}`)}>
                    <Avatar nombre={c.nombre} apellido={c.apellido} foto={c.foto_perfil_url} color={colorPara(c.id)} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, color: C.navy }}>{nombreConductor(c)}</div>
                      <div style={{ fontSize: '0.8rem', color: C.muted }}>{[(c.licencias || []).join(', '), c.comuna || c.region].filter(Boolean).join(' · ')}</div>
                      <div style={{ fontSize: '0.72rem', color: C.muted }}>Guardado {haceCuanto(g.created_at).toLowerCase()}</div>
                    </div>
                  </div>
                  <textarea value={notas[g.conductor_id] || ''} onChange={e => setNotas(n => ({ ...n, [g.conductor_id]: e.target.value }))} onBlur={() => notas[g.conductor_id] !== (g.nota || '') && guardarNota(g.conductor_id)} rows={2} placeholder="Nota privada (ej: buen candidato para faena Calama)" style={{ ...inputStyle, margin: '12px 0', resize: 'vertical', fontSize: '0.82rem' }} />
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <Btn onClick={() => router.push(`${RUTA}/conductores/${c.id}`)} style={{ flex: 1, justifyContent: 'center', padding: '7px' }}>Ver perfil</Btn>
                    <IconBtn title={wa ? 'Escribir por WhatsApp' : 'Sin teléfono registrado'} href={wa} onClick={() => avisar('Este conductor aún no registra un teléfono', 'error')}>💬</IconBtn>
                    <IconBtn title="Quitar de guardados" onClick={() => quitar(g.conductor_id)}>🗑</IconBtn>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
    </div>
  )
}
