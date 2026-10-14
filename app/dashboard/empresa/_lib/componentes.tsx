'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../supabase'
import { useEmpresa } from './contexto'
import { cambiarEstadoPostulacion } from './acciones'
import {
  calcularMatch, diasHasta, enlaceWhatsApp, ESTADOS_POSTULACION, EstadoPostulacion, fecha, haceCuanto,
  nombreConductor, RUTA,
} from './datos'
import {
  Avatar, BadgeEstadoEmpleo, BadgeEstadoPostulacion, BadgeMatch, Btn, C, Campo, IconBtn, inputStyle, Menu, Modal,
} from './ui'

const COLORES = ['#2563eb', '#27ae60', '#e67e22', '#8e44ad', '#0891b2', '#be185d']
export const colorPara = (id: string) => COLORES[(id || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0) % COLORES.length]

export const mensajeWhatsApp = (empresa: string, conductor: any, empleo?: any) =>
  `Hola ${conductor?.nombre || ''}, te escribimos de ${empresa} a través de NetDriver${empleo?.titulo ? ` por tu postulación a "${empleo.titulo}"` : ''}. ¿Tienes unos minutos para conversar?`

// ---------- Fila de postulación (usada en Inicio, Postulaciones, Detalle de empleo) ----------
export function FilaPostulacion({ p, guardado, onGuardar, onCambio, onEntrevista, mostrarEmpleo = true }: {
  p: any; guardado: boolean; onGuardar: () => void; onCambio: () => void; onEntrevista: () => void; mostrarEmpleo?: boolean
}) {
  const router = useRouter()
  const { perfil, avisar, recargarContadores } = useEmpresa()
  const [menu, setMenu] = useState(false)
  const c = p.conductor || {}
  const match = calcularMatch(c, p.empleo)
  const wa = enlaceWhatsApp(c.telefono, mensajeWhatsApp(perfil.nombre_empresa || 'nuestra empresa', c, p.empleo))
  const verPerfil = async () => {
    if (p.estado === 'nueva') { await cambiarEstadoPostulacion(p.id, 'revisada'); recargarContadores() }
    router.push(`${RUTA}/conductores/${c.id}?postulacion=${p.id}`)
  }
  const cambiar = async (estado: EstadoPostulacion) => {
    const { error } = await cambiarEstadoPostulacion(p.id, estado)
    if (error) avisar('No se pudo actualizar: ' + error.message, 'error')
    else { avisar('Postulación actualizada'); onCambio(); recargarContadores() }
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 20px', borderBottom: `1px solid ${C.bg}`, flexWrap: 'wrap' }}>
      <div onClick={verPerfil} style={{ cursor: 'pointer' }}><Avatar nombre={c.nombre} apellido={c.apellido} foto={c.foto_perfil_url} color={colorPara(c.id)} /></div>
      <div style={{ flex: 1, minWidth: '180px', cursor: 'pointer' }} onClick={verPerfil}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px', flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 700, color: C.navy, fontSize: '0.92rem' }}>{nombreConductor(c)}</span>
          {c.perfil_completo && <span title="Perfil completo" style={{ color: C.blue, fontSize: '0.85rem' }}>✓</span>}
          {p.estado === 'nueva' && <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: C.red }} title="Nueva" />}
        </div>
        <div style={{ fontSize: '0.8rem', color: C.muted }}>
          {[(c.licencias || []).length ? 'Licencia ' + c.licencias.join(', ') : null, c.anos_experiencia ? `${c.anos_experiencia} años exp.` : null, c.comuna || c.region].filter(Boolean).join(' · ') || 'Perfil sin completar'}
        </div>
        {mostrarEmpleo && p.empleo && <div style={{ fontSize: '0.78rem', color: C.blue, marginTop: '2px' }}>{p.empleo.es_relampago ? '⚡ ' : '💼 '}{p.empleo.titulo}</div>}
      </div>
      <BadgeMatch match={match} />
      <BadgeEstadoPostulacion estado={p.estado} />
      <span style={{ fontSize: '0.78rem', color: C.muted, minWidth: '80px' }}>{haceCuanto(p.created_at)}</span>
      <div style={{ display: 'flex', gap: '6px', position: 'relative' }}>
        <IconBtn title="Ver perfil" onClick={verPerfil}>👁</IconBtn>
        <IconBtn title={wa ? 'Escribir por WhatsApp' : 'El conductor no registró teléfono'} href={wa} onClick={() => avisar('Este conductor aún no registra un teléfono', 'error')}>💬</IconBtn>
        <IconBtn title={guardado ? 'Quitar de guardados' : 'Guardar conductor'} onClick={onGuardar}>{guardado ? '⭐' : '☆'}</IconBtn>
        <IconBtn title="Más acciones" onClick={() => setMenu(true)}>⋯</IconBtn>
        <Menu abierto={menu} onCerrar={() => setMenu(false)} opciones={[
          { label: '📅 Agendar entrevista', onClick: onEntrevista },
          ...ESTADOS_POSTULACION.filter(e => e.id !== p.estado && e.id !== 'nueva' && e.id !== 'entrevista').map(e => ({
            label: e.id === 'contratado' ? '✅ Marcar como contratado' : e.id === 'descartada' ? '✕ Descartar' : `Mover a: ${e.label}`,
            onClick: () => cambiar(e.id), peligro: e.id === 'descartada',
          })),
        ]} />
      </div>
    </div>
  )
}

