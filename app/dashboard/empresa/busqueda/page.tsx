'use client'
import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../supabase'
import { useEmpresa } from '../_lib/contexto'
import { useGuardados } from '../_lib/acciones'
import { colorPara, mensajeWhatsApp } from '../_lib/componentes'
import { AREAS_CONDUCTOR, CAMPOS_CONDUCTOR, DISPONIBILIDAD, enlaceWhatsApp, EXPERIENCIA, LICENCIAS, nombreConductor, regiones, RUTA } from '../_lib/datos'
import { Avatar, Btn, C, Campo, Card, Cargando, Chips, IconBtn, inputStyle, PageHeader, Vacio } from '../_lib/ui'

const FILTROS = { q: '', licencia: '', region: '', experiencia: '', area: '', disponibilidad: '', soloCompletos: false }

export default function BusquedaConductores() {
  const router = useRouter()
  const { userId, perfil, avisar } = useEmpresa()
  const { guardados, alternarGuardado } = useGuardados(userId)
  const [f, setF] = useState(FILTROS)
  const [listo, setListo] = useState(false)
  const [resultados, setResultados] = useState<any[]>([])
  const [cargando, setCargando] = useState(true)

  // Filtros iniciales desde la URL (?q=, ?licencia=, ?region=)
  useEffect(() => {
    const p = new URLSearchParams(window.location.search)
    let q = p.get('q') || ''
    let licencia = p.get('licencia') || ''
    const lic = LICENCIAS.find(l => new RegExp(`\\b${l}\\b`, 'i').test(q))
    if (lic && !licencia) { licencia = lic; q = q.replace(new RegExp(`\\b(licencia\\s*)?${lic}\\b`, 'i'), '').trim() }
    setF(x => ({ ...x, q, licencia, region: p.get('region') || '' }))
    setListo(true)
    const alBuscar = (e: Event) => setF(x => ({ ...x, q: (e as CustomEvent).detail || '' }))
    window.addEventListener('nd-buscar', alBuscar)
    return () => window.removeEventListener('nd-buscar', alBuscar)
  }, [])

  const buscar = useCallback(async () => {
    setCargando(true)
    let consulta = supabase.from('profiles').select(CAMPOS_CONDUCTOR).eq('tipo', 'conductor')
    const q = f.q.replace(/[,()%*]/g, ' ').trim()
    if (q) consulta = consulta.or(`nombre.ilike.%${q}%,apellido.ilike.%${q}%,comuna.ilike.%${q}%`)
    if (f.licencia) consulta = consulta.contains('licencias', [f.licencia])
    if (f.region) consulta = consulta.eq('region', f.region)
    if (f.experiencia) consulta = consulta.in('anos_experiencia', EXPERIENCIA.slice(EXPERIENCIA.indexOf(f.experiencia)))
    if (f.area) consulta = consulta.contains('areas_experiencia', [f.area])
    if (f.disponibilidad) consulta = consulta.contains('disponibilidad_trabajo', [f.disponibilidad])
    if (f.soloCompletos) consulta = consulta.eq('perfil_completo', true)
    const { data, error } = await consulta.order('perfil_completo', { ascending: false, nullsFirst: false }).limit(60)
    if (error) avisar('Error al buscar: ' + error.message, 'error')
    setResultados(data || [])
    setCargando(false)
  }, [f, avisar])

  useEffect(() => { if (!listo) return; const t = setTimeout(buscar, 300); return () => clearTimeout(t) }, [buscar, listo])

  const set = (k: string, v: any) => setF(x => ({ ...x, [k]: v }))
  const hayFiltros = JSON.stringify(f) !== JSON.stringify(FILTROS)

  return (
    <div>
      <PageHeader titulo="Búsqueda de conductores" sub="Encuentra conductores registrados en NetDriver por licencia, zona y experiencia." />
      <div className="nd-cols">
        <div className="nd-aside" style={{ order: 0 }}>
          <Card>
            <Campo label="Nombre o comuna"><input value={f.q} onChange={e => set('q', e.target.value)} placeholder="Ej: Calama, Juan..." style={inputStyle} /></Campo>
            <Campo label="Licencia"><Chips opciones={LICENCIAS} valor={f.licencia} onChange={v => set('licencia', v)} /></Campo>
            <Campo label="Región">
              <select value={f.region} onChange={e => set('region', e.target.value)} style={inputStyle}>
                <option value="">Todas las regiones</option>{regiones.map(r => <option key={r}>{r}</option>)}
              </select>
            </Campo>
            <Campo label="Experiencia mínima">
              <select value={f.experiencia} onChange={e => set('experiencia', e.target.value)} style={inputStyle}>
                <option value="">Cualquiera</option>{EXPERIENCIA.map(x => <option key={x}>{x}</option>)}
              </select>
            </Campo>
            <Campo label="Área de experiencia">
              <select value={f.area} onChange={e => set('area', e.target.value)} style={inputStyle}>
                <option value="">Todas</option>{AREAS_CONDUCTOR.map(x => <option key={x}>{x}</option>)}
              </select>
            </Campo>
            <Campo label="Disponibilidad">
              <select value={f.disponibilidad} onChange={e => set('disponibilidad', e.target.value)} style={inputStyle}>
                <option value="">Cualquiera</option>{DISPONIBILIDAD.map(x => <option key={x}>{x}</option>)}
              </select>
            </Campo>
            <label style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '0.85rem', color: C.navy, marginBottom: '14px', cursor: 'pointer' }}>
              <input type="checkbox" checked={f.soloCompletos} onChange={e => set('soloCompletos', e.target.checked)} /> Solo perfiles completos
            </label>
            {hayFiltros && <Btn variante="secundario" onClick={() => setF(FILTROS)} style={{ width: '100%', justifyContent: 'center' }}>Limpiar filtros</Btn>}
          </Card>
        </div>

        <div style={{ flex: 1, minWidth: 0, width: '100%' }}>
          <div style={{ fontSize: '0.85rem', color: C.muted, marginBottom: '12px' }}>{cargando ? 'Buscando...' : `${resultados.length}${resultados.length === 60 ? '+' : ''} conductor${resultados.length === 1 ? '' : 'es'} encontrado${resultados.length === 1 ? '' : 's'}`}</div>
          {cargando ? <Cargando texto="Buscando conductores..." /> : resultados.length === 0
            ? <Card><Vacio icono="🔍" titulo="No encontramos conductores con estos filtros" texto="Prueba quitando algún filtro o ampliando la región." /></Card>
            : (
              <div className="nd-grid-2">
                {resultados.map(c => {
                  const wa = enlaceWhatsApp(c.telefono, mensajeWhatsApp(perfil.nombre_empresa || 'nuestra empresa', c))
                  const ver = () => router.push(`${RUTA}/conductores/${c.id}`)
                  return (
                    <Card key={c.id}>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', cursor: 'pointer' }} onClick={ver}>
                        <Avatar nombre={c.nombre} apellido={c.apellido} foto={c.foto_perfil_url} color={colorPara(c.id)} size={52} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 700, color: C.navy }}>{nombreConductor(c)} {c.perfil_completo && <span style={{ color: C.blue }} title="Perfil completo">✓</span>}</div>
                          <div style={{ fontSize: '0.8rem', color: C.muted }}>📍 {[c.comuna, c.region].filter(Boolean).join(', ') || 'Sin ubicación'}</div>
                          <div style={{ fontSize: '0.8rem', color: C.muted }}>{c.anos_experiencia ? `🎖 ${c.anos_experiencia}` : 'Experiencia no indicada'}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', margin: '12px 0' }}>
                        {(c.licencias || []).map((l: string) => <span key={l} style={{ background: '#e8f0fe', color: C.blue, fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: '6px' }}>{l}</span>)}
                        {(c.disponibilidad_trabajo || []).includes('Inmediata') && <span style={{ background: '#e8f5e9', color: '#1b5e20', fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: '6px' }}>Disponible ya</span>}
                      </div>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <Btn onClick={ver} style={{ flex: 1, justifyContent: 'center', padding: '7px' }}>Ver perfil</Btn>
                        <IconBtn title={wa ? 'Escribir por WhatsApp' : 'Sin teléfono registrado'} href={wa} onClick={() => avisar('Este conductor aún no registra un teléfono', 'error')}>💬</IconBtn>
                        <IconBtn title={guardados.has(c.id) ? 'Quitar de guardados' : 'Guardar conductor'} onClick={async () => { const r = await alternarGuardado(c.id); if (r != null) avisar(r ? 'Conductor guardado' : 'Conductor quitado de guardados') }}>{guardados.has(c.id) ? '⭐' : '☆'}</IconBtn>
                      </div>
                    </Card>
                  )
                })}
              </div>
            )}
        </div>
      </div>
    </div>
  )
}
