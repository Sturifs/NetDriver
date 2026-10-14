'use client'
import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../supabase'
import { useEmpresa } from '../_lib/contexto'
import { fecha, iniciales, RUTA, sueldoEmpleo } from '../_lib/datos'
import { Aviso, Btn, C, Card, Cargando, Estrellas, Vacio } from '../_lib/ui'

export default function PerfilPublico() {
  const router = useRouter()
  const { userId, perfil } = useEmpresa()
  const [empleos, setEmpleos] = useState<any[]>([])
  const [opiniones, setOpiniones] = useState<any[]>([])
  const [cargando, setCargando] = useState(true)

  const cargar = useCallback(async () => {
    const hoy = new Date().toISOString().slice(0, 10)
    const [e, o] = await Promise.all([
      supabase.from('empleos').select('*').eq('empresa_id', userId).eq('estado', 'activo').or(`fecha_vencimiento.is.null,fecha_vencimiento.gte.${hoy}`).order('created_at', { ascending: false }),
      supabase.from('opiniones_empresa').select('puntaje').eq('empresa_id', userId),
    ])
    setEmpleos(e.data || []); setOpiniones(o.data || []); setCargando(false)
  }, [userId])
  useEffect(() => { cargar() }, [cargar])

  if (cargando) return <Cargando />
  const promedio = opiniones.length ? opiniones.reduce((a, x) => a + x.puntaje, 0) / opiniones.length : 0

  return (
    <div style={{ maxWidth: '860px' }}>
      <Aviso tipo="info">Así ven los conductores el perfil de tu empresa. <button onClick={() => router.push(`${RUTA}/configuracion`)} style={{ background: 'none', border: 'none', color: C.blue, fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}>Editar datos</button></Aviso>
      <Card style={{ marginBottom: '16px', padding: 0, overflow: 'hidden' }}>
        <div style={{ background: C.side, height: '90px' }} />
        <div style={{ padding: '0 24px 24px' }}>
          <div style={{ width: '96px', height: '96px', borderRadius: '14px', background: 'white', border: `3px solid white`, boxShadow: '0 2px 10px rgba(0,0,0,0.1)', marginTop: '-48px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            {perfil.logo_url ? <img src={perfil.logo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <span style={{ color: C.orange, fontWeight: 900, fontSize: '1.6rem' }}>{iniciales(perfil.nombre_empresa)}</span>}
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: C.navy, margin: '12px 0 4px' }}>{perfil.nombre_empresa || 'Mi Empresa'}</h1>
          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', fontSize: '0.85rem', color: C.muted, marginBottom: '10px' }}>
            {perfil.rubro && <span>🚚 {perfil.rubro}</span>}
            {(perfil.comuna || perfil.region) && <span>📍 {[perfil.comuna, perfil.region].filter(Boolean).join(', ')}</span>}
            {perfil.sitio_web && <a href={perfil.sitio_web} target="_blank" rel="noopener noreferrer" style={{ color: C.blue }}>🌐 {perfil.sitio_web.replace(/^https?:\/\//, '')}</a>}
            {opiniones.length > 0 && <span><Estrellas valor={promedio} size="0.85rem" /> {promedio.toFixed(1)} ({opiniones.length})</span>}
          </div>
          <p style={{ fontSize: '0.9rem', color: C.navy, lineHeight: 1.6, margin: 0, whiteSpace: 'pre-line' }}>{perfil.descripcion_empresa || <span style={{ color: C.muted }}>Esta empresa aún no agrega una descripción.</span>}</p>
        </div>
      </Card>
      <Card padding="0">
        <div style={{ padding: '16px 20px', borderBottom: `1px solid ${C.bg}`, fontWeight: 700, color: C.navy }}>Empleos disponibles ({empleos.length})</div>
        {empleos.length === 0
          ? <Vacio icono="💼" titulo="Sin empleos disponibles" texto="Los conductores verán aquí tus avisos activos." accion="Publicar empleo" onAccion={() => router.push(`${RUTA}/publicar`)} />
          : empleos.map(e => (
            <div key={e.id} onClick={() => router.push(`${RUTA}/empleos/${e.id}`)} style={{ padding: '14px 20px', borderBottom: `1px solid ${C.bg}`, cursor: 'pointer', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <div style={{ fontWeight: 700, color: C.navy }}>{e.es_relampago && '⚡ '}{e.titulo}</div>
                <div style={{ fontSize: '0.8rem', color: C.muted }}>📍 {[e.comuna, e.region].filter(Boolean).join(', ')} · Licencia {(e.licencias || []).join(', ')}{e.turno ? ' · ' + e.turno : ''}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                {e.mostrar_sueldo && <div style={{ fontWeight: 700, color: C.green, fontSize: '0.88rem' }}>{sueldoEmpleo(e)}</div>}
                <div style={{ fontSize: '0.75rem', color: C.muted }}>Hasta {fecha(e.fecha_vencimiento)}</div>
              </div>
            </div>
          ))}
      </Card>
      <div style={{ marginTop: '16px' }}><Btn variante="secundario" onClick={() => router.push(`${RUTA}/configuracion`)}>✏️ Editar perfil</Btn></div>
    </div>
  )
}
