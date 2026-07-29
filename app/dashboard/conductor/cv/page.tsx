'use client'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../../supabase'
import { useRouter } from 'next/navigation'

export default function CVPage() {
  const router = useRouter()
  const cvRef = useRef<HTMLDivElement>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [descargando, setDescargando] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push('/'); return }
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(data)
      setLoading(false)
    })
  }, [])

  const descargarPDF = async () => {
    if (!cvRef.current) return
    setDescargando(true)
    const html2canvas = (await import('html2canvas')).default
    const jsPDF = (await import('jspdf')).default
    const canvas = await html2canvas(cvRef.current, { scale: 2, useCORS: true, backgroundColor: '#ffffff' })
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
    pdf.save(`CV_NetDriver_${(profile?.nombre || '') + '_' + (profile?.apellido || '')}.pdf`)
    setDescargando(false)
  }

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#8fa3b8' }}>Cargando CV...</div>

  const nombreCompleto = `${profile?.nombre || ''} ${profile?.apellido || ''}`.trim() || 'Conductor Profesional'
  const iniciales = nombreCompleto.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
  const licencias = profile?.licencias || []
  const equipos = Object.entries(profile?.equipos_detalle || {}).filter(([k]) => !['Otros-Camion','Otros-Maquinaria','Otros-Izaje','Otros-Especiales'].includes(k))
  const areasExp = profile?.areas_experiencia || []
  const anosExp = profile?.anos_experiencia || ''

  return (
    <div style={{ background: '#f4f7fa', minHeight: '100vh', padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '794px', margin: '0 auto 20px' }}>
        <button onClick={() => router.push('/dashboard/conductor/completar-perfil')} style={{ background: '#fff', border: '1px solid #e8eef5', color: '#1a3a5c', padding: '10px 20px', borderRadius: '8px', fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer' }}>← Volver</button>
        <button onClick={descargarPDF} disabled={descargando} style={{ background: '#1a3a5c', border: 'none', color: 'white', padding: '10px 24px', borderRadius: '8px', fontSize: '0.88rem', fontWeight: 700, cursor: descargando ? 'wait' : 'pointer' }}>
          {descargando ? 'Generando PDF...' : 'Descargar CV PDF'}
        </button>
      </div>

      <div ref={cvRef} style={{ maxWidth: '794px', margin: '0 auto', background: '#fff', borderRadius: '4px', overflow: 'hidden', fontFamily: 'Arial, sans-serif', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>

        {/* Header */}
        <div style={{ background: '#1a3a5c', padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '18px', alignItems: 'center' }}>
            <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', fontWeight: 800, color: 'white', overflow: 'hidden', flexShrink: 0, border: '2px solid rgba(255,255,255,0.2)' }}>
              {profile?.foto_perfil_url ? <img src={profile.foto_perfil_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : iniciales}
            </div>
            <div>
              <h1 style={{ color: 'white', fontSize: '1.5rem', fontWeight: 800, margin: '0 0 2px' }}>{nombreCompleto}</h1>
              <div style={{ color: '#93c5fd', fontWeight: 600, fontSize: '0.88rem', marginBottom: '10px' }}>Conductor Profesional</div>
              <div style={{ display: 'flex', gap: '20px' }}>
                {[
                  { valor: anosExp || '—', label: 'de experiencia' },
                  { valor: `${equipos.length}`, label: 'equipos operados' },
                  { valor: licencias[0] || '—', label: 'Licencia principal' },
                ].map((b, i) => (
                  <div key={i}>
                    <div style={{ color: 'white', fontWeight: 700, fontSize: '0.85rem' }}>{b.valor}</div>
                    <div style={{ color: '#93c5fd', fontSize: '0.65rem' }}>{b.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div style={{ border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', padding: '8px 12px', textAlign: 'center' }}>
            <div style={{ color: '#93c5fd', fontSize: '0.62rem', marginBottom: '2px' }}>PERFIL VERIFICADO</div>
            <div style={{ color: 'white', fontWeight: 700, fontSize: '0.75rem' }}>NetDriver</div>
          </div>
        </div>

        {/* Cuerpo */}
        <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr' }}>

          {/* Columna izquierda */}
          <div style={{ background: '#f8fafc', padding: '20px 16px', borderRight: '1px solid #e8eef5' }}>

            <div style={{ marginBottom: '18px' }}>
              <div style={{ fontSize: '0.62rem', fontWeight: 700, color: '#1a3a5c', letterSpacing: '0.10em', marginBottom: '10px', borderBottom: '1px solid #e8eef5', paddingBottom: '4px' }}>INFORMACIÓN PERSONAL</div>
              {[
                { label: 'RUT', valor: profile?.rut || '—' },
                { label: 'Fecha de nacimiento', valor: profile?.fecha_nacimiento || '—' },
                { label: 'Nacionalidad', valor: 'Chileno' },
                { label: 'Dirección', valor: `${profile?.comuna || '—'}, ${profile?.region || '—'}` },
                { label: 'Teléfono', valor: profile?.telefono || '—' },
                { label: 'Email', valor: profile?.email || '—' },
              ].map((item, i) => (
                <div key={i} style={{ marginBottom: '8px' }}>
                  <div style={{ fontSize: '0.60rem', color: '#8fa3b8', marginBottom: '1px' }}>{item.label}</div>
                  <div style={{ fontSize: '0.70rem', color: '#1a3a5c', fontWeight: 600, wordBreak: 'break-word' }}>{item.valor}</div>
                </div>
              ))}
            </div>

            <div style={{ marginBottom: '18px' }}>
              <div style={{ fontSize: '0.62rem', fontWeight: 700, color: '#1a3a5c', letterSpacing: '0.10em', marginBottom: '10px', borderBottom: '1px solid #e8eef5', paddingBottom: '4px' }}>SOBRE MÍ</div>
              <p style={{ fontSize: '0.68rem', color: '#4b6080', lineHeight: 1.6, margin: 0 }}>
                Conductor profesional con {anosExp || 'amplia'} de experiencia en {areasExp.slice(0,2).join(' y ') || 'transporte'}. Responsable y comprometido con la seguridad vial y el cumplimiento de rutas.
              </p>
            </div>

            <div style={{ marginBottom: '18px' }}>
              <div style={{ fontSize: '0.62rem', fontWeight: 700, color: '#1a3a5c', letterSpacing: '0.10em', marginBottom: '10px', borderBottom: '1px solid #e8eef5', paddingBottom: '4px' }}>DISPONIBILIDAD</div>
              {(profile?.disponibilidad_trabajo || ['Inmediata']).map((d: string) => (
                <div key={d} style={{ fontSize: '0.70rem', color: '#1a3a5c', marginBottom: '3px' }}>• {d}</div>
              ))}
              {profile?.movilidad_propia === 'si' && <div style={{ fontSize: '0.68rem', color: '#8fa3b8', marginTop: '4px' }}>Movilidad propia disponible.</div>}
            </div>

            <div style={{ marginBottom: '18px' }}>
              <div style={{ fontSize: '0.62rem', fontWeight: 700, color: '#1a3a5c', letterSpacing: '0.10em', marginBottom: '10px', borderBottom: '1px solid #e8eef5', paddingBottom: '4px' }}>TURNOS CON EXPERIENCIA</div>
              {(profile?.turnos_experiencia || []).map((t: string) => (
                <div key={t} style={{ fontSize: '0.70rem', color: '#1a3a5c', marginBottom: '3px' }}>• {t}</div>
              ))}
            </div>

            <div>
              <div style={{ fontSize: '0.62rem', fontWeight: 700, color: '#1a3a5c', letterSpacing: '0.10em', marginBottom: '10px', borderBottom: '1px solid #e8eef5', paddingBottom: '4px' }}>DOCUMENTACIÓN</div>
              {['Hoja de vida', 'Cert. de antecedentes', 'Licencias', 'Cursos y certificados', 'Examen preocupacional', 'Cédula de identidad'].map(d => (
                <div key={d} style={{ fontSize: '0.68rem', color: '#4b6080', marginBottom: '3px' }}>✓ {d}</div>
              ))}
            </div>
          </div>

          {/* Columna derecha */}
          <div style={{ padding: '20px 24px' }}>

            {/* Licencias */}
            <div style={{ marginBottom: '18px' }}>
              <div style={{ fontSize: '0.62rem', fontWeight: 700, color: '#1a3a5c', letterSpacing: '0.10em', marginBottom: '10px', borderBottom: '1px solid #e8eef5', paddingBottom: '4px' }}>LICENCIAS</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                {(licencias.length > 0 ? licencias : ['—']).slice(0, 6).map((lic: string) => (
                  <div key={lic} style={{ border: '1px solid #e8eef5', borderRadius: '4px', padding: '8px 10px' }}>
                    <div style={{ fontWeight: 700, color: '#1a3a5c', fontSize: '0.78rem' }}>{lic}</div>
                    <div style={{ color: '#8fa3b8', fontSize: '0.62rem', marginBottom: '4px' }}>Profesional</div>
                    <div style={{ fontSize: '0.60rem', color: '#22c55e', fontWeight: 700 }}>Vigente</div>
                    {profile?.licencias_vencimientos?.[lic] && <div style={{ fontSize: '0.60rem', color: '#8fa3b8' }}>Venc: {profile.licencias_vencimientos[lic]}</div>}
                  </div>
                ))}
              </div>
            </div>

            {/* Experiencia laboral */}
            <div style={{ marginBottom: '18px' }}>
              <div style={{ fontSize: '0.62rem', fontWeight: 700, color: '#1a3a5c', letterSpacing: '0.10em', marginBottom: '10px', borderBottom: '1px solid #e8eef5', paddingBottom: '4px' }}>EXPERIENCIA LABORAL</div>
              <div style={{ padding: '10px 12px', border: '1px solid #e8eef5', borderRadius: '4px', marginBottom: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <div style={{ fontWeight: 700, color: '#1a3a5c', fontSize: '0.78rem' }}>Transportes del Norte SpA</div>
                  <div style={{ fontSize: '0.68rem', color: '#8fa3b8' }}>2019 – 2024</div>
                </div>
                <div style={{ color: '#4b6080', fontSize: '0.70rem', marginBottom: '4px' }}>Conductor de Camión Tolva</div>
                <div style={{ color: '#8fa3b8', fontSize: '0.65rem' }}>Transporte de áridos y materiales. Rutas nacionales, mantenciones básicas.</div>
              </div>
            </div>

            {/* Equipos operados */}
            {equipos.length > 0 && (
              <div style={{ marginBottom: '18px' }}>
                <div style={{ fontSize: '0.62rem', fontWeight: 700, color: '#1a3a5c', letterSpacing: '0.10em', marginBottom: '10px', borderBottom: '1px solid #e8eef5', paddingBottom: '4px' }}>EQUIPOS OPERADOS</div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.68rem' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc' }}>
                      {['Equipo', 'Años exp.', 'Nivel', 'Marca', 'Modelo'].map(h => (
                        <th key={h} style={{ padding: '5px 8px', textAlign: 'left', color: '#8fa3b8', fontWeight: 700, fontSize: '0.60rem', borderBottom: '1px solid #e8eef5' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {equipos.slice(0, 7).map(([nombre, det]: [string, any]) => (
                      <tr key={nombre} style={{ borderBottom: '1px solid #f4f7fa' }}>
                        <td style={{ padding: '5px 8px', color: '#1a3a5c', fontWeight: 600 }}>{nombre}</td>
                        <td style={{ padding: '5px 8px', color: '#4b6080' }}>{det.anos || '—'}</td>
                        <td style={{ padding: '5px 8px', color: '#4b6080' }}>{det.dominio || '—'}</td>
                        <td style={{ padding: '5px 8px', color: '#8fa3b8' }}>{det.marca || '—'}</td>
                        <td style={{ padding: '5px 8px', color: '#8fa3b8' }}>{det.modelo || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Cursos y examen */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <div style={{ fontSize: '0.62rem', fontWeight: 700, color: '#1a3a5c', letterSpacing: '0.10em', marginBottom: '10px', borderBottom: '1px solid #e8eef5', paddingBottom: '4px' }}>CURSOS Y CERTIFICACIONES</div>
                {['Manejo Defensivo', 'Carga Peligrosa (Clase 7)', 'Primeros Auxilios', 'Fatiga y Somnolencia', 'Trabajo en Altura', 'Prevención de Riesgos'].map((c, i) => (
                  <div key={c} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <div style={{ fontSize: '0.68rem', color: '#4b6080' }}>✓ {c}</div>
                    <div style={{ fontSize: '0.62rem', color: '#8fa3b8' }}>{2024 - i}</div>
                  </div>
                ))}
              </div>
              <div>
                <div style={{ fontSize: '0.62rem', fontWeight: 700, color: '#1a3a5c', letterSpacing: '0.10em', marginBottom: '10px', borderBottom: '1px solid #e8eef5', paddingBottom: '4px' }}>EXAMEN PREOCUPACIONAL</div>
                <div style={{ border: '1px solid #e8eef5', borderRadius: '4px', padding: '8px 10px', marginBottom: '12px' }}>
                  <div style={{ color: '#1a3a5c', fontWeight: 700, fontSize: '0.72rem', marginBottom: '2px' }}>Apto para el cargo</div>
                  <div style={{ color: '#8fa3b8', fontSize: '0.62rem' }}>Examen {profile?.estado_preocupacional === 'Vigente' ? 'vigente' : 'realizado'}.</div>
                </div>
                <div style={{ fontSize: '0.62rem', fontWeight: 700, color: '#1a3a5c', letterSpacing: '0.10em', marginBottom: '8px', borderBottom: '1px solid #e8eef5', paddingBottom: '4px' }}>REFERENCIAS</div>
                <div style={{ fontSize: '0.68rem', color: '#4b6080' }}>Disponibles a solicitud.</div>
                <div style={{ fontSize: '0.65rem', color: '#8fa3b8', marginTop: '2px' }}>Cartas de recomendación y certificados laborales.</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ background: '#1a3a5c', padding: '10px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#93c5fd', fontSize: '0.62rem' }}>Conductor profesional comprometido con la seguridad, puntualidad y excelencia en cada entrega.</span>
          <span style={{ color: 'white', fontWeight: 800, fontSize: '0.75rem' }}>NetDriver</span>
        </div>
      </div>
    </div>
  )
}
