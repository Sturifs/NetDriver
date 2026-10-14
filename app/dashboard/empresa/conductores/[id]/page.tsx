'use client'
import { useCallback, useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '../../../../supabase'
import { useEmpresa } from '../../_lib/contexto'
import { cambiarEstadoPostulacion, useGuardados } from '../../_lib/acciones'
import { colorPara, mensajeWhatsApp, ModalEntrevista } from '../../_lib/componentes'
import { calcularMatch, CAMPOS_CONDUCTOR, diasHasta, enlaceWhatsApp, ESTADOS_POSTULACION, EstadoPostulacion, fecha, fechaHora, haceCuanto, nombreConductor, RUTA } from '../../_lib/datos'
import { Avatar, BadgeEstadoPostulacion, BadgeMatch, Btn, C, Card, Cargando, inputStyle, LinkBtn, Vacio, Volver } from '../../_lib/ui'

const DOCS = [
  ['doc_hoja_vida_url', 'Hoja de vida del conductor'], ['doc_antecedentes_url', 'Certificado de antecedentes'],
  ['doc_cedula_frontal_url', 'Cédula de identidad'], ['doc_preocupacional_url', 'Examen preocupacional'],
  ['docs_cursos_urls', 'Cursos y certificaciones'], ['docs_experiencia_urls', 'Certificados de experiencia'],
  ['docs_finiquitos_urls', 'Finiquitos'], ['doc_residencia_url', 'Certificado de residencia'],
] as const

export default function PerfilConductor() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { userId, perfil, avisar, recargarContadores } = useEmpresa()
  const { guardados, alternarGuardado } = useGuardados(userId)
  const [c, setC] = useState<any>(null)
  const [postulaciones, setPostulaciones] = useState<any[]>([])
  const [entrevistas, setEntrevistas] = useState<any[]>([])
  const [cargando, setCargando] = useState(true)
  const [activaId, setActivaId] = useState<string>('')
  const [notas, setNotas] = useState('')
  const [modal, setModal] = useState<{ entrevista?: any } | null>(null)

  const cargar = useCallback(async () => {
    const [pc, ps, en] = await Promise.all([
      supabase.from('profiles').select(`${CAMPOS_CONDUCTOR}, equipos_detalle, otros_camion, otros_maquinaria, ${DOCS.map(d => d[0]).join(', ')}`).eq('id', id).eq('tipo', 'conductor').maybeSingle(),
      supabase.from('postulaciones').select('*, empleo:empleos(id, titulo, licencias, region, tipo_trabajo, es_relampago)').eq('empresa_id', userId).eq('conductor_id', id).order('created_at', { ascending: false }),
      supabase.from('entrevistas').select('*, empleo:empleos(titulo)').eq('empresa_id', userId).eq('conductor_id', id).order('fecha_hora', { ascending: false }),
    ])
    setC(pc.data); setPostulaciones(ps.data || []); setEntrevistas(en.data || [])
    const pedida = new URLSearchParams(window.location.search).get('postulacion')
    const activa = (ps.data || []).find((p: any) => p.id === pedida) || (ps.data || [])[0]
    if (activa) { setActivaId(activa.id); setNotas(activa.notas_empresa || '') }
    setCargando(false)
  }, [id, userId])
  useEffect(() => { cargar() }, [cargar])

  if (cargando) return <Cargando />
  if (!c) return <Vacio icono="👤" titulo="Conductor no encontrado" texto="El perfil no existe o no está disponible." accion="Ir a búsqueda" onAccion={() => router.push(`${RUTA}/busqueda`)} />

  const activa = postulaciones.find(p => p.id === activaId)
  const wa = enlaceWhatsApp(c.telefono, mensajeWhatsApp(perfil.nombre_empresa || 'nuestra empresa', c, activa?.empleo))
  const guardado = guardados.has(c.id)

  const cambiar = async (estado: EstadoPostulacion) => {
    if (!activa) return
    const { error } = await cambiarEstadoPostulacion(activa.id, estado)
    if (error) avisar('No se pudo actualizar: ' + error.message, 'error')
    else { avisar(estado === 'contratado' ? '¡Conductor contratado! 🎉' : 'Estado actualizado'); cargar(); recargarContadores() }
  }
  const guardarNotas = async () => {
    if (!activa) return
    const { error } = await supabase.from('postulaciones').update({ notas_empresa: notas }).eq('id', activa.id)
    avisar(error ? 'No se pudieron guardar las notas' : 'Notas guardadas', error ? 'error' : 'ok')
  }
  const fila = (icono: string, label: string, valor: any) => (
    <div style={{ display: 'flex', gap: '10px', padding: '8px 0', borderBottom: `1px solid ${C.bg}`, fontSize: '0.85rem' }}>
      <span>{icono}</span><span style={{ color: C.muted, minWidth: '140px' }}>{label}</span><span style={{ color: C.navy, fontWeight: 600 }}>{valor || '—'}</span>
    </div>
  )
  const lista = (v: any) => (Array.isArray(v) ? v.filter(Boolean).join(', ') : v) || '—'

  return (
    <div>
      <Volver />
      <Card style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '18px', alignItems: 'center', flexWrap: 'wrap' }}>
          <Avatar nombre={c.nombre} apellido={c.apellido} foto={c.foto_perfil_url} size={84} color={colorPara(c.id)} />
          <div style={{ flex: 1, minWidth: '200px' }}>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: C.navy, margin: '0 0 4px' }}>{nombreConductor(c)} {c.perfil_completo && <span style={{ color: C.blue, fontSize: '1rem' }} title="Perfil completo">✓</span>}</h1>
            <div style={{ color: C.muted, fontSize: '0.88rem' }}>📍 {[c.comuna, c.region].filter(Boolean).join(', ') || 'Ubicación no indicada'}{c.anos_experiencia ? ` · 🎖 ${c.anos_experiencia} de experiencia` : ''}</div>
            <div style={{ display: 'flex', gap: '6px', marginTop: '8px', flexWrap: 'wrap' }}>
              {(c.licencias || []).map((l: string) => <span key={l} style={{ background: '#e8f0fe', color: C.blue, fontSize: '0.75rem', fontWeight: 700, padding: '3px 9px', borderRadius: '6px' }}>Licencia {l}</span>)}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {wa ? <Btn variante="verde" href={wa}>💬 WhatsApp</Btn> : <Btn variante="secundario" disabled title="El conductor no registró teléfono">💬 Sin teléfono</Btn>}
            {c.telefono && <Btn variante="secundario" href={`tel:${c.telefono}`}>📞 Llamar</Btn>}
            {c.email && <Btn variante="secundario" href={`mailto:${c.email}`}>✉️ Correo</Btn>}
            <Btn variante="secundario" onClick={async () => { const r = await alternarGuardado(c.id); if (r != null) avisar(r ? 'Conductor guardado' : 'Quitado de guardados') }}>{guardado ? '⭐ Guardado' : '☆ Guardar'}</Btn>
            <Btn onClick={() => setModal({})}>📅 Agendar entrevista</Btn>
          </div>
        </div>
      </Card>

      <div className="nd-cols">
        <div style={{ flex: 1, minWidth: 0, width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Card>
            <div style={{ fontWeight: 700, color: C.navy, marginBottom: '8px' }}>Experiencia y disponibilidad</div>
            {fila('🎖', 'Años de experiencia', c.anos_experiencia)}
            {fila('🏗', 'Áreas', lista(c.areas_experiencia))}
            {fila('🚚', 'Tipos de trabajo', lista(c.tipos_trabajo))}
            {fila('🕐', 'Turnos', lista(c.turnos_experiencia))}
            {fila('📆', 'Disponibilidad', lista(c.disponibilidad_trabajo))}
            {fila('🧭', 'Trabaja fuera de su región', c.disponibilidad_fuera_region === 'si' ? 'Sí' : c.disponibilidad_fuera_region === 'no' ? 'No' : '—')}
            {fila('🚗', 'Movilidad propia', c.movilidad_propia === 'si' ? 'Sí' : c.movilidad_propia === 'no' ? 'No' : c.movilidad_propia)}
          </Card>
          <Card>
            <div style={{ fontWeight: 700, color: C.navy, marginBottom: '8px' }}>Licencias y equipos</div>
            {(c.licencias || []).length === 0 ? <div style={{ fontSize: '0.85rem', color: C.muted }}>No registra licencias.</div> : (c.licencias || []).map((l: string) => {
              const venc = c.licencias_vencimientos?.[l]; const d = diasHasta(venc)
              return fila('🪪', `Clase ${l}`, venc ? <>Vence {fecha(venc)} {d != null && d < 0 ? <span style={{ color: C.red }}>(vencida)</span> : d != null && d < 60 ? <span style={{ color: C.orange }}>(por vencer)</span> : <span style={{ color: C.green }}>(vigente)</span>}</> : 'Vencimiento no indicado')
            })}
            {fila('⚙️', 'Equipos que opera', lista([...(c.equipos_sel || []), c.otros_camion, c.otros_maquinaria]))}
          </Card>
          <Card>
            <div style={{ fontWeight: 700, color: C.navy, marginBottom: '8px' }}>Documentación cargada</div>
            <div className="nd-grid-2" style={{ gap: '6px' }}>
              {DOCS.map(([k, label]) => {
                const v = c[k]; const ok = Array.isArray(v) ? v.length > 0 : !!v
                return <div key={k} style={{ fontSize: '0.85rem', color: ok ? '#1b5e20' : C.muted }}>{ok ? '✅' : '⬜'} {label}</div>
              })}
            </div>
            <div style={{ fontSize: '0.75rem', color: C.muted, marginTop: '10px' }}>Para revisar los documentos, solicítalos al conductor durante el proceso.</div>
          </Card>
        </div>

        <div className="nd-aside">
          <Card>
            <div style={{ fontWeight: 700, color: C.navy, marginBottom: '10px' }}>Proceso con tu empresa</div>
            {postulaciones.length === 0
              ? <div style={{ fontSize: '0.85rem', color: C.muted }}>Este conductor no ha postulado a tus empleos. Puedes escribirle por WhatsApp para invitarlo.</div>
              : <>
                {postulaciones.length > 1 && (
                  <select value={activaId} onChange={e => { setActivaId(e.target.value); setNotas(postulaciones.find(p => p.id === e.target.value)?.notas_empresa || '') }} style={{ ...inputStyle, marginBottom: '10px' }}>
                    {postulaciones.map(p => <option key={p.id} value={p.id}>{p.empleo?.titulo}</option>)}
                  </select>
                )}
                {activa && <>
                  <LinkBtn onClick={() => router.push(`${RUTA}/empleos/${activa.empleo_id}`)} style={{ fontWeight: 700, marginBottom: '6px', display: 'block', textAlign: 'left' }}>{activa.empleo?.es_relampago ? '⚡ ' : '💼 '}{activa.empleo?.titulo}</LinkBtn>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap' }}>
                    <BadgeEstadoPostulacion estado={activa.estado} /><BadgeMatch match={calcularMatch(c, activa.empleo)} />
                    <span style={{ fontSize: '0.75rem', color: C.muted }}>Postuló {haceCuanto(activa.created_at).toLowerCase()}</span>
                  </div>
                  {activa.mensaje && <div style={{ background: C.bg, borderRadius: '8px', padding: '10px', fontSize: '0.83rem', color: C.navy, marginBottom: '10px' }}>“{activa.mensaje}”</div>}
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: C.muted, textTransform: 'uppercase', marginBottom: '6px' }}>Mover a</div>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' }}>
                    {ESTADOS_POSTULACION.filter(e => e.id !== 'nueva').map(e => (
                      <button key={e.id} type="button" onClick={() => e.id === 'entrevista' ? setModal({}) : cambiar(e.id)} disabled={activa.estado === e.id} style={{ background: activa.estado === e.id ? e.bg : 'white', color: e.color, border: `1px solid ${activa.estado === e.id ? e.color : C.border}`, borderRadius: '6px', padding: '5px 10px', fontSize: '0.78rem', fontWeight: 600, cursor: activa.estado === e.id ? 'default' : 'pointer', fontFamily: 'inherit' }}>{e.label}</button>
                    ))}
                  </div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: C.muted, textTransform: 'uppercase', marginBottom: '6px' }}>Notas internas</div>
                  <textarea value={notas} onChange={e => setNotas(e.target.value)} rows={3} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Solo las ve tu empresa" />
                  <Btn variante="secundario" onClick={guardarNotas} style={{ marginTop: '8px' }}>Guardar notas</Btn>
                </>}
              </>}
          </Card>
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontWeight: 700, color: C.navy }}>Entrevistas</span>
              <LinkBtn onClick={() => setModal({})} style={{ fontSize: '0.8rem' }}>+ Agendar</LinkBtn>
            </div>
            {entrevistas.length === 0 ? <div style={{ fontSize: '0.85rem', color: C.muted }}>Sin entrevistas agendadas.</div> : entrevistas.map(e => (
              <div key={e.id} onClick={() => e.estado === 'programada' && setModal({ entrevista: e })} style={{ padding: '8px 0', borderBottom: `1px solid ${C.bg}`, cursor: e.estado === 'programada' ? 'pointer' : 'default' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: C.navy }}>{fechaHora(e.fecha_hora)}</div>
                <div style={{ fontSize: '0.78rem', color: C.muted }}>{e.modalidad} · {e.estado}{e.empleo?.titulo ? ` · ${e.empleo.titulo}` : ''}</div>
              </div>
            ))}
          </Card>
        </div>
      </div>

      {modal && <ModalEntrevista abierto onCerrar={() => setModal(null)} conductor={c} postulacion={modal.entrevista ? undefined : activa} entrevista={modal.entrevista} onListo={cargar} />}
    </div>
  )
}
