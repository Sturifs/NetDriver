'use client'
import { useCallback, useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '../../../../supabase'
import { useEmpresa } from '../../_lib/contexto'
import { SELECT_POSTULACION, useGuardados } from '../../_lib/acciones'
import { FilaPostulacion, MenuEmpleo, ModalEntrevista, useAccionesEmpleo } from '../../_lib/componentes'
import { diasHasta, ESTADOS_POSTULACION, fecha, RUTA, sueldoEmpleo } from '../../_lib/datos'
import { BadgeEstadoEmpleo, Btn, C, Card, Cargando, PageHeader, Tabs, Vacio, Volver } from '../../_lib/ui'

export default function DetalleEmpleo() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { userId } = useEmpresa()
  const { guardados, alternarGuardado } = useGuardados(userId)
  const [empleo, setEmpleo] = useState<any>(null)
  const [postulaciones, setPostulaciones] = useState<any[]>([])
  const [cargando, setCargando] = useState(true)
  const [tab, setTab] = useState('todas')
  const [modal, setModal] = useState<any>(null)

  const cargar = useCallback(async () => {
    const [e, p] = await Promise.all([
      supabase.from('empleos').select('*').eq('id', id).eq('empresa_id', userId).maybeSingle(),
      supabase.from('postulaciones').select(SELECT_POSTULACION).eq('empleo_id', id).order('created_at', { ascending: false }),
    ])
    setEmpleo(e.data); setPostulaciones(p.data || []); setCargando(false)
  }, [id, userId])
  useEffect(() => { cargar() }, [cargar])
  const acciones = useAccionesEmpleo(cargar)

  if (cargando) return <Cargando />
  if (!empleo) return <Vacio icono="🔎" titulo="Empleo no encontrado" texto="Puede que haya sido eliminado." accion="Volver a mis empleos" onAccion={() => router.push(`${RUTA}/empleos`)} />

  const d = diasHasta(empleo.fecha_vencimiento)
  const lista = postulaciones.filter(p => tab === 'todas' || p.estado === tab)
  const lineas = (t?: string) => (t || '').split('\n').map(s => s.trim()).filter(Boolean)
  const busquedaSugerida = `${RUTA}/busqueda?${new URLSearchParams({ ...(empleo.licencias?.[0] ? { licencia: empleo.licencias[0] } : {}), ...(empleo.region ? { region: empleo.region } : {}) })}`

  return (
    <div>
      <Volver a={`${RUTA}/empleos`} texto="← Mis empleos" />
      <PageHeader titulo={<>{empleo.es_relampago && '⚡ '}{empleo.titulo} <BadgeEstadoEmpleo estado={empleo.estado} /></>} sub={`Publicado el ${fecha(empleo.created_at)} · ${postulaciones.length} postulante${postulaciones.length === 1 ? '' : 's'}`}>
        <Btn variante="secundario" onClick={() => acciones.editar(empleo)}>✏️ Editar</Btn>
        {empleo.estado === 'activo'
          ? <Btn variante="secundario" onClick={() => acciones.pausar(empleo)}>⏸ Pausar</Btn>
          : <Btn variante="verde" onClick={() => acciones.activar(empleo)}>▶ Activar</Btn>}
        <MenuEmpleo e={empleo} acciones={acciones} />
      </PageHeader>

      {empleo.estado === 'activo' && d != null && d < 0 && (
        <div style={{ background: '#fdecec', color: '#b91c1c', borderRadius: '8px', padding: '10px 14px', fontSize: '0.85rem', marginBottom: '16px' }}>
          Este aviso venció el {fecha(empleo.fecha_vencimiento)} y ya no se muestra a los conductores. <button onClick={() => acciones.activar(empleo)} style={{ background: 'none', border: 'none', color: '#b91c1c', fontWeight: 700, textDecoration: 'underline', cursor: 'pointer' }}>Extender 30 días</button>
        </div>
      )}

      <div className="nd-cols">
        <div style={{ flex: 1, minWidth: 0, width: '100%' }}>
          <Card padding="0" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: C.navy, margin: 0 }}>Postulantes</h2>
              <Btn variante="secundario" onClick={() => router.push(busquedaSugerida)} style={{ fontSize: '0.8rem', padding: '6px 12px' }}>🔍 Buscar conductores para este cargo</Btn>
            </div>
            <div style={{ padding: '10px 20px 0' }}>
              <Tabs activo={tab} onChange={setTab} tabs={[{ id: 'todas', label: 'Todas', n: postulaciones.length }, ...ESTADOS_POSTULACION.map(e => ({ id: e.id, label: e.label, n: postulaciones.filter(p => p.estado === e.id).length }))]} />
            </div>
            {lista.length
              ? lista.map(p => <FilaPostulacion key={p.id} p={p} mostrarEmpleo={false} guardado={guardados.has(p.conductor_id)} onGuardar={() => alternarGuardado(p.conductor_id)} onCambio={cargar} onEntrevista={() => setModal(p)} />)
              : <Vacio icono="📋" titulo={postulaciones.length ? 'Nadie en esta etapa' : 'Aún no hay postulantes'} texto={postulaciones.length ? undefined : empleo.estado === 'activo' ? 'Mientras tanto, puedes buscar conductores que calcen con el cargo y escribirles directamente.' : 'Activa el empleo para que los conductores puedan postular.'} />}
          </Card>
        </div>

        <div className="nd-aside">
          <Card>
            <div style={{ fontWeight: 700, color: C.navy, marginBottom: '12px' }}>Detalle del aviso</div>
            {[
              ['💰', empleo.es_relampago ? 'Pago' : 'Sueldo', sueldoEmpleo(empleo) + (empleo.mostrar_sueldo ? '' : ' (oculto a conductores)')],
              ['🪪', 'Licencias', (empleo.licencias || []).join(', ') || '—'],
              ['📍', 'Ubicación', [empleo.comuna, empleo.region].filter(Boolean).join(', ') || '—'],
              ['🚚', 'Tipo de trabajo', empleo.tipo_trabajo || '—'],
              ['🕐', 'Turno', empleo.turno || '—'],
              ['👥', 'Vacantes', empleo.vacantes || 1],
              ['📅', 'Inicio', fecha(empleo.fecha_inicio)],
              ...(empleo.es_relampago ? [['⏱', 'Duración', empleo.duracion_dias ? `${empleo.duracion_dias} días` : '—']] : []),
              ['⏰', 'Visible hasta', fecha(empleo.fecha_vencimiento)],
            ].map(([i, l, v]) => (
              <div key={l as string} style={{ display: 'flex', gap: '10px', padding: '7px 0', borderBottom: `1px solid ${C.bg}`, fontSize: '0.85rem' }}>
                <span>{i}</span><span style={{ color: C.muted, minWidth: '100px' }}>{l}</span><span style={{ color: C.navy, fontWeight: 600 }}>{v}</span>
              </div>
            ))}
          </Card>
          {[['Descripción', empleo.descripcion], ['Requisitos', empleo.requisitos], ['Beneficios', empleo.beneficios]].filter(([, t]) => t).map(([t, txt]) => (
            <Card key={t}>
              <div style={{ fontWeight: 700, color: C.navy, marginBottom: '8px' }}>{t}</div>
              {t === 'Descripción'
                ? <p style={{ fontSize: '0.85rem', color: C.navy, lineHeight: 1.6, margin: 0, whiteSpace: 'pre-line' }}>{txt}</p>
                : <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.85rem', color: C.navy, lineHeight: 1.7 }}>{lineas(txt).map(l => <li key={l}>{l}</li>)}</ul>}
            </Card>
          ))}
        </div>
      </div>

      {modal && <ModalEntrevista abierto onCerrar={() => setModal(null)} conductor={modal.conductor} postulacion={modal} onListo={cargar} />}
    </div>
  )
}