// ---------- Modal para agendar / editar entrevista ----------
export function ModalEntrevista({ abierto, onCerrar, conductor, postulacion, entrevista, onListo }: {
  abierto: boolean; onCerrar: () => void; conductor: any; postulacion?: any; entrevista?: any; onListo: () => void
}) {
  const { userId, avisar, recargarContadores } = useEmpresa()
  const local = (iso?: string) => { if (!iso) return ''; const d = new Date(iso); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 16) }
  const [fechaHora, setFechaHora] = useState(local(entrevista?.fecha_hora))
  const [modalidad, setModalidad] = useState(entrevista?.modalidad || 'presencial')
  const [lugar, setLugar] = useState(entrevista?.lugar || '')
  const [notas, setNotas] = useState(entrevista?.notas || '')
  const [guardando, setGuardando] = useState(false)

  const guardar = async () => {
    if (!fechaHora) { avisar('Elige fecha y hora', 'error'); return }
    setGuardando(true)
    const datos = { fecha_hora: new Date(fechaHora).toISOString(), modalidad, lugar: lugar || null, notas: notas || null }
    const { error } = entrevista
      ? await supabase.from('entrevistas').update(datos).eq('id', entrevista.id)
      : await supabase.from('entrevistas').insert({ ...datos, empresa_id: userId, conductor_id: conductor.id, postulacion_id: postulacion?.id || null, empleo_id: postulacion?.empleo_id || postulacion?.empleo?.id || null })
    if (!error && postulacion && !entrevista && postulacion.estado !== 'contratado') await cambiarEstadoPostulacion(postulacion.id, 'entrevista')
    setGuardando(false)
    if (error) { avisar('No se pudo guardar: ' + error.message, 'error'); return }
    avisar(entrevista ? 'Entrevista actualizada' : 'Entrevista agendada')
    recargarContadores(); onListo(); onCerrar()
  }

  return (
    <Modal abierto={abierto} onCerrar={onCerrar} titulo={`${entrevista ? 'Editar' : 'Agendar'} entrevista · ${nombreConductor(conductor)}`}>
      <Campo label="Fecha y hora"><input type="datetime-local" value={fechaHora} onChange={e => setFechaHora(e.target.value)} style={inputStyle} /></Campo>
      <Campo label="Modalidad">
        <select value={modalidad} onChange={e => setModalidad(e.target.value)} style={inputStyle}>
          <option value="presencial">Presencial</option><option value="videollamada">Videollamada</option><option value="telefono">Teléfono</option>
        </select>
      </Campo>
      <Campo label={modalidad === 'presencial' ? 'Dirección' : modalidad === 'videollamada' ? 'Enlace de la videollamada' : 'Número desde el que llamarán'}>
        <input value={lugar} onChange={e => setLugar(e.target.value)} style={inputStyle} placeholder={modalidad === 'presencial' ? 'Ej: Av. Grecia 1234, Antofagasta' : modalidad === 'videollamada' ? 'https://meet.google.com/...' : '+56 9 ...'} />
      </Campo>
      <Campo label="Notas internas"><textarea value={notas} onChange={e => setNotas(e.target.value)} rows={3} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Solo las ve tu empresa" /></Campo>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
        <Btn variante="secundario" onClick={onCerrar}>Cancelar</Btn>
        <Btn onClick={guardar} disabled={guardando}>{guardando ? 'Guardando...' : entrevista ? 'Guardar cambios' : 'Agendar'}</Btn>
      </div>
    </Modal>
  )
}

// ---------- Acciones sobre un empleo ----------
export function useAccionesEmpleo(onCambio: () => void) {
  const router = useRouter()
  const { avisar, recargarContadores } = useEmpresa()
  const actualizar = async (id: string, cambios: any, texto: string) => {
    const { error } = await supabase.from('empleos').update(cambios).eq('id', id)
    if (error) avisar('No se pudo actualizar: ' + error.message, 'error')
    else { avisar(texto); onCambio(); recargarContadores() }
  }
  return {
    ver: (e: any) => router.push(`${RUTA}/empleos/${e.id}`),
    editar: (e: any) => router.push(`${RUTA}/publicar?editar=${e.id}`),
    duplicar: (e: any) => router.push(`${RUTA}/publicar?duplicar=${e.id}`),
    pausar: (e: any) => actualizar(e.id, { estado: 'pausado' }, 'Empleo pausado: ya no aparece a los conductores'),
    activar: (e: any) => {
      const d = diasHasta(e.fecha_vencimiento)
      const cambios: any = { estado: 'activo' }
      if (d != null && d < 0) { const n = new Date(); n.setDate(n.getDate() + 30); cambios.fecha_vencimiento = n.toISOString().slice(0, 10) }
      actualizar(e.id, cambios, cambios.fecha_vencimiento ? 'Empleo reactivado por 30 días más' : 'Empleo activado')
    },
    cerrar: (e: any) => actualizar(e.id, { estado: 'cerrado' }, 'Empleo cerrado'),
    eliminar: async (e: any) => {
      if (!window.confirm(`¿Eliminar "${e.titulo}"? También se borrarán sus postulaciones. Esta acción no se puede deshacer.`)) return
      const { error } = await supabase.from('empleos').delete().eq('id', e.id)
      if (error) avisar('No se pudo eliminar: ' + error.message, 'error')
      else { avisar('Empleo eliminado'); onCambio(); recargarContadores() }
    },
  }
}

