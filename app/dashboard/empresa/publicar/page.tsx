'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../supabase'
import { useEmpresa } from '../_lib/contexto'
import { comunasDe, LICENCIAS, LIMITE_EMPLEOS_GRATIS, PLANTILLAS, regiones, RUTA, TIPOS_TRABAJO, TURNOS } from '../_lib/datos'
import { Aviso, Btn, C, Campo, Card, Cargando, Chips, inputStyle, LinkBtn, Modal, PageHeader, Volver } from '../_lib/ui'

const enDias = (n: number, base?: string) => {
  const d = base ? new Date(base + 'T12:00:00') : new Date()
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}

const VACIO = {
  titulo: '', tipo_trabajo: '', licencias: [] as string[], region: '', comuna: '', turno: '',
  sueldo_min: '', sueldo_max: '', mostrar_sueldo: true, descripcion: '', requisitos: '', beneficios: '',
  vacantes: '1', fecha_inicio: '', fecha_vencimiento: enDias(30), duracion_dias: '', es_relampago: false,
}

export default function PublicarEmpleo() {
  const router = useRouter()
  const { userId, perfil, contadores, avisar, recargarContadores } = useEmpresa()
  const [f, setF] = useState<any>({ ...VACIO, region: perfil.region || '', comuna: perfil.comuna || '' })
  const [editarId, setEditarId] = useState<string | null>(null)
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const [verPlantillas, setVerPlantillas] = useState(false)

  useEffect(() => {
    (async () => {
      const q = new URLSearchParams(window.location.search)
      const editar = q.get('editar'), duplicar = q.get('duplicar')
      if (q.get('plantillas')) setVerPlantillas(true)
      if (q.get('relampago')) setF((x: any) => ({ ...x, es_relampago: true, fecha_inicio: enDias(1), duracion_dias: '3', fecha_vencimiento: enDias(1) }))
      const plantilla = PLANTILLAS.find(p => p.id === q.get('plantilla'))
      if (plantilla) setF((x: any) => ({ ...x, ...plantilla.datos }))
      const origen = editar || duplicar
      if (origen) {
        const { data } = await supabase.from('empleos').select('*').eq('id', origen).eq('empresa_id', userId).single()
        if (data) {
          const datos: any = {}
          Object.keys(VACIO).forEach(k => { datos[k] = data[k] == null ? (VACIO as any)[k] : typeof (VACIO as any)[k] === 'string' ? String(data[k]) : data[k] })
          if (duplicar) { datos.titulo = data.titulo + ' (copia)'; datos.fecha_vencimiento = enDias(30) }
          setF(datos)
          if (editar) setEditarId(editar)
        }
      }
      setCargando(false)
    })()
  }, [userId])

  const set = (k: string, v: any) => setF((x: any) => ({ ...x, [k]: v }))

  const usarPlantilla = (id: string) => {
    const p = PLANTILLAS.find(x => x.id === id)
    if (p) setF((x: any) => ({ ...x, ...p.datos }))
    setVerPlantillas(false)
    avisar(`Plantilla "${p?.nombre}" cargada. Revisa y ajusta los datos.`)
  }

  const guardar = async (estado: 'activo' | 'pausado') => {
    setError('')
    if (!f.titulo.trim()) return setError('Escribe el nombre del cargo.')
    if (!f.licencias.length) return setError('Selecciona al menos una licencia requerida.')
    if (!f.region) return setError('Selecciona la región del trabajo.')
    if (f.es_relampago && !f.fecha_inicio) return setError('Indica cuándo comienza la pega relámpago.')
    if (f.sueldo_min && f.sueldo_max && Number(f.sueldo_min) > Number(f.sueldo_max)) return setError('El sueldo mínimo no puede ser mayor al máximo.')
    setGuardando(true)
    const num = (v: any) => (v === '' || v == null ? null : Number(String(v).replace(/\D/g, '')))
    const datos = {
      titulo: f.titulo.trim(), tipo_trabajo: f.tipo_trabajo || null, licencias: f.licencias, region: f.region, comuna: f.comuna || null,
      turno: f.turno || null, sueldo_min: num(f.sueldo_min), sueldo_max: f.es_relampago ? null : num(f.sueldo_max), mostrar_sueldo: f.mostrar_sueldo,
      descripcion: f.descripcion || null, requisitos: f.requisitos || null, beneficios: f.beneficios || null,
      vacantes: num(f.vacantes) || 1, fecha_inicio: f.fecha_inicio || null, fecha_vencimiento: f.fecha_vencimiento || null,
      duracion_dias: f.es_relampago ? num(f.duracion_dias) : null, es_relampago: f.es_relampago,
    }
    const res = editarId
      ? await supabase.from('empleos').update(datos).eq('id', editarId).select('id').single()
      : await supabase.from('empleos').insert({ ...datos, empresa_id: userId, estado }).select('id').single()
    setGuardando(false)
    if (res.error) return setError('No se pudo guardar: ' + res.error.message)
    recargarContadores()
    avisar(editarId ? 'Cambios guardados' : estado === 'activo' ? '¡Empleo publicado! Ya lo pueden ver los conductores.' : 'Guardado como borrador (pausado)')
    router.push(`${RUTA}/empleos/${res.data.id}`)
  }

  if (cargando) return <Cargando />

  const superaLimite = !editarId && perfil.plan !== 'pro' && contadores.empleosActivos >= LIMITE_EMPLEOS_GRATIS
  const lbl = f.es_relampago ? 'Pega Relámpago' : 'Empleo'

  return (
    <div style={{ maxWidth: '860px' }}>
      <Volver />
      <PageHeader titulo={editarId ? `Editar ${lbl.toLowerCase()}` : f.es_relampago ? '⚡ Publicar Pega Relámpago' : 'Publicar empleo'} sub={f.es_relampago ? 'Trabajo urgente de pocos días. Se destaca para los conductores disponibles.' : 'Completa los datos del cargo. Los conductores lo verán al buscar empleo.'}>
        {!editarId && <Btn variante="secundario" onClick={() => setVerPlantillas(true)}>📄 Usar plantilla</Btn>}
      </PageHeader>

      {superaLimite && (
        <Aviso tipo="alerta">El plan Gratis incluye {LIMITE_EMPLEOS_GRATIS} empleo activo a la vez y ya tienes {contadores.empleosActivos}. <LinkBtn onClick={() => router.push(`${RUTA}/planes`)}>Conoce el plan Pro</LinkBtn> para publicar sin límite.</Aviso>
      )}

      <Card style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '18px', flexWrap: 'wrap' }}>
          {[{ v: false, t: '💼 Empleo regular', s: 'Contrato o plazo largo' }, { v: true, t: '⚡ Pega Relámpago', s: 'Urgente, pocos días' }].map(o => (
            <button key={String(o.v)} type="button" onClick={() => set('es_relampago', o.v)} style={{ flex: 1, minWidth: '200px', textAlign: 'left', background: f.es_relampago === o.v ? '#e8f0fe' : 'white', border: `2px solid ${f.es_relampago === o.v ? C.blue : C.border}`, borderRadius: '10px', padding: '12px 14px', cursor: 'pointer', fontFamily: 'inherit' }}>
              <div style={{ fontWeight: 700, color: C.navy }}>{o.t}</div>
              <div style={{ fontSize: '0.78rem', color: C.muted }}>{o.s}</div>
            </button>
          ))}
        </div>

        <Campo label="Cargo *"><input value={f.titulo} onChange={e => set('titulo', e.target.value)} style={inputStyle} placeholder="Ej: Conductor A4 para faena minera" /></Campo>
        <div className="nd-grid-2">
          <Campo label="Tipo de trabajo">
            <select value={f.tipo_trabajo} onChange={e => set('tipo_trabajo', e.target.value)} style={inputStyle}>
              <option value="">Selecciona...</option>{TIPOS_TRABAJO.map(t => <option key={t}>{t}</option>)}
            </select>
          </Campo>
          <Campo label="Turno / jornada">
            <select value={f.turno} onChange={e => set('turno', e.target.value)} style={inputStyle}>
              <option value="">Selecciona...</option>{TURNOS.map(t => <option key={t}>{t}</option>)}
            </select>
          </Campo>
        </div>
        <Campo label="Licencias requeridas *" ayuda="Puedes marcar más de una. El conductor debe tener al menos una."><Chips opciones={LICENCIAS} valor={f.licencias} onChange={v => set('licencias', v)} multiple /></Campo>
        <div className="nd-grid-2">
          <Campo label="Región *">
            <select value={f.region} onChange={e => { set('region', e.target.value); set('comuna', '') }} style={inputStyle}>
              <option value="">Selecciona...</option>{regiones.map(r => <option key={r}>{r}</option>)}
            </select>
          </Campo>
          <Campo label="Comuna / faena">
            <select value={f.comuna} onChange={e => set('comuna', e.target.value)} style={inputStyle} disabled={!f.region}>
              <option value="">{f.region ? 'Selecciona...' : 'Primero elige región'}</option>{comunasDe(f.region).map(c => <option key={c}>{c}</option>)}
            </select>
          </Campo>
        </div>
      </Card>

      <Card style={{ marginBottom: '16px' }}>
        <div style={{ fontWeight: 700, color: C.navy, marginBottom: '14px' }}>{f.es_relampago ? 'Fechas y pago' : 'Condiciones'}</div>
        {f.es_relampago ? (
          <div className="nd-grid-2">
            <Campo label="Fecha de inicio *"><input type="date" value={f.fecha_inicio} onChange={e => { set('fecha_inicio', e.target.value); set('fecha_vencimiento', e.target.value) }} style={inputStyle} /></Campo>
            <Campo label="Duración (días)"><input type="number" min="1" max="30" value={f.duracion_dias} onChange={e => set('duracion_dias', e.target.value)} style={inputStyle} /></Campo>
            <Campo label="Pago por día (CLP)"><input inputMode="numeric" value={f.sueldo_min} onChange={e => set('sueldo_min', e.target.value.replace(/\D/g, ''))} style={inputStyle} placeholder="Ej: 80000" /></Campo>
            <Campo label="Conductores necesarios"><input type="number" min="1" value={f.vacantes} onChange={e => set('vacantes', e.target.value)} style={inputStyle} /></Campo>
          </div>
        ) : (
          <div className="nd-grid-2">
            <Campo label="Sueldo líquido mínimo (CLP)"><input inputMode="numeric" value={f.sueldo_min} onChange={e => set('sueldo_min', e.target.value.replace(/\D/g, ''))} style={inputStyle} placeholder="Ej: 1200000" /></Campo>
            <Campo label="Sueldo líquido máximo (CLP)"><input inputMode="numeric" value={f.sueldo_max} onChange={e => set('sueldo_max', e.target.value.replace(/\D/g, ''))} style={inputStyle} placeholder="Ej: 1600000" /></Campo>
            <Campo label="Fecha de inicio"><input type="date" value={f.fecha_inicio} onChange={e => set('fecha_inicio', e.target.value)} style={inputStyle} /></Campo>
            <Campo label="Vacantes"><input type="number" min="1" value={f.vacantes} onChange={e => set('vacantes', e.target.value)} style={inputStyle} /></Campo>
          </div>
        )}
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: C.navy, marginBottom: '16px', cursor: 'pointer' }}>
          <input type="checkbox" checked={f.mostrar_sueldo} onChange={e => set('mostrar_sueldo', e.target.checked)} /> Mostrar el {f.es_relampago ? 'pago' : 'sueldo'} a los conductores
        </label>
        <Campo label="Publicación visible hasta" ayuda="Después de esta fecha el aviso deja de mostrarse a los conductores."><input type="date" value={f.fecha_vencimiento} onChange={e => set('fecha_vencimiento', e.target.value)} style={{ ...inputStyle, maxWidth: '260px' }} /></Campo>
      </Card>

      <Card style={{ marginBottom: '16px' }}>
        <div style={{ fontWeight: 700, color: C.navy, marginBottom: '14px' }}>Descripción</div>
        <Campo label="Descripción del trabajo"><textarea rows={4} value={f.descripcion} onChange={e => set('descripcion', e.target.value)} style={{ ...inputStyle, resize: 'vertical' }} placeholder="¿Qué hará el conductor? ¿Qué equipo usará? ¿Dónde?" /></Campo>
        <Campo label="Requisitos" ayuda="Uno por línea"><textarea rows={4} value={f.requisitos} onChange={e => set('requisitos', e.target.value)} style={{ ...inputStyle, resize: 'vertical' }} /></Campo>
        <Campo label="Beneficios" ayuda="Uno por línea"><textarea rows={3} value={f.beneficios} onChange={e => set('beneficios', e.target.value)} style={{ ...inputStyle, resize: 'vertical' }} /></Campo>
      </Card>

      {error && <Aviso tipo="error">{error}</Aviso>}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', flexWrap: 'wrap', marginBottom: '40px' }}>
        <Btn variante="secundario" onClick={() => router.back()}>Cancelar</Btn>
        {editarId
          ? <Btn onClick={() => guardar('activo')} disabled={guardando}>{guardando ? 'Guardando...' : 'Guardar cambios'}</Btn>
          : <>
            <Btn variante="secundario" onClick={() => guardar('pausado')} disabled={guardando}>Guardar como borrador</Btn>
            <Btn onClick={() => guardar('activo')} disabled={guardando}>{guardando ? 'Publicando...' : `Publicar ${lbl.toLowerCase()}`}</Btn>
          </>}
      </div>

      <Modal abierto={verPlantillas} onCerrar={() => setVerPlantillas(false)} titulo="Plantillas de empleo" ancho={600}>
        <p style={{ fontSize: '0.85rem', color: C.muted, marginTop: 0 }}>Elige una plantilla para rellenar el formulario. Luego puedes cambiar lo que quieras.</p>
        {PLANTILLAS.map(p => (
          <button key={p.id} type="button" onClick={() => usarPlantilla(p.id)} style={{ display: 'block', width: '100%', textAlign: 'left', background: C.bg, border: `1px solid ${C.border}`, borderRadius: '10px', padding: '12px 14px', marginBottom: '10px', cursor: 'pointer', fontFamily: 'inherit' }}>
            <div style={{ fontWeight: 700, color: C.navy, fontSize: '0.9rem' }}>{p.nombre}</div>
            <div style={{ fontSize: '0.78rem', color: C.muted }}>{p.datos.tipo_trabajo} · Licencia {p.datos.licencias.join(', ')} · {p.datos.turno}</div>
          </button>
        ))}
      </Modal>
    </div>
  )
}
