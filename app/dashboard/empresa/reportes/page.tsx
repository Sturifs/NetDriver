'use client'
import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../supabase'
import { useEmpresa } from '../_lib/contexto'
import { SELECT_POSTULACION } from '../_lib/acciones'
import { estadoPostulacion, fecha, nombreConductor, RUTA } from '../_lib/datos'
import { Btn, C, Card, Cargando, Metrica, PageHeader, Vacio } from '../_lib/ui'

const DIA = 86400000

function Barras({ datos, color = C.blue, onClick }: { datos: { label: string; n: number; id?: string }[]; color?: string; onClick?: (id: string) => void }) {
  const max = Math.max(1, ...datos.map(d => d.n))
  if (!datos.length) return <div style={{ fontSize: '0.85rem', color: C.muted }}>Sin datos todavía.</div>
  return (
    <div>
      {datos.map(d => (
        <div key={d.label} onClick={() => d.id && onClick?.(d.id)} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', cursor: d.id && onClick ? 'pointer' : 'default' }}>
          <span style={{ fontSize: '0.8rem', color: C.navy, width: '170px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flexShrink: 0 }} title={d.label}>{d.label}</span>
          <div style={{ flex: 1, height: '10px', background: C.bg, borderRadius: '5px' }}><div style={{ width: `${(d.n / max) * 100}%`, height: '10px', background: color, borderRadius: '5px', minWidth: d.n ? '4px' : 0 }} /></div>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: C.navy, width: '28px', textAlign: 'right' }}>{d.n}</span>
        </div>
      ))}
    </div>
  )
}

