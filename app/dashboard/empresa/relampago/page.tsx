'use client'
import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../supabase'
import { useEmpresa } from '../_lib/contexto'
import { conteoPostulaciones, TablaEmpleos } from '../_lib/componentes'
import { RUTA } from '../_lib/datos'
import { Btn, C, Card, Cargando, PageHeader, Tabs, Vacio } from '../_lib/ui'

export default function PegaRelampago() {
  const router = useRouter()
  const { userId } = useEmpresa()
  const [empleos, setEmpleos] = useState<any[]>([])
  const [conteos, setConteos] = useState<Record<string, number>>({})
  const [cargando, setCargando] = useState(true)
  const [tab, setTab] = useState('activo')

  const cargar = useCallback(async () => {
    const [{ data }, c] = await Promise.all([
      supabase.from('empleos').select('*').eq('empresa_id', userId).eq('es_relampago', true).order('created_at', { ascending: false }),
      conteoPostulaciones(userId),
    ])
    setEmpleos(data || []); setConteos(c); setCargando(false)
  }, [userId])
  useEffect(() => { cargar() }, [cargar])

  const lista = empleos.filter(e => tab === 'todos' || e.estado === tab)

  return (
    <div>
      <PageHeader titulo="⚡ Pega Relámpago" sub="Trabajos urgentes de pocos días: reemplazos, peaks de carga o faenas cortas.">
        <Btn onClick={() => router.push(`${RUTA}/publicar?relampago=1`)}>⚡ Publicar pega relámpago</Btn>
      </PageHeader>

      <div className="nd-grid-4" style={{ marginBottom: '20px' }}>
        {[
          ['1', 'Publica en 1 minuto', 'Fecha, días, pago por día y licencia.'],
          ['2', 'Se destaca', 'Aparece marcada como urgente para los conductores.'],
          ['3', 'Recibe postulantes', 'Revisa perfiles y escribe por WhatsApp.'],
          ['4', 'Contrata', 'Marca al conductor como contratado.'],
        ].map(([n, t, s]) => (
          <Card key={n}>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#fff8e1', color: '#c2410c', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>{n}</div>
            <div style={{ fontWeight: 700, color: C.navy, fontSize: '0.9rem' }}>{t}</div>
            <div style={{ fontSize: '0.8rem', color: C.muted }}>{s}</div>
          </Card>
        ))}
      </div>

      <Card padding="0" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px 0' }}>
          <Tabs activo={tab} onChange={setTab} tabs={[
            { id: 'activo', label: 'Activas', n: empleos.filter(e => e.estado === 'activo').length },
            { id: 'pausado', label: 'Pausadas', n: empleos.filter(e => e.estado === 'pausado').length },
            { id: 'cerrado', label: 'Cerradas', n: empleos.filter(e => e.estado === 'cerrado').length },
            { id: 'todos', label: 'Todas', n: empleos.length },
          ]} />
        </div>
        {cargando ? <Cargando /> : lista.length
          ? <TablaEmpleos empleos={lista} conteos={conteos} onCambio={cargar} />
          : <Vacio icono="⚡" titulo={empleos.length ? 'No hay pegas en esta vista' : '¿Necesitas un conductor para mañana?'} texto={empleos.length ? undefined : 'Publica una pega relámpago y llega a conductores disponibles de inmediato.'} accion={empleos.length ? undefined : 'Publicar ahora'} onAccion={() => router.push(`${RUTA}/publicar?relampago=1`)} />}
      </Card>
    </div>
  )
}
