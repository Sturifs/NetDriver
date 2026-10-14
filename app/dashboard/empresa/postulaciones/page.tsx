'use client'
import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../../../supabase'
import { useEmpresa } from '../_lib/contexto'
import { SELECT_POSTULACION, useGuardados } from '../_lib/acciones'
import { FilaPostulacion, ModalEntrevista } from '../_lib/componentes'
import { ESTADOS_POSTULACION, nombreConductor } from '../_lib/datos'
import { Card, Cargando, inputStyle, PageHeader, Tabs, Vacio } from '../_lib/ui'

export default function Postulaciones() {
  const { userId } = useEmpresa()
  const { guardados, alternarGuardado } = useGuardados(userId)
  const [postulaciones, setPostulaciones] = useState<any[]>([])
  const [empleos, setEmpleos] = useState<any[]>([])
  const [cargando, setCargando] = useState(true)
  const [tab, setTab] = useState('todas')
  const [empleoId, setEmpleoId] = useState('')
  const [texto, setTexto] = useState('')
  const [modal, setModal] = useState<any>(null)

  useEffect(() => {
    const q = new URLSearchParams(window.location.search)
    if (q.get('estado')) setTab(q.get('estado')!)
    if (q.get('empleo')) setEmpleoId(q.get('empleo')!)
  }, [])

  const cargar = useCallback(async () => {
    const [p, e] = await Promise.all([
      supabase.from('postulaciones').select(SELECT_POSTULACION).eq('empresa_id', userId).order('created_at', { ascending: false }),
      supabase.from('empleos').select('id, titulo').eq('empresa_id', userId).order('created_at', { ascending: false }),
    ])
    setPostulaciones(p.data || []); setEmpleos(e.data || []); setCargando(false)
  }, [userId])
  useEffect(() => { cargar() }, [cargar])

  const base = postulaciones
    .filter(p => !empleoId || p.empleo_id === empleoId)
    .filter(p => !texto || `${nombreConductor(p.conductor)} ${p.conductor?.comuna || ''} ${(p.conductor?.licencias || []).join(' ')}`.toLowerCase().includes(texto.toLowerCase()))
  const lista = base.filter(p => tab === 'todas' || p.estado === tab)

  return (
    <div>
      <PageHeader titulo="Postulaciones" sub="Revisa a los conductores que postularon, avanza su proceso y contáctalos por WhatsApp." />
      <Card padding="0" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px 0', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <input value={texto} onChange={e => setTexto(e.target.value)} placeholder="Buscar por nombre, comuna o licencia..." style={{ ...inputStyle, maxWidth: '320px' }} />
          <select value={empleoId} onChange={e => setEmpleoId(e.target.value)} style={{ ...inputStyle, maxWidth: '300px' }}>
            <option value="">Todos los empleos</option>
            {empleos.map(e => <option key={e.id} value={e.id}>{e.titulo}</option>)}
          </select>
        </div>
        <div style={{ padding: '12px 20px 0' }}>
          <Tabs activo={tab} onChange={setTab} tabs={[{ id: 'todas', label: 'Todas', n: base.length }, ...ESTADOS_POSTULACION.map(e => ({ id: e.id, label: e.label, n: base.filter(p => p.estado === e.id).length }))]} />
        </div>
        {cargando ? <Cargando /> : lista.length
          ? lista.map(p => <FilaPostulacion key={p.id} p={p} guardado={guardados.has(p.conductor_id)} onGuardar={() => alternarGuardado(p.conductor_id)} onCambio={cargar} onEntrevista={() => setModal(p)} />)
          : <Vacio icono="📋" titulo={postulaciones.length ? 'No hay postulaciones con estos filtros' : 'Todavía no recibes postulaciones'} texto={postulaciones.length ? 'Prueba con otra pestaña o quita los filtros.' : 'Cuando un conductor postule a uno de tus empleos, aparecerá aquí.'} />}
      </Card>
      {modal && <ModalEntrevista abierto onCerrar={() => setModal(null)} conductor={modal.conductor} postulacion={modal} onListo={cargar} />}
    </div>
  )
}
