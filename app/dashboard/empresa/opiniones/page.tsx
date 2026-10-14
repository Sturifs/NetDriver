'use client'
import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../supabase'
import { useEmpresa } from '../_lib/contexto'
import { colorPara } from '../_lib/componentes'
import { haceCuanto, nombreConductor, RUTA } from '../_lib/datos'
import { Avatar, C, Card, Cargando, Estrellas, PageHeader, Tabs, Vacio } from '../_lib/ui'

export default function Opiniones() {
  const router = useRouter()
  const { userId } = useEmpresa()
  const [items, setItems] = useState<any[]>([])
  const [cargando, setCargando] = useState(true)
  const [filtro, setFiltro] = useState('todas')

  const cargar = useCallback(async () => {
    const { data } = await supabase.from('opiniones_empresa').select('*, conductor:profiles!opiniones_conductor_id_fkey(id, nombre, apellido, foto_perfil_url)').eq('empresa_id', userId).order('created_at', { ascending: false })
    setItems(data || []); setCargando(false)
  }, [userId])
  useEffect(() => { cargar() }, [cargar])

  const promedio = items.length ? items.reduce((a, o) => a + o.puntaje, 0) / items.length : 0
  const lista = items.filter(o => filtro === 'todas' || String(o.puntaje) === filtro)

  return (
    <div>
      <PageHeader titulo="Opiniones y calificaciones" sub="Lo que dicen de tu empresa los conductores que contrataste." />
      {cargando ? <Cargando /> : items.length === 0
        ? <Card><Vacio icono="⭐" titulo="Aún no tienes opiniones" texto="Solo los conductores que marcaste como contratados pueden calificar a tu empresa. Así las opiniones son siempre reales." accion="Ver contrataciones" onAccion={() => router.push(`${RUTA}/contrataciones`)} /></Card>
        : (
          <div className="nd-cols">
            <div className="nd-aside">
              <Card style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', fontWeight: 800, color: C.navy }}>{promedio.toFixed(1)}</div>
                <Estrellas valor={promedio} size="1.4rem" />
                <div style={{ fontSize: '0.85rem', color: C.muted, margin: '6px 0 16px' }}>{items.length} opinion{items.length > 1 ? 'es' : ''}</div>
                {[5, 4, 3, 2, 1].map(n => {
                  const c = items.filter(o => o.puntaje === n).length
                  return (
                    <div key={n} onClick={() => setFiltro(filtro === String(n) ? 'todas' : String(n))} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', cursor: 'pointer' }}>
                      <span style={{ fontSize: '0.8rem', color: C.navy, width: '20px' }}>{n}★</span>
                      <div style={{ flex: 1, height: '8px', background: C.bg, borderRadius: '4px' }}><div style={{ width: `${(c / items.length) * 100}%`, height: '8px', background: '#f39c12', borderRadius: '4px' }} /></div>
                      <span style={{ fontSize: '0.8rem', color: C.muted, width: '20px' }}>{c}</span>
                    </div>
                  )
                })}
              </Card>
            </div>
            <div style={{ flex: 1, minWidth: 0, width: '100%' }}>
              <Tabs activo={filtro} onChange={setFiltro} tabs={[{ id: 'todas', label: 'Todas', n: items.length }, ...[5, 4, 3, 2, 1].map(n => ({ id: String(n), label: `${n} ★`, n: items.filter(o => o.puntaje === n).length }))]} />
              {lista.length === 0 ? <Card><Vacio icono="⭐" titulo="No hay opiniones con este puntaje" /></Card> : lista.map(o => (
                <Card key={o.id} style={{ marginBottom: '12px' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '8px' }}>
                    <div onClick={() => router.push(`${RUTA}/conductores/${o.conductor_id}`)} style={{ cursor: 'pointer' }}><Avatar nombre={o.conductor?.nombre} apellido={o.conductor?.apellido} foto={o.conductor?.foto_perfil_url} color={colorPara(o.conductor_id)} size={38} /></div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, color: C.navy, fontSize: '0.9rem' }}>{nombreConductor(o.conductor)}</div>
                      <Estrellas valor={o.puntaje} size="0.85rem" />
                    </div>
                    <span style={{ fontSize: '0.78rem', color: C.muted }}>{haceCuanto(o.created_at)}</span>
                  </div>
                  <p style={{ fontSize: '0.88rem', color: C.navy, lineHeight: 1.6, margin: 0 }}>{o.comentario || <span style={{ color: C.muted }}>Sin comentario.</span>}</p>
                </Card>
              ))}
            </div>
          </div>
        )}
    </div>
  )
}