export function MenuEmpleo({ e, acciones }: { e: any; acciones: ReturnType<typeof useAccionesEmpleo> }) {
  const [abierto, setAbierto] = useState(false)
  return (
    <div style={{ position: 'relative' }}>
      <IconBtn title="Más acciones" onClick={() => setAbierto(true)}>⋯</IconBtn>
      <Menu abierto={abierto} onCerrar={() => setAbierto(false)} opciones={[
        ...(e.estado === 'activo' ? [{ label: '⏸ Pausar', onClick: () => acciones.pausar(e) }] : [{ label: '▶ Activar', onClick: () => acciones.activar(e) }]),
        ...(e.estado !== 'cerrado' ? [{ label: '🔒 Cerrar empleo', onClick: () => acciones.cerrar(e) }] : []),
        { label: '📄 Duplicar', onClick: () => acciones.duplicar(e) },
        { label: '🗑 Eliminar', onClick: () => acciones.eliminar(e), peligro: true },
      ]} />
    </div>
  )
}

export function TablaEmpleos({ empleos, conteos, onCambio }: { empleos: any[]; conteos: Record<string, number>; onCambio: () => void }) {
  const acciones = useAccionesEmpleo(onCambio)
  return (
    <div className="nd-scroll">
      <table className="nd-tabla">
        <thead>
          <tr style={{ background: C.bg }}>
            {['Puesto', 'Ubicación', 'Postulaciones', 'Vencimiento', 'Estado', 'Acciones'].map(h => (
              <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '0.72rem', fontWeight: 700, color: C.muted, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {empleos.map(e => {
            const d = diasHasta(e.fecha_vencimiento)
            const urgente = d != null && d <= 3 && e.estado === 'activo'
            return (
              <tr key={e.id} style={{ borderBottom: `1px solid ${C.bg}` }}>
                <td style={{ padding: '12px 16px', cursor: 'pointer' }} onClick={() => acciones.ver(e)}>
                  <div style={{ fontWeight: 600, color: C.navy, fontSize: '0.88rem' }}>{e.es_relampago && '⚡ '}{e.titulo}</div>
                  <div style={{ fontSize: '0.78rem', color: C.muted }}>{[e.tipo_trabajo, (e.licencias || []).join(', ')].filter(Boolean).join(' · ')}</div>
                </td>
                <td style={{ padding: '12px 16px', fontSize: '0.85rem', color: C.muted, whiteSpace: 'nowrap' }}>📍 {[e.comuna, e.region].filter(Boolean).join(', ') || '—'}</td>
                <td style={{ padding: '12px 16px' }}>
                  <button onClick={() => acciones.ver(e)} style={{ background: 'none', border: 'none', fontSize: '0.88rem', fontWeight: 700, color: C.blue, cursor: 'pointer' }}>{conteos[e.id] || 0}</button>
                </td>
                <td style={{ padding: '12px 16px', fontSize: '0.82rem', color: urgente || (d != null && d < 0) ? C.red : C.muted, fontWeight: urgente ? 700 : 400, whiteSpace: 'nowrap' }}>
                  {fecha(e.fecha_vencimiento)}{d != null && d < 0 && e.estado === 'activo' ? ' (vencido)' : urgente ? ` (${d === 0 ? 'hoy' : d + ' d'})` : ''}
                </td>
                <td style={{ padding: '12px 16px' }}><BadgeEstadoEmpleo estado={e.estado} /></td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <IconBtn title="Ver empleo y postulantes" onClick={() => acciones.ver(e)}>👁</IconBtn>
                    <IconBtn title="Editar" onClick={() => acciones.editar(e)}>✏️</IconBtn>
                    <MenuEmpleo e={e} acciones={acciones} />
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// Conteo de postulaciones por empleo
export async function conteoPostulaciones(empresaId: string) {
  const { data } = await supabase.from('postulaciones').select('empleo_id').eq('empresa_id', empresaId)
  const m: Record<string, number> = {}
  ;(data || []).forEach((p: any) => { m[p.empleo_id] = (m[p.empleo_id] || 0) + 1 })
  return m
}
