'use client'
import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../supabase'
import { useEmpresa } from '../_lib/contexto'
import { cambiarEstadoPostulacion, SELECT_POSTULACION } from '../_lib/acciones'
import { colorPara, mensajeWhatsApp } from '../_lib/componentes'
import { enlaceWhatsApp, fecha, nombreConductor, RUTA } from '../_lib/datos'
import { Avatar, Btn, C, Card, Cargando, IconBtn, Metrica, PageHeader, Vacio } from '../_lib/ui'

export default function Contrataciones() {
  const router = useRouter()
  const { userId, perfil, avisar, recargarContadores } = useEmpresa()
  const [items, setItems] = useState<any[]>([])
  const [cargando, setCargando] = useState(true)

  const cargar = useCallback(async () => {
    const { data } = await supabase.from('postulaciones').select(SELECT_POSTULACION).eq('empresa_id', userId).eq('estado', 'contratado').order('fecha_contratacion', { ascending: false, nullsFirst: false })
    setItems(data || []); setCargando(false)
  }, [userId])
  useEffect(() => { cargar() }, [cargar])

  const deshacer = async (p: any) => {
    if (!window.confirm(`¿Quitar a ${nombreConductor(p.conductor)} de contratados? Volverá a "Preseleccionada".`)) return
    const { error } = await cambiarEstadoPostulacion(p.id, 'preseleccionada')
    if (error) return avisar('No se pudo actualizar', 'error')
    avisar('Contratación revertida'); cargar(); recargarContadores()
  }

  const exportar = () => {
    const filas = [['Conductor', 'Teléfono', 'Correo', 'Licencias', 'Empleo', 'Fecha contratación'],
      ...items.map(p => [nombreConductor(p.conductor), p.conductor?.telefono || '', p.conductor?.email || '', (p.conductor?.licencias || []).join(' '), p.empleo?.titulo || '', fecha(p.fecha_contratacion || p.updated_at)])]
    const csv = '﻿' + filas.map(f => f.map(v => `"${String(v).replace(/"/g, '""')}"`).join(';')).join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    a.download = `contrataciones-netdriver-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
  }

  const inicioMes = new Date(); inicioMes.setDate(1); inicioMes.setHours(0, 0, 0, 0)
  const delMes = items.filter(p => new Date(p.fecha_contratacion || p.updated_at) >= inicioMes).length
  const inicioAno = new Date(new Date().getFullYear(), 0, 1)
  const delAno = items.filter(p => new Date(p.fecha_contratacion || p.updated_at) >= inicioAno).length

  return (
    <div>
      <PageHeader titulo="Contrataciones" sub="Conductores que contrataste a través de NetDriver.">
        {items.length > 0 && <Btn variante="secundario" onClick={exportar}>⬇️ Descargar Excel (CSV)</Btn>}
      </PageHeader>
      <div className="nd-grid-4" style={{ marginBottom: '20px' }}>
        <Metrica icono="✅" label="Este mes" valor={delMes} color={C.purple} bg="#f3e8fd" />
        <Metrica icono="📅" label="Este año" valor={delAno} color={C.blue} bg="#e8f0fe" />
        <Metrica icono="🏆" label="Total histórico" valor={items.length} color={C.green} bg="#e8f5e9" />
        <Metrica icono="⚡" label="Por pega relámpago" valor={items.filter(p => p.empleo?.es_relampago).length} color={C.orange} bg="#fef3e2" />
      </div>
      <Card padding="0" style={{ overflow: 'hidden' }}>
        {cargando ? <Cargando /> : items.length === 0
          ? <Vacio icono="✅" titulo="Aún no registras contrataciones" texto='Cuando elijas a un conductor, ábrelo desde Postulaciones y márcalo como "Contratado".' accion="Ir a postulaciones" onAccion={() => router.push(`${RUTA}/postulaciones`)} />
          : items.map(p => {
            const c = p.conductor || {}
            const wa = enlaceWhatsApp(c.telefono, mensajeWhatsApp(perfil.nombre_empresa || 'nuestra empresa', c))
            return (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 20px', borderBottom: `1px solid ${C.bg}`, flexWrap: 'wrap' }}>
                <div onClick={() => router.push(`${RUTA}/conductores/${c.id}?postulacion=${p.id}`)} style={{ display: 'flex', gap: '12px', alignItems: 'center', flex: 1, minWidth: '220px', cursor: 'pointer' }}>
                  <Avatar nombre={c.nombre} apellido={c.apellido} foto={c.foto_perfil_url} color={colorPara(c.id || '')} />
                  <div>
                    <div style={{ fontWeight: 700, color: C.navy }}>{nombreConductor(c)}</div>
                    <div style={{ fontSize: '0.8rem', color: C.muted }}>{p.empleo?.es_relampago ? '⚡ ' : '💼 '}{p.empleo?.titulo}</div>
                  </div>
                </div>
                <div style={{ fontSize: '0.82rem', color: C.muted, minWidth: '140px' }}>Contratado el {fecha(p.fecha_contratacion || p.updated_at)}</div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <IconBtn title="Ver perfil" onClick={() => router.push(`${RUTA}/conductores/${c.id}?postulacion=${p.id}`)}>👁</IconBtn>
                  <IconBtn title={wa ? 'Escribir por WhatsApp' : 'Sin teléfono registrado'} href={wa} onClick={() => avisar('Este conductor aún no registra un teléfono', 'error')}>💬</IconBtn>
                  <IconBtn title="Deshacer contratación" onClick={() => deshacer(p)}>↺</IconBtn>
                </div>
              </div>
            )
          })}
      </Card>
    </div>
  )
}
