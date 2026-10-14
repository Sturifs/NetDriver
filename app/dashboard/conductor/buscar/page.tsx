'use client'
import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../supabase'
import { fecha, haceCuanto, iniciales, LICENCIAS, regiones, sueldoEmpleo, TIPOS_TRABAJO, TURNOS } from '../../empresa/_lib/datos'

const FILTROS = { cargo: '', region: '', tipoTrabajo: '', licencia: '', turno: '', salarioMin: '', soloRelampago: false }
const label = { fontSize: '0.72rem', fontWeight: 700, color: '#8fa3b8', textTransform: 'uppercase' as const, display: 'block', marginBottom: '8px' }
const campo = { width: '100%', background: '#f4f7fa', border: '1px solid #e8eef5', borderRadius: '8px', padding: '9px 12px', fontSize: '0.88rem', outline: 'none', color: '#1a3a5c', boxSizing: 'border-box' as const }

function Chips({ opciones, valor, onChange }: { opciones: string[]; valor: string; onChange: (v: string) => void }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
      {opciones.map(o => (
        <button key={o} type="button" onClick={() => onChange(valor === o ? '' : o)} style={{ background: valor === o ? '#2563eb' : '#f4f7fa', color: valor === o ? 'white' : '#1a3a5c', border: '1px solid ' + (valor === o ? '#2563eb' : '#e8eef5'), borderRadius: '6px', padding: '4px 10px', fontSize: '0.78rem', cursor: 'pointer' }}>{o}</button>
      ))}
    </div>
  )
}

