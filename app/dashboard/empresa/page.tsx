'use client'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../supabase'
import { useEmpresa } from './_lib/contexto'
import { SELECT_POSTULACION, useGuardados } from './_lib/acciones'
import { FilaPostulacion, ModalEntrevista, TablaEmpleos } from './_lib/componentes'
import { diasHasta, fecha, fechaHora, haceCuanto, iniciales, nombreConductor, RUTA } from './_lib/datos'
import { Btn, C, Card, CardHeader, Cargando, Estrellas, LinkBtn, Metrica, Vacio } from './_lib/ui'

const DIA = 86400000

export default function InicioEmpresa() {
  const router = useRouter()
  const { userId, perfil, contadores } = useEmpresa()
  const { guardados, alternarGuardado } = useGuardados(userId)
  const [cargando, setCargando] = useState(true)
  const [empleos, setEmpleos] = useState<any[]>([])
  const [postulaciones, setPostulaciones] = useState<any[]>([])
  const [entrevistas, setEntrevistas] = useState<any[]>([])
  const [opiniones, setOpiniones] = useState<any[]>([])
  const [periodo, setPeriodo] = useState(30)
  const [modalEntrevista, setModalEntrevista] = useState<any>(null)

  const cargar = useCallback(async () => {
    const [e, p, en, o] = await Promise.all([
      supabase.from('empleos').select('*').eq('empresa_id', userId).order('created_at', { ascending: false }),
      supabase.from('postulaciones').select(SELECT_POSTULACION).eq('empresa_id', userId).order('created_at', { ascending: false }),
      supabase.from('entrevistas').select('*, conductor:profiles!entrevistas_conductor_id_fkey(nombre, apellido), empleo:empleos(titulo)').eq('empresa_id', userId).eq('estado', 'programada').gte('fecha_hora', new Date().toISOString()).order('fecha_hora'),
      supabase.from('opiniones_empresa').select('*, conductor:profiles!opiniones_conductor_id_fkey(nombre, apellido)').eq('empresa_id', userId).order('created_at', { ascending: false }),
    ])
    setEmpleos(e.data || []); setPostulaciones(p.data || []); setEntrevistas(en.data || []); setOpiniones(o.data || [])
    setCargando(false)
  }, [userId])
  useEffect(() => { cargar() }, [cargar])

  const conteos = useMemo(() => {
    const m: Record<string, number> = {}
    postulaciones.forEach(p => { m[p.empleo_id] = (m[p.empleo_id] || 0) + 1 })
    return m
  }, [postulaciones])

  const ahora = Date.now()
  const semana = ahora - 7 * DIA
  const inicioMes = new Date(); inicioMes.setDate(1); inicioMes.setHours(0, 0, 0, 0)
  const contratados = postulaciones.filter(p => p.estado === 'contratado')
  const contratadosMes = contratados.filter(p => new Date(p.fecha_contratacion || p.updated_at).getTime() >= inicioMes.getTime())
  const empleosActivos = empleos.filter(e => e.estado === 'activo')
  const nuevasSemana = postulaciones.filter(p => new Date(p.created_at).getTime() >= semana).length
  const empleosSemana = empleos.filter(e => new Date(e.created_at).getTime() >= semana).length

  // Estadísticas del período
  const desde = ahora - periodo * DIA
  const delPeriodo = postulaciones.filter(p => new Date(p.created_at).getTime() >= desde)
  const entrevistadosPeriodo = delPeriodo.filter(p => ['entrevista', 'contratado'].includes(p.estado)).length
  const contratadosPeriodo = delPeriodo.filter(p => p.estado === 'contratado').length
  const tramos = 8
  const serie = Array.from({ length: tramos }, (_, i) => {
    const ini = desde + (i * periodo * DIA) / tramos, fin = desde + ((i + 1) * periodo * DIA) / tramos
    return { n: delPeriodo.filter(p => { const t = new Date(p.created_at).getTime(); return t >= ini && t < fin }).length, fecha: new Date(fin) }
  })
  const maxSerie = Math.max(4, ...serie.map(s => s.n))

  // Opiniones
  const promedio = opiniones.length ? opiniones.reduce((a, o) => a + o.puntaje, 0) / opiniones.length : 0
  const distribucion = [5, 4, 3, 2, 1].map(n => [n, opiniones.length ? Math.round((opiniones.filter(o => o.puntaje === n).length / opiniones.length) * 100) : 0])

  // Alertas generadas desde los datos reales
  const alertas: { icono: string; texto: string; sub: string; color: string; ir: string }[] = []
  const proximas48 = entrevistas.filter(e => new Date(e.fecha_hora).getTime() - ahora < 2 * DIA)
  if (proximas48.length) alertas.push({ icono: '🤝', texto: `Tienes ${proximas48.length} entrevista${proximas48.length > 1 ? 's' : ''} en las próximas 48 horas`, sub: proximas48.map(e => `${nombreConductor(e.conductor)} · ${fechaHora(e.fecha_hora)}`).slice(0, 2).join(' — '), color: '#e8f0fe', ir: '/entrevistas' })
  empleosActivos.filter(e => { const d = diasHasta(e.fecha_vencimiento); return d != null && d >= 0 && d <= 3 }).forEach(e => {
    const d = diasHasta(e.fecha_vencimiento)!
    alertas.push({ icono: '⏰', texto: `"${e.titulo}" está por vencer`, sub: d === 0 ? 'Vence hoy.' : `Vence en ${d} día${d > 1 ? 's' : ''}.`, color: '#fff8e1', ir: `/empleos/${e.id}` })
  })
  if (contadores.postulacionesNuevas) alertas.push({ icono: '📋', texto: `${contadores.postulacionesNuevas} postulación${contadores.postulacionesNuevas > 1 ? 'es' : ''} sin revisar`, sub: 'Revisa a los conductores que postularon.', color: '#e8f5e9', ir: '/postulaciones?estado=nueva' })
  if (!perfil.descripcion_empresa || !perfil.rut_empresa) alertas.push({ icono: '🏢', texto: 'Completa el perfil de tu empresa', sub: 'Los conductores postulan más a empresas con perfil completo.', color: '#f3e8fd', ir: '/configuracion' })

  const accesos = [
    { icono: '🔍', titulo: 'Búsqueda avanzada de conductores', sub: 'Encuentra el perfil ideal', ir: '/busqueda' },
    { icono: '📄', titulo: 'Plantillas de empleo', sub: 'Ahorra tiempo publicando', ir: '/publicar?plantillas=1' },
    { icono: '⚡', titulo: 'Publicar Pega Relámpago', sub: 'Trabajos urgentes de pocos días', ir: '/publicar?relampago=1' },
    { icono: '📈', titulo: 'Reportes de contratación', sub: 'Analiza tu rendimiento', ir: '/reportes' },
  ]

  if (cargando) return <Cargando texto="Cargando tu resumen..." />

  return (
    <div className="nd-cols">
      <div style={{ flex: 1, minWidth: 0, width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', gap: '12px', flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: C.navy, margin: '0 0 4px' }}>¡Bienvenido, {perfil.nombre}! 👋</h1>
            <p style={{ color: C.muted, fontSize: '0.9rem', margin: 0 }}>Gestiona tus procesos de contratación y encuentra a los mejores conductores.</p>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <Btn variante="secundario" onClick={() => router.push(`${RUTA}/busqueda`)}>👤 Ir a búsqueda avanzada</Btn>
            <Btn onClick={() => router.push(`${RUTA}/publicar`)}>+ Publicar empleo</Btn>
          </div>
        </div>

        <div className="nd-grid-4" style={{ marginBottom: '28px' }}>
          <Metrica icono="💼" label="Empleos activos" valor={empleosActivos.length} sub={empleosSemana ? `+${empleosSemana} esta semana` : 'Sin nuevos esta semana'} color={C.blue} bg="#e8f0fe" onClick={() => router.push(`${RUTA}/empleos`)} />
          <Metrica icono="📋" label="Postulaciones nuevas" valor={contadores.postulacionesNuevas} sub={`${nuevasSemana} recibidas esta semana`} color={C.green} bg="#e8f5e9" onClick={() => router.push(`${RUTA}/postulaciones?estado=nueva`)} />
          <Metrica icono="🤝" label="Entrevistas pendientes" valor={entrevistas.length} sub={proximas48.length ? `${proximas48.length} en las próximas 48 h` : 'Ninguna en las próximas 48 h'} color={C.orange} bg="#fef3e2" onClick={() => router.push(`${RUTA}/entrevistas`)} />
          <Metrica icono="✅" label="Contrataciones este mes" valor={contratadosMes.length} sub={`${contratados.length} en total`} color={C.purple} bg="#f3e8fd" onClick={() => router.push(`${RUTA}/contrataciones`)} />
        </div>

        <Card padding="0" style={{ marginBottom: '24px', overflow: 'hidden' }}>
          <CardHeader titulo="Mis empleos activos" accion="Ver todos" onAccion={() => router.push(`${RUTA}/empleos`)} />
          {empleosActivos.length
            ? <TablaEmpleos empleos={empleosActivos.slice(0, 5)} conteos={conteos} onCambio={cargar} />
            : <Vacio icono="💼" titulo="Aún no tienes empleos activos" texto="Publica tu primer empleo y empieza a recibir postulaciones de conductores verificados." />}
          <div style={{ padding: '14px 20px' }}>
            <button onClick={() => router.push(`${RUTA}/publicar`)} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', border: `1px dashed ${C.border}`, color: C.blue, padding: '10px 20px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', width: '100%', justifyContent: 'center' }}>+ Publicar nuevo empleo</button>
          </div>
        </Card>

        <Card padding="0" style={{ marginBottom: '24px', overflow: 'hidden' }}>
          <CardHeader titulo="Postulaciones recientes" accion="Ver todas" onAccion={() => router.push(`${RUTA}/postulaciones`)} />
          {postulaciones.length
            ? postulaciones.slice(0, 4).map(p => (
              <FilaPostulacion key={p.id} p={p} guardado={guardados.has(p.conductor_id)} onGuardar={() => alternarGuardado(p.conductor_id)} onCambio={cargar} onEntrevista={() => setModalEntrevista(p)} />
            ))
            : <Vacio icono="📋" titulo="Todavía no hay postulaciones" texto={empleosActivos.length ? 'Cuando un conductor postule a tus empleos, aparecerá aquí.' : 'Publica un empleo para empezar a recibir postulaciones.'} />}
          {postulaciones.length > 0 && (
            <div style={{ padding: '12px 20px', textAlign: 'center' }}>
              <LinkBtn onClick={() => router.push(`${RUTA}/postulaciones`)}>Ver todas las postulaciones ({postulaciones.length})</LinkBtn>
            </div>
          )}
        </Card>

        <Card style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: C.navy, margin: 0 }}>Opiniones de conductores</h2>
            <LinkBtn onClick={() => router.push(`${RUTA}/opiniones`)}>Ver todas</LinkBtn>
          </div>
          {opiniones.length === 0
            ? <Vacio icono="⭐" titulo="Aún no tienes opiniones" texto="Los conductores que contrates a través de NetDriver podrán calificar a tu empresa." />
            : (
              <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <div style={{ textAlign: 'center', minWidth: '80px' }}>
                  <div style={{ fontSize: '2.5rem', fontWeight: 800, color: C.navy }}>{promedio.toFixed(1)}</div>
                  <Estrellas valor={promedio} size="1.1rem" />
                  <div style={{ fontSize: '0.75rem', color: C.muted, marginTop: '4px' }}>{opiniones.length} opinion{opiniones.length > 1 ? 'es' : ''}</div>
                </div>
                <div style={{ flex: 1, minWidth: '180px' }}>
                  {distribucion.map(([n, pct]) => (
                    <div key={n} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                      <span style={{ fontSize: '0.78rem', color: C.muted, width: '70px' }}>{n} estrella{n > 1 ? 's' : ''}</span>
                      <div style={{ flex: 1, height: '6px', background: C.bg, borderRadius: '3px' }}><div style={{ width: `${pct}%`, height: '6px', background: C.blue, borderRadius: '3px' }} /></div>
                      <span style={{ fontSize: '0.78rem', color: C.muted, width: '34px' }}>{pct}%</span>
                    </div>
                  ))}
                </div>
                <div className="nd-grid-2" style={{ flex: 1, minWidth: '240px' }}>
                  {opiniones.slice(0, 2).map(op => (
                    <div key={op.id} style={{ background: C.bg, borderRadius: '10px', padding: '14px' }}>
                      <div style={{ fontWeight: 700, color: C.navy, fontSize: '0.88rem', marginBottom: '2px' }}>{nombreConductor(op.conductor)}</div>
                      <Estrellas valor={op.puntaje} size="0.85rem" />
                      <div style={{ fontSize: '0.8rem', color: C.muted, lineHeight: 1.5, margin: '6px 0' }}>{op.comentario || 'Sin comentario'}</div>
                      <div style={{ fontSize: '0.75rem', color: C.muted }}>{haceCuanto(op.created_at)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
        </Card>
      </div>

      <div className="nd-aside">
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <span style={{ fontWeight: 700, color: C.navy, fontSize: '0.95rem' }}>Perfil de la empresa</span>
            <LinkBtn onClick={() => router.push(`${RUTA}/perfil`)} style={{ fontSize: '0.8rem' }}>Ver perfil público</LinkBtn>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '12px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: 'white', border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
              {perfil.logo_url ? <img src={perfil.logo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <span style={{ color: C.orange, fontWeight: 900, fontSize: '0.95rem' }}>{iniciales(perfil.nombre_empresa)}</span>}
            </div>
            <div>
              <div style={{ fontWeight: 700, color: C.navy, fontSize: '0.92rem' }}>{perfil.nombre_empresa || perfil.nombre}</div>
              {opiniones.length > 0
                ? <div style={{ fontSize: '0.85rem', marginTop: '4px' }}><Estrellas valor={promedio} size="0.85rem" /> <span style={{ color: C.muted, fontSize: '0.78rem' }}>({opiniones.length})</span></div>
                : <div style={{ fontSize: '0.78rem', color: C.muted, marginTop: '4px' }}>Sin opiniones aún</div>}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '14px' }}>
            <span style={{ fontSize: '0.78rem', color: C.muted }}>🚚 {perfil.rubro || 'Transporte y Logística'}</span>
            {(perfil.comuna || perfil.region) && <span style={{ fontSize: '0.78rem', color: C.muted }}>📍 {[perfil.comuna, perfil.region].filter(Boolean).join(', ')}</span>}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', textAlign: 'center', background: C.bg, borderRadius: '8px', padding: '12px', marginBottom: '12px' }}>
            {[[perfil.created_at ? fecha(perfil.created_at).replace(/^\d+ /, '') : '—', 'Miembro desde'], [empleos.length, 'Empleos publicados'], [contratados.length, 'Contrataciones']].map(([val, label]) => (
              <div key={label as string}>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: C.navy }}>{val}</div>
                <div style={{ fontSize: '0.7rem', color: C.muted, marginTop: '2px' }}>{label}</div>
              </div>
            ))}
          </div>
          <Btn variante="secundario" onClick={() => router.push(`${RUTA}/configuracion`)} style={{ width: '100%', justifyContent: 'center' }}>✏️ Editar perfil de empresa</Btn>
        </Card>

        <Card>
          <div style={{ fontWeight: 700, color: C.navy, fontSize: '0.95rem', marginBottom: '8px' }}>Accesos rápidos</div>
          {accesos.map((a, i) => (
            <div key={a.titulo} onClick={() => router.push(RUTA + a.ir)} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: i < accesos.length - 1 ? `1px solid ${C.bg}` : 'none', cursor: 'pointer' }}>
              <span style={{ fontSize: '1.2rem' }}>{a.icono}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: C.navy }}>{a.titulo}</div>
                <div style={{ fontSize: '0.75rem', color: C.muted }}>{a.sub}</div>
              </div>
              <span style={{ color: C.muted, fontSize: '1rem' }}>›</span>
            </div>
          ))}
        </Card>

        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <span style={{ fontWeight: 700, color: C.navy, fontSize: '0.95rem' }}>Estadísticas de contratación</span>
            <select value={periodo} onChange={e => setPeriodo(Number(e.target.value))} style={{ fontSize: '0.78rem', color: C.navy, border: `1px solid ${C.border}`, borderRadius: '6px', padding: '3px 6px', background: 'white' }}>
              <option value={7}>Últimos 7 días</option><option value={30}>Últimos 30 días</option><option value={90}>Últimos 90 días</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <svg viewBox="0 0 180 100" style={{ width: '100%' }} role="img" aria-label="Postulaciones recibidas en el período">
                <line x1="22" y1="5" x2="22" y2="85" stroke={C.border} strokeWidth="1" />
                <line x1="22" y1="85" x2="178" y2="85" stroke={C.border} strokeWidth="1" />
                {[maxSerie, Math.round(maxSerie / 2), 0].map((v, i) => <text key={i} x="18" y={9 + i * 38} fontSize="7" fill={C.muted} textAnchor="end">{v}</text>)}
                {(() => {
                  const pts = serie.map((s, i) => [28 + i * (146 / (tramos - 1)), 83 - (s.n / maxSerie) * 76])
                  return (<>
                    <polygon points={`${pts.map(p => p.join(',')).join(' ')} ${pts[pts.length - 1][0]},85 ${pts[0][0]},85`} fill="rgba(37,99,235,0.1)" />
                    <polyline points={pts.map(p => p.join(',')).join(' ')} fill="none" stroke={C.blue} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    {pts.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="2.6" fill="white" stroke={C.blue} strokeWidth="1.6"><title>{`${serie[i].n} postulaciones hasta ${fecha(serie[i].fecha.toISOString())}`}</title></circle>)}
                    {[0, Math.floor(tramos / 2), tramos - 1].map(i => <text key={i} x={pts[i][0]} y="96" fontSize="6" fill={C.muted} textAnchor="middle">{serie[i].fecha.toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })}</text>)}
                  </>)
                })()}
              </svg>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minWidth: '120px' }}>
              {[['Postulaciones', delPeriodo.length], ['Entrevistas', entrevistadosPeriodo], ['Contrataciones', contratadosPeriodo], ['Conversión', delPeriodo.length ? ((contratadosPeriodo / delPeriodo.length) * 100).toFixed(1) + '%' : '—']].map(([label, val]) => (
                <div key={label as string} style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                  <span style={{ fontSize: '0.8rem', color: C.muted }}>{label}</span>
                  <span style={{ fontSize: '0.88rem', fontWeight: 700, color: C.navy }}>{val}</span>
                </div>
              ))}
            </div>
          </div>
          <LinkBtn onClick={() => router.push(`${RUTA}/reportes`)} style={{ marginTop: '10px', fontSize: '0.8rem' }}>Ver reporte completo →</LinkBtn>
        </Card>

        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <span style={{ fontWeight: 700, color: C.navy, fontSize: '0.95rem' }}>Alertas y notificaciones</span>
            <LinkBtn onClick={() => router.push(`${RUTA}/notificaciones`)} style={{ fontSize: '0.8rem' }}>Ver todas</LinkBtn>
          </div>
          {alertas.length === 0
            ? <div style={{ fontSize: '0.85rem', color: C.muted, padding: '8px 0' }}>✨ Todo al día. No tienes alertas pendientes.</div>
            : alertas.slice(0, 4).map((a, i) => (
              <div key={i} onClick={() => router.push(RUTA + a.ir)} style={{ background: a.color, borderRadius: '8px', padding: '10px 12px', marginBottom: '10px', cursor: 'pointer' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: C.navy, marginBottom: '4px' }}>{a.icono} {a.texto}</div>
                <div style={{ fontSize: '0.78rem', color: C.muted }}>{a.sub}</div>
              </div>
            ))}
        </Card>
      </div>

      {modalEntrevista && (
        <ModalEntrevista abierto onCerrar={() => setModalEntrevista(null)} conductor={modalEntrevista.conductor} postulacion={modalEntrevista} onListo={cargar} />
      )}
    </div>
  )
}
