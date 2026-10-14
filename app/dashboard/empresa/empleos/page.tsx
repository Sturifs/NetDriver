'use client'
import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../supabase'
import { useEmpresa } from '../_lib/contexto'
import { conteoPostulaciones, TablaEmpleos } from '../_lib/componentes'
import { RUTA } from '../_lib/datos'
import { Btn, Card, Cargando, inputStyle, PageHeader, Tabs, Vacio } from '../_lib/ui'

export default function MisEmpleos() {
  const router = useRouter()
  const { userId } = useEmpresa()
  const [empleos, setEmpleos] = useState<any[]>([])
  const [conteos, setConteos] = useState<Record<string, number>>({})
  const [cargando, setCargando] = useState(true)
  const [tab, setTab] = useState('activo')
  const [texto, setTexto] = useState('')

  useEffect(() => { const e = new URLSearchParams(window.location.search).get('estado'); if (e) setTab(e) }, [])

  const cargar = useCallback(async () => {
    const [{ data }, c] = await Promise.all([
      supabase.from('empleos').select('*').eq('empresa_id', userId).order('created_at', { ascending: false }),
      conteoPostulaciones(userId),
    ])
    setEmpleos(data || []); setConteos(c); setCargando(false)
  }, [userId])
  useEffect(() => { cargar() }, [cargar])

  const n = (estado: string) => empleos.filter(e => estado === 'todos' || e.estado === estado).length
  const lista = empleos
    .filter(e => tab === 'todos' || e.estado === tab)
    .filter(e => !texto || `${e.titulo} ${e.comuna} ${e.region} ${e.tipo_trabajo}`.toLowerCase().includes(texto.toLowerCase()))

  return (
    <div>
      <PageHeader titulo="Mis empleos" sub="Administra tus avisos: edítalos, páusalos, ciérralos o revisa sus postulantes.">
        <Btn variante="secundario" onClick={() => router.push(`${RUTA}/publicar?relampago=1`)}>⚡ Pega Relámpago</Btn>
        <Btn onClick={() => router.push(`${RUTA}/publicar`)}>+ Publicar empleo</Btn>
      </PageHeader>
      <Card padding="0" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px 0' }}>
          <input value={texto} onChange={e => setTexto(e.target.value)} placeholder="Filtrar por cargo, comuna o tipo de trabajo..." style={{ ...inputStyle, maxWidth: '380px', marginBottom: '12px' }} />
          <Tabs activo={tab} onChange={setTab} tabs={[
            { id: 'activo', label: 'Activos', n: n('activo') }, { id: 'pausado', label: 'Pausados / borradores', n: n('pausado') },
            { id: 'cerrado', label: 'Cerrados', n: n('cerrado') }, { id: 'todos', label: 'Todos', n: n('todos') },
          ]} />
        </div>
        {cargando ? <Cargando /> : lista.length
          ? <TablaEmpleos empleos={lista} conteos={conteos} onCambio={cargar} />
          : <Vacio icono="💼" titulo={empleos.length ? 'No hay empleos en esta vista' : 'Aún no publicas empleos'} texto={empleos.length ? 'Prueba con otra pestaña o filtro.' : 'Tu primer aviso tarda menos de 3 minutos.'} accion={empleos.length ? undefined : 'Publicar mi primer empleo'} onAccion={() => router.push(`${RUTA}/publicar`)} />}
      </Card>
    </div>
  )
}
