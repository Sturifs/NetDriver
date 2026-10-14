'use client'
import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../supabase'
import { useEmpresa } from '../_lib/contexto'
import { SELECT_ENTREVISTA } from '../_lib/acciones'
import { colorPara, ModalEntrevista } from '../_lib/componentes'
import { enlaceWhatsApp, fechaHora, nombreConductor, RUTA } from '../_lib/datos'
import { Avatar, Badge, Btn, C, Card, Cargando, IconBtn, Menu, PageHeader, Tabs, Vacio } from '../_lib/ui'

const MODALIDAD: Record<string, string> = { presencial: '🏢 Presencial', videollamada: '💻 Videollamada', telefono: '📞 Teléfono' }

const enlaceCalendario = (e: any, empresa: string) => {
  const ini = new Date(e.fecha_hora), fin = new Date(ini.getTime() + 45 * 60000)
  const f = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
  const p = new URLSearchParams({ action: 'TEMPLATE', text: `Entrevista NetDriver: ${nombreConductor(e.conductor)}`, dates: `${f(ini)}/${f(fin)}`, details: `${empresa}${e.empleo?.titulo ? ' · ' + e.empleo.titulo : ''}${e.notas ? '\n' + e.notas : ''}`, location: e.lugar || '' })
  return `https://calendar.google.com/calendar/render?${p}`
}