export default function Reportes() {
  const router = useRouter()
  const { userId } = useEmpresa()
  const [postulaciones, setPostulaciones] = useState<any[]>([])
  const [empleos, setEmpleos] = useState<any[]>([])
  const [entrevistas, setEntrevistas] = useState<any[]>([])
  const [cargando, setCargando] = useState(true)
  const [dias, setDias] = useState(90)

  const cargar = useCallback(async () => {
    const [p, e, en] = await Promise.all([
      supabase.from('postulaciones').select(SELECT_POSTULACION).eq('empresa_id', userId),
      supabase.from('empleos').select('*').eq('empresa_id', userId),
      supabase.from('entrevistas').select('id, estado, fecha_hora, created_at').eq('empresa_id', userId),
    ])
    setPostulaciones(p.data || []); setEmpleos(e.data || []); setEntrevistas(en.data || []); setCargando(false)
  }, [userId])
  useEffect(() => { cargar() }, [cargar])

  if (cargando) return <Cargando texto="Calculando reportes..." />

  const desde = dias ? Date.now() - dias * DIA : 0
  const ps = postulaciones.filter(p => new Date(p.created_at).getTime() >= desde)
  const avanzadas = (estados: string[]) => ps.filter(p => estados.includes(p.estado)).length
  const embudo = [
    { label: 'Postulaciones recibidas', n: ps.length },
    { label: 'Revisadas o más', n: avanzadas(['revisada', 'preseleccionada', 'entrevista', 'contratado']) },
    { label: 'Preseleccionadas o más', n: avanzadas(['preseleccionada', 'entrevista', 'contratado']) },
    { label: 'Entrevistadas', n: avanzadas(['entrevista', 'contratado']) },
    { label: 'Contratadas', n: avanzadas(['contratado']) },
  ]
  const contratadas = ps.filter(p => p.estado === 'contratado')
  const tiempos = contratadas.filter(p => p.fecha_contratacion).map(p => (new Date(p.fecha_contratacion).getTime() - new Date(p.created_at).getTime()) / DIA)
  const promedioDias = tiempos.length ? Math.round(tiempos.reduce((a, b) => a + b, 0) / tiempos.length) : null

  const porEmpleo = empleos.map(e => ({ id: e.id, label: e.titulo, n: ps.filter(p => p.empleo_id === e.id).length })).sort((a, b) => b.n - a.n).slice(0, 8)
  const contar = (f: (p: any) => string[] | string | null | undefined) => {
    const m: Record<string, number> = {}
    ps.forEach(p => { const v = f(p); (Array.isArray(v) ? v : v ? [v] : ['Sin dato']).forEach(k => { m[k] = (m[k] || 0) + 1 }) })
    return Object.entries(m).map(([label, n]) => ({ label, n })).sort((a, b) => b.n - a.n).slice(0, 8)
  }
  const meses = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - (5 - i))
    const sig = new Date(d); sig.setMonth(sig.getMonth() + 1)
    return { label: d.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' }), n: postulaciones.filter(p => { const t = new Date(p.created_at); return t >= d && t < sig }).length }
  })

  const exportar = () => {
    const filas = [['Fecha', 'Conductor', 'Teléfono', 'Licencias', 'Comuna', 'Empleo', 'Estado'],
      ...ps.map(p => [fecha(p.created_at), nombreConductor(p.conductor), p.conductor?.telefono || '', (p.conductor?.licencias || []).join(' '), p.conductor?.comuna || '', p.empleo?.titulo || '', estadoPostulacion(p.estado).label])]
    const csv = '﻿' + filas.map(f => f.map(v => `"${String(v).replace(/"/g, '""')}"`).join(';')).join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    a.download = `postulaciones-netdriver-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
  }

  return (
    <div>
      <PageHeader titulo="Reportes y estadísticas" sub="Mide cómo funcionan tus procesos de contratación.">
        <select value={dias} onChange={e => setDias(Number(e.target.value))} style={{ border: `1px solid ${C.border}`, borderRadius: '8px', padding: '8px 10px', color: C.navy, background: 'white', fontSize: '0.85rem' }}>
          <option value={30}>Últimos 30 días</option><option value={90}>Últimos 90 días</option><option value={365}>Último año</option><option value={0}>Todo el historial</option>
        </select>
        {ps.length > 0 && <Btn variante="secundario" onClick={exportar}>⬇️ Exportar postulaciones</Btn>}
      </PageHeader>

      {postulaciones.length === 0 && empleos.length === 0
        ? <Card><Vacio icono="📊" titulo="Aún no hay datos para reportar" texto="Publica empleos y recibe postulaciones: aquí verás tu embudo de contratación, tiempos y más." accion="Publicar empleo" onAccion={() => router.push(`${RUTA}/publicar`)} /></Card>
        : <>
          <div className="nd-grid-4" style={{ marginBottom: '20px' }}>
            <Metrica icono="📋" label="Postulaciones" valor={ps.length} color={C.blue} bg="#e8f0fe" onClick={() => router.push(`${RUTA}/postulaciones`)} />
            <Metrica icono="🤝" label="Entrevistas realizadas" valor={entrevistas.filter(e => e.estado === 'realizada' && new Date(e.fecha_hora).getTime() >= desde).length} color={C.orange} bg="#fef3e2" onClick={() => router.push(`${RUTA}/entrevistas`)} />
            <Metrica icono="✅" label="Tasa de contratación" valor={ps.length ? ((contratadas.length / ps.length) * 100).toFixed(1) + '%' : '—'} sub={`${contratadas.length} contratados`} color={C.green} bg="#e8f5e9" onClick={() => router.push(`${RUTA}/contrataciones`)} />
            <Metrica icono="⏱" label="Días promedio a contratar" valor={promedioDias ?? '—'} sub="Desde la postulación" color={C.purple} bg="#f3e8fd" />
          </div>

          <div className="nd-grid-2" style={{ marginBottom: '16px' }}>
            <Card><div style={{ fontWeight: 700, color: C.navy, marginBottom: '14px' }}>Embudo de contratación</div><Barras datos={embudo} /></Card>
            <Card><div style={{ fontWeight: 700, color: C.navy, marginBottom: '14px' }}>Postulaciones por mes</div><Barras datos={meses} color={C.green} /></Card>
          </div>
          <div className="nd-grid-2" style={{ marginBottom: '16px' }}>
            <Card><div style={{ fontWeight: 700, color: C.navy, marginBottom: '14px' }}>Empleos con más postulaciones</div><Barras datos={porEmpleo} color={C.orange} onClick={id => router.push(`${RUTA}/empleos/${id}`)} /></Card>
            <Card><div style={{ fontWeight: 700, color: C.navy, marginBottom: '14px' }}>Licencias de los postulantes</div><Barras datos={contar(p => p.conductor?.licencias?.length ? p.conductor.licencias : null)} color={C.purple} /></Card>
          </div>
          <div className="nd-grid-2">
            <Card><div style={{ fontWeight: 700, color: C.navy, marginBottom: '14px' }}>Región de los postulantes</div><Barras datos={contar(p => p.conductor?.region)} /></Card>
            <Card><div style={{ fontWeight: 700, color: C.navy, marginBottom: '14px' }}>Experiencia de los postulantes</div><Barras datos={contar(p => p.conductor?.anos_experiencia)} color={C.green} /></Card>
          </div>
        </>}
    </div>
  )
}
