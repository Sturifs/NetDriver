'use client'
import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../supabase'
import { useEmpresa } from '../_lib/contexto'
import { diasHasta, fechaHora, haceCuanto, nombreConductor, RUTA } from '../_lib/datos'
import { C, Card, Cargando, PageHeader, Vacio } from '../_lib/ui'

type Alerta = { icono: string; texto: string; sub: string; cuando?: string; color: string; ir: string; orden: number }

export default function Notificaciones() {
  const router = useRouter()
  const { userId, perfil } = useEmpresa()
  const [alertas, setAlertas] = useState<Alerta[]>([])
  const [cargando, setCargando] = useState(true)

  const cargar = useCallback(async () => {
    const ahora = Date.now()
    const [p, e, en, o] = await Promise.all([
      supabase.from('postulaciones').select('id, created_at, conductor_id, conductor:profiles!postulaciones_conductor_id_fkey(nombre, apellido), empleo:empleos(titulo)').eq('empresa_id', userId).eq('estado', 'nueva').order('created_at', { ascending: false }).limit(30),
      supabase.from('empleos').select('id, titulo, fecha_vencimiento, estado').eq('empresa_id', userId).eq('estado', 'activo'),
      supabase.from('entrevistas').select('id, fecha_hora, conductor_id, conductor:profiles!entrevistas_conductor_id_fkey(nombre, apellido)').eq('empresa_id', userId).eq('estado', 'programada').order('fecha_hora'),
      supabase.from('opiniones_empresa').select('id, puntaje, created_at').eq('empresa_id', userId).gte('created_at', new Date(ahora - 30 * 86400000).toISOString()),
    ])
    const lista: Alerta[] = []
    ;(en.data || []).forEach((x: any) => {
      const t = new Date(x.fecha_hora).getTime()
      if (t >= ahora) lista.push({ icono: '🤝', texto: `Entrevista con ${nombreConductor(x.conductor)}`, sub: fechaHora(x.fecha_hora), color: '#e8f0fe', ir: '/entrevistas', orden: t - ahora < 2 * 86400000 ? 0 : 3 })
      else lista.push({ icono: '📝', texto: `¿Cómo te fue con ${nombreConductor(x.conductor)}?`, sub: `La entrevista era el ${fechaHora(x.fecha_hora)}. Registra el resultado.`, color: '#fff8e1', ir: '/entrevistas', orden: 1 })
    })
    ;(e.data || []).forEach((x: any) => {
      const d = diasHasta(x.fecha_vencimiento)
      if (d == null) return
      if (d < 0) lista.push({ icono: '⛔', texto: `"${x.titulo}" venció`, sub: 'Ya no se muestra a los conductores. Extiéndelo o ciérralo.', color: '#fdecec', ir: `/empleos/${x.id}`, orden: 1 })
      else if (d <= 3) lista.push({ icono: '⏰', texto: `"${x.titulo}" está por vencer`, sub: d === 0 ? 'Vence hoy.' : `Vence en ${d} día${d > 1 ? 's' : ''}.`, color: '#fff8e1', ir: `/empleos/${x.id}`, orden: 2 })
    })
    ;(p.data || []).forEach((x: any) => lista.push({ icono: '📋', texto: `${nombreConductor(x.conductor)} postuló a "${x.empleo?.titulo || 'tu empleo'}"`, sub: 'Revisa su perfil.', cuando: x.created_at, color: '#e8f5e9', ir: `/conductores/${x.conductor_id}?postulacion=${x.id}`, orden: 4 }))
    ;(o.data || []).forEach((x: any) => lista.push({ icono: '⭐', texto: `Recibiste una opinión de ${x.puntaje} estrella${x.puntaje > 1 ? 's' : ''}`, sub: 'Mira lo que dicen de tu empresa.', cuando: x.created_at, color: '#f3e8fd', ir: '/opiniones', orden: 5 }))
    if (!perfil.descripcion_empresa || !perfil.rut_empresa || !perfil.logo_url) lista.push({ icono: '🏢', texto: 'Completa el perfil de tu empresa', sub: 'Agrega logo, RUT y descripción para generar más confianza.', color: '#f3e8fd', ir: '/configuracion', orden: 6 })
    setAlertas(lista.sort((a, b) => a.orden - b.orden)); setCargando(false)
  }, [userId, perfil])
  useEffect(() => { cargar() }, [cargar])

  return (
    <div style={{ maxWidth: '760px' }}>
      <PageHeader titulo="Alertas y notificaciones" sub="Lo que requiere tu atención, en orden de prioridad." />
      <Card padding="10px">
        {cargando ? <Cargando /> : alertas.length === 0
          ? <Vacio icono="✨" titulo="Todo al día" texto="No tienes alertas pendientes." />
          : alertas.map((a, i) => (
            <div key={i} onClick={() => router.push(RUTA + a.ir)} style={{ background: a.color, borderRadius: '8px', padding: '12px 14px', margin: '6px', cursor: 'pointer', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '1.1rem' }}>{a.icono}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.88rem', fontWeight: 600, color: C.navy }}>{a.texto}</div>
                <div style={{ fontSize: '0.8rem', color: C.muted }}>{a.sub}</div>
              </div>
              {a.cuando && <span style={{ fontSize: '0.75rem', color: C.muted, whiteSpace: 'nowrap' }}>{haceCuanto(a.cuando)}</span>}
              <span style={{ color: C.muted }}>›</span>
            </div>
          ))}
      </Card>
    </div>
  )
}