export default function BuscarEmpleos() {
  const router = useRouter()
  const [userId, setUserId] = useState('')
  const [filtros, setFiltros] = useState(FILTROS)
  const [orden, setOrden] = useState('recientes')
  const [empleos, setEmpleos] = useState<any[]>([])
  const [misPostulaciones, setMisPostulaciones] = useState<Record<string, string>>({})
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [detalle, setDetalle] = useState<any>(null)
  const [mensaje, setMensaje] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [aviso, setAviso] = useState('')

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/'); return }
      setUserId(user.id)
    })()
  }, [router])

  const cargar = useCallback(async () => {
    if (!userId) return
    const hoy = new Date().toISOString().slice(0, 10)
    const [e, p] = await Promise.all([
      supabase.from('empleos').select('*, empresa:profiles!empleos_empresa_id_fkey(id, nombre_empresa, logo_url, rubro)').eq('estado', 'activo').or(`fecha_vencimiento.is.null,fecha_vencimiento.gte.${hoy}`).order('created_at', { ascending: false }).limit(200),
      supabase.from('postulaciones').select('id, empleo_id').eq('conductor_id', userId),
    ])
    if (e.error) setError('Aún no hay empleos disponibles para mostrar.')
    setEmpleos(e.data || [])
    setMisPostulaciones(Object.fromEntries((p.data || []).map((x: any) => [x.empleo_id, x.id])))
    setCargando(false)
  }, [userId])
  useEffect(() => { cargar() }, [cargar])

  const resultados = empleos
    .filter(e => !filtros.cargo || `${e.titulo} ${e.tipo_trabajo || ''} ${e.empresa?.nombre_empresa || ''} ${e.comuna || ''}`.toLowerCase().includes(filtros.cargo.toLowerCase()))
    .filter(e => !filtros.region || e.region === filtros.region)
    .filter(e => !filtros.tipoTrabajo || e.tipo_trabajo === filtros.tipoTrabajo)
    .filter(e => !filtros.licencia || (e.licencias || []).includes(filtros.licencia))
    .filter(e => !filtros.turno || e.turno === filtros.turno)
    .filter(e => !filtros.salarioMin || (e.mostrar_sueldo && (e.sueldo_max || e.sueldo_min || 0) >= Number(filtros.salarioMin)))
    .filter(e => !filtros.soloRelampago || e.es_relampago)
    .sort((a, b) => orden === 'salario' ? ((b.mostrar_sueldo ? b.sueldo_max || b.sueldo_min || 0 : 0) - (a.mostrar_sueldo ? a.sueldo_max || a.sueldo_min || 0 : 0)) : orden === 'relampago' ? Number(b.es_relampago) - Number(a.es_relampago) : 0)

  const postular = async () => {
    if (!detalle) return
    setEnviando(true)
    const { error } = await supabase.from('postulaciones').insert({ empleo_id: detalle.id, conductor_id: userId, empresa_id: detalle.empresa_id, mensaje: mensaje.trim() || null })
    setEnviando(false)
    if (error) { setAviso(error.code === '23505' ? 'Ya postulaste a este empleo.' : 'No se pudo enviar tu postulación: ' + error.message); return }
    setAviso('✅ ¡Postulación enviada! La empresa revisará tu perfil.')
    setMensaje(''); cargar()
  }
  const retirar = async () => {
    const id = detalle && misPostulaciones[detalle.id]
    if (!id || !window.confirm('¿Retirar tu postulación a este empleo?')) return
    const { error } = await supabase.from('postulaciones').delete().eq('id', id)
    setAviso(error ? 'No se pudo retirar la postulación.' : 'Retiraste tu postulación.'); cargar()
  }
  const abrir = (e: any) => { setDetalle(e); setAviso(''); setMensaje('') }
  const lineas = (t?: string) => (t || '').split('\n').map(s => s.trim()).filter(Boolean)

  return (
    <div style={{ minHeight: '100vh', background: '#f4f7fa', display: 'flex', flexWrap: 'wrap', fontFamily: 'sans-serif' }}>
      <div style={{ width: '280px', background: 'white', borderRight: '1px solid #e8eef5', padding: '24px', flexShrink: 0, position: 'sticky', top: 0, height: '100vh', overflowY: 'auto', boxSizing: 'border-box' }}>
        <button onClick={() => router.push('/dashboard/conductor')} style={{ background: 'transparent', border: 'none', color: '#2563eb', fontSize: '0.85rem', cursor: 'pointer', marginBottom: '20px', padding: 0 }}>← Volver al dashboard</button>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#1a3a5c', marginBottom: '20px' }}>🔍 Filtros de búsqueda</h2>
        <div style={{ marginBottom: '16px' }}><label style={label}>Qué trabajo buscas</label><input value={filtros.cargo} onChange={e => setFiltros({ ...filtros, cargo: e.target.value })} placeholder="Ej: Conductor A4, Minería..." style={campo} /></div>
        <div style={{ marginBottom: '16px' }}>
          <label style={label}>Región</label>
          <select value={filtros.region} onChange={e => setFiltros({ ...filtros, region: e.target.value })} style={campo}><option value="">Todas las regiones</option>{regiones.map(r => <option key={r}>{r}</option>)}</select>
        </div>
        <div style={{ marginBottom: '16px' }}><label style={label}>Tipo de trabajo</label><Chips opciones={TIPOS_TRABAJO} valor={filtros.tipoTrabajo} onChange={v => setFiltros({ ...filtros, tipoTrabajo: v })} /></div>
        <div style={{ marginBottom: '16px' }}><label style={label}>Licencia</label><Chips opciones={LICENCIAS} valor={filtros.licencia} onChange={v => setFiltros({ ...filtros, licencia: v })} /></div>
        <div style={{ marginBottom: '16px' }}><label style={label}>Turno</label><Chips opciones={TURNOS} valor={filtros.turno} onChange={v => setFiltros({ ...filtros, turno: v })} /></div>
        <div style={{ marginBottom: '16px' }}><label style={label}>Sueldo mínimo esperado</label><input inputMode="numeric" value={filtros.salarioMin} onChange={e => setFiltros({ ...filtros, salarioMin: e.target.value.replace(/\D/g, '') })} placeholder="Ej: 1000000" style={campo} /></div>
        <label style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '0.85rem', color: '#1a3a5c', marginBottom: '20px', cursor: 'pointer' }}>
          <input type="checkbox" checked={filtros.soloRelampago} onChange={e => setFiltros({ ...filtros, soloRelampago: e.target.checked })} /> ⚡ Solo pegas relámpago
        </label>
        <button onClick={() => setFiltros(FILTROS)} style={{ width: '100%', background: 'transparent', border: '1px solid #e8eef5', color: '#8fa3b8', padding: '9px', borderRadius: '8px', fontSize: '0.85rem', cursor: 'pointer' }}>Limpiar filtros</button>
      </div>

      <div style={{ flex: 1, padding: '28px', minWidth: '300px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '12px', flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1a3a5c', margin: '0 0 4px' }}>Buscar empleos</h1>
            <p style={{ color: '#8fa3b8', fontSize: '0.88rem', margin: 0 }}>{cargando ? 'Cargando...' : `${resultados.length} empleo${resultados.length === 1 ? '' : 's'} encontrado${resultados.length === 1 ? '' : 's'}`}</p>
          </div>
          <select value={orden} onChange={e => setOrden(e.target.value)} style={{ background: 'white', border: '1px solid #e8eef5', borderRadius: '8px', padding: '8px 14px', fontSize: '0.85rem', color: '#1a3a5c', outline: 'none' }}>
            <option value="recientes">Más recientes</option><option value="salario">Mayor sueldo</option><option value="relampago">Pegas relámpago primero</option>
          </select>
        </div>

        {!cargando && resultados.length === 0 && (
          <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e8eef5', padding: '40px', textAlign: 'center', color: '#8fa3b8' }}>
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🔍</div>
            {error || (empleos.length ? 'No hay empleos con estos filtros. Prueba quitando alguno.' : 'Todavía no hay empleos publicados. ¡Vuelve pronto!')}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
          {resultados.map(e => {
            const postulado = !!misPostulaciones[e.id]
            return (
              <div key={e.id} onClick={() => abrir(e)} style={{ background: 'white', borderRadius: '12px', padding: '18px', border: `1px solid ${e.es_relampago ? '#f3d27a' : '#e8eef5'}`, cursor: 'pointer' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: e.empresa?.logo_url ? 'white' : '#1a3a5c', border: '1px solid #e8eef5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '0.85rem', overflow: 'hidden' }}>
                    {e.empresa?.logo_url ? <img src={e.empresa.logo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : iniciales(e.empresa?.nombre_empresa)}
                  </div>
                  {e.es_relampago && <span style={{ background: '#fff8e1', color: '#c2410c', fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>⚡ Urgente</span>}
                </div>
                <div style={{ fontWeight: 700, color: '#1a3a5c', fontSize: '1rem', marginBottom: '2px' }}>{e.titulo}</div>
                <div style={{ fontSize: '0.88rem', color: '#8fa3b8', marginBottom: '2px' }}>{e.empresa?.nombre_empresa || 'Empresa'}</div>
                <div style={{ fontSize: '0.85rem', color: '#8fa3b8', marginBottom: '10px' }}>📍 {[e.comuna, e.region].filter(Boolean).join(', ')}</div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
                  {[...(e.licencias || []).map((l: string) => 'Licencia ' + l), e.tipo_trabajo, e.turno].filter(Boolean).map((t: string) => <span key={t} style={{ fontSize: '0.75rem', color: '#8fa3b8', background: '#f4f7fa', padding: '3px 10px', borderRadius: '4px' }}>{t}</span>)}
                </div>
                <div style={{ fontWeight: 700, color: '#1a3a5c', marginBottom: '4px' }}>{e.mostrar_sueldo ? sueldoEmpleo(e) : 'Sueldo a convenir'}</div>
                <div style={{ fontSize: '0.78rem', color: '#8fa3b8', marginBottom: '14px' }}>Publicado {haceCuanto(e.created_at).toLowerCase()}{e.es_relampago && e.fecha_inicio ? ` · Inicia ${fecha(e.fecha_inicio)}` : ''}</div>
                <button onClick={ev => { ev.stopPropagation(); abrir(e) }} style={{ width: '100%', background: postulado ? '#e8f5e9' : 'transparent', border: `1px solid ${postulado ? '#a7d7b0' : '#2563eb'}`, color: postulado ? '#1b5e20' : '#2563eb', padding: '8px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>{postulado ? '✓ Ya postulaste' : 'Ver y postular'}</button>
              </div>
            )
          })}
        </div>
      </div>

      {detalle && (
        <div onClick={() => setDetalle(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(2,13,36,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '16px' }}>
          <div onClick={ev => ev.stopPropagation()} style={{ background: 'white', borderRadius: '14px', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', padding: '24px', position: 'relative' }}>
            <button onClick={() => setDetalle(null)} aria-label="Cerrar" style={{ position: 'absolute', top: '14px', right: '16px', background: 'none', border: 'none', fontSize: '1.4rem', color: '#8fa3b8', cursor: 'pointer' }}>×</button>
            {detalle.es_relampago && <span style={{ background: '#fff8e1', color: '#c2410c', fontSize: '0.72rem', fontWeight: 700, padding: '3px 10px', borderRadius: '4px' }}>⚡ PEGA RELÁMPAGO</span>}
            <h2 style={{ fontSize: '1.3rem', color: '#1a3a5c', margin: '10px 0 2px' }}>{detalle.titulo}</h2>
            <div style={{ color: '#8fa3b8', fontSize: '0.9rem', marginBottom: '14px' }}>{detalle.empresa?.nombre_empresa} · 📍 {[detalle.comuna, detalle.region].filter(Boolean).join(', ')}</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', background: '#f4f7fa', borderRadius: '10px', padding: '12px', marginBottom: '16px', fontSize: '0.85rem', color: '#1a3a5c' }}>
              <div>💰 {detalle.mostrar_sueldo ? sueldoEmpleo(detalle) : 'A convenir'}</div>
              <div>🪪 Licencia {(detalle.licencias || []).join(', ')}</div>
              {detalle.turno && <div>🕐 {detalle.turno}</div>}
              {detalle.tipo_trabajo && <div>🚚 {detalle.tipo_trabajo}</div>}
              {detalle.fecha_inicio && <div>📅 Inicio {fecha(detalle.fecha_inicio)}</div>}
              {detalle.duracion_dias && <div>⏱ {detalle.duracion_dias} días</div>}
              <div>👥 {detalle.vacantes || 1} vacante{(detalle.vacantes || 1) > 1 ? 's' : ''}</div>
            </div>
            {detalle.descripcion && <p style={{ fontSize: '0.88rem', color: '#1a3a5c', lineHeight: 1.6, whiteSpace: 'pre-line' }}>{detalle.descripcion}</p>}
            {[['Requisitos', detalle.requisitos], ['Beneficios', detalle.beneficios]].filter(([, t]) => t).map(([t, txt]) => (
              <div key={t} style={{ marginBottom: '12px' }}>
                <div style={{ fontWeight: 700, color: '#1a3a5c', fontSize: '0.9rem', marginBottom: '4px' }}>{t}</div>
                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.86rem', color: '#1a3a5c', lineHeight: 1.7 }}>{lineas(txt).map(l => <li key={l}>{l}</li>)}</ul>
              </div>
            ))}
            {aviso && <div style={{ background: aviso.startsWith('✅') ? '#e8f5e9' : '#fff8e1', color: aviso.startsWith('✅') ? '#1b5e20' : '#92400e', borderRadius: '8px', padding: '10px 14px', fontSize: '0.85rem', margin: '12px 0' }}>{aviso}</div>}
            {misPostulaciones[detalle.id] ? (
              <div style={{ display: 'flex', gap: '10px', marginTop: '16px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, background: '#e8f5e9', color: '#1b5e20', borderRadius: '8px', padding: '10px', textAlign: 'center', fontWeight: 600, fontSize: '0.88rem' }}>✓ Ya postulaste a este empleo</div>
                <button onClick={retirar} style={{ background: 'white', border: '1px solid #f5c6c2', color: '#e74c3c', borderRadius: '8px', padding: '10px 14px', cursor: 'pointer', fontSize: '0.85rem' }}>Retirar postulación</button>
              </div>
            ) : (
              <div style={{ marginTop: '16px' }}>
                <label style={label}>Mensaje para la empresa (opcional)</label>
                <textarea value={mensaje} onChange={e => setMensaje(e.target.value)} rows={3} maxLength={500} placeholder="Cuéntales por qué eres buen candidato o tu disponibilidad." style={{ ...campo, resize: 'vertical', fontFamily: 'inherit' }} />
                <div style={{ fontSize: '0.75rem', color: '#8fa3b8', margin: '6px 0 12px' }}>La empresa verá tu perfil completo de NetDriver. <button onClick={() => router.push('/dashboard/conductor/completar-perfil')} style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', padding: 0, fontSize: '0.75rem' }}>Revisar mi perfil</button></div>
                <button onClick={postular} disabled={enviando} style={{ width: '100%', background: '#2563eb', border: 'none', color: 'white', padding: '12px', borderRadius: '8px', fontSize: '0.92rem', fontWeight: 700, cursor: enviando ? 'wait' : 'pointer' }}>{enviando ? 'Enviando...' : 'Postular a este empleo'}</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