export default function Entrevistas() {
  const router = useRouter()
  const { userId, perfil, avisar, recargarContadores } = useEmpresa()
  const [items, setItems] = useState<any[]>([])
  const [cargando, setCargando] = useState(true)
  const [tab, setTab] = useState('proximas')
  const [editar, setEditar] = useState<any>(null)
  const [menu, setMenu] = useState('')

  const cargar = useCallback(async () => {
    const { data } = await supabase.from('entrevistas').select(SELECT_ENTREVISTA).eq('empresa_id', userId).order('fecha_hora')
    setItems(data || []); setCargando(false)
  }, [userId])
  useEffect(() => { cargar() }, [cargar])

  const estado = async (e: any, nuevo: string) => {
    const { error } = await supabase.from('entrevistas').update({ estado: nuevo }).eq('id', e.id)
    if (error) return avisar('No se pudo actualizar', 'error')
    avisar({ realizada: 'Entrevista marcada como realizada', cancelada: 'Entrevista cancelada', programada: 'Entrevista reprogramada' }[nuevo] || 'Actualizada'); cargar(); recargarContadores()
  }

  const ahora = Date.now()
  const grupos: Record<string, any[]> = {
    proximas: items.filter(e => e.estado === 'programada' && new Date(e.fecha_hora).getTime() >= ahora - 3600000),
    pendientes: items.filter(e => e.estado === 'programada' && new Date(e.fecha_hora).getTime() < ahora - 3600000).reverse(),
    realizadas: items.filter(e => e.estado === 'realizada').reverse(),
    canceladas: items.filter(e => e.estado === 'cancelada').reverse(),
  }
  const lista = grupos[tab]

  return (
    <div>
      <PageHeader titulo="Entrevistas" sub="Agenda, reprograma y registra el resultado de tus entrevistas.">
        <Btn onClick={() => router.push(`${RUTA}/postulaciones`)}>+ Agendar desde postulaciones</Btn>
      </PageHeader>
      <Card padding="0" style={{ overflow: 'visible' }}>
        <div style={{ padding: '14px 20px 0' }}>
          <Tabs activo={tab} onChange={setTab} tabs={[
            { id: 'proximas', label: 'Próximas', n: grupos.proximas.length }, { id: 'pendientes', label: 'Por cerrar', n: grupos.pendientes.length },
            { id: 'realizadas', label: 'Realizadas', n: grupos.realizadas.length }, { id: 'canceladas', label: 'Canceladas', n: grupos.canceladas.length },
          ]} />
          {tab === 'pendientes' && grupos.pendientes.length > 0 && <div style={{ fontSize: '0.8rem', color: C.muted, marginBottom: '10px' }}>Estas entrevistas ya pasaron. Márcalas como realizadas o canceladas.</div>}
        </div>
        {cargando ? <Cargando /> : lista.length === 0
          ? <Vacio icono="🤝" titulo={tab === 'proximas' ? 'No tienes entrevistas próximas' : 'Nada por aquí'} texto={tab === 'proximas' ? 'Agenda una entrevista desde una postulación o desde el perfil de un conductor.' : undefined} accion={tab === 'proximas' ? 'Ver postulaciones' : undefined} onAccion={() => router.push(`${RUTA}/postulaciones`)} />
          : lista.map(e => {
            const c = e.conductor || {}
            const wa = enlaceWhatsApp(c.telefono, `Hola ${c.nombre || ''}, te recordamos tu entrevista con ${perfil.nombre_empresa || 'nuestra empresa'} el ${fechaHora(e.fecha_hora)}${e.lugar ? ' en ' + e.lugar : ''}. ¡Te esperamos!`)
            return (
              <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 20px', borderBottom: `1px solid ${C.bg}`, flexWrap: 'wrap' }}>
                <div style={{ minWidth: '130px', background: '#fef3e2', borderRadius: '10px', padding: '8px 12px', textAlign: 'center' }}>
                  <div style={{ fontWeight: 800, color: '#c2410c', fontSize: '0.9rem' }}>{fechaHora(e.fecha_hora)}</div>
                </div>
                <div onClick={() => router.push(`${RUTA}/conductores/${c.id}`)} style={{ display: 'flex', gap: '10px', alignItems: 'center', flex: 1, minWidth: '200px', cursor: 'pointer' }}>
                  <Avatar nombre={c.nombre} apellido={c.apellido} foto={c.foto_perfil_url} color={colorPara(c.id || '')} size={38} />
                  <div>
                    <div style={{ fontWeight: 700, color: C.navy, fontSize: '0.9rem' }}>{nombreConductor(c)}</div>
                    <div style={{ fontSize: '0.78rem', color: C.muted }}>{e.empleo?.titulo || 'Sin empleo asociado'}</div>
                  </div>
                </div>
                <div style={{ minWidth: '160px' }}>
                  <Badge color={C.navy} bg={C.bg}>{MODALIDAD[e.modalidad] || e.modalidad}</Badge>
                  {e.lugar && <div style={{ fontSize: '0.75rem', color: C.muted, marginTop: '4px', maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{/^https?:/.test(e.lugar) ? <a href={e.lugar} target="_blank" rel="noopener noreferrer" style={{ color: C.blue }}>Abrir enlace</a> : e.lugar}</div>}
                </div>
                <div style={{ display: 'flex', gap: '6px', position: 'relative' }}>
                  <IconBtn title={wa ? 'Enviar recordatorio por WhatsApp' : 'Sin teléfono registrado'} href={wa} onClick={() => avisar('Este conductor aún no registra un teléfono', 'error')}>💬</IconBtn>
                  <IconBtn title="Agregar a Google Calendar" href={enlaceCalendario(e, perfil.nombre_empresa || '')}>📅</IconBtn>
                  {e.estado === 'programada' && <IconBtn title="Reprogramar / editar" onClick={() => setEditar(e)}>✏️</IconBtn>}
                  <IconBtn title="Más acciones" onClick={() => setMenu(e.id)}>⋯</IconBtn>
                  <Menu abierto={menu === e.id} onCerrar={() => setMenu('')} opciones={[
                    { label: '👤 Ver perfil del conductor', onClick: () => router.push(`${RUTA}/conductores/${c.id}`) },
                    ...(e.estado !== 'realizada' ? [{ label: '✓ Marcar como realizada', onClick: () => estado(e, 'realizada') }] : []),
                    ...(e.estado !== 'cancelada' ? [{ label: '✕ Cancelar entrevista', onClick: () => estado(e, 'cancelada'), peligro: true }] : []),
                    ...(e.estado !== 'programada' ? [{ label: '↺ Volver a programada', onClick: () => estado(e, 'programada') }] : []),
                  ]} />
                </div>
              </div>
            )
          })}
      </Card>
      {editar && <ModalEntrevista abierto onCerrar={() => setEditar(null)} conductor={editar.conductor} entrevista={editar} onListo={cargar} />}
    </div>
  )
}
