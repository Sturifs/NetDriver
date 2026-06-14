'use client'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { supabase } from '../../../supabase'
import { regiones, regionesComunas } from './regiones'

export default function CompletarPerfil() {
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [pasoActivo, setPasoActivo] = useState(1)
  const [regionSel, setRegionSel] = useState('')
  const [comunaSel, setComunaSel] = useState('')
  const [dispFueraRegion, setDispFueraRegion] = useState('')
  const [nombreCompleto, setNombreCompleto] = useState('')
  const [rut, setRut] = useState('')
  const [fechaNacimiento, setFechaNacimiento] = useState('')
  const [telefono, setTelefono] = useState('')
  const [emailContacto, setEmailContacto] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [licenciasSel, setLicenciasSel] = useState<string[]>([])
  const [fechaVencimientoLicencia, setFechaVencimientoLicencia] = useState('')
  const [archivoLicencia, setArchivoLicencia] = useState<File | null>(null)
  const [fechasVencimiento, setFechasVencimiento] = useState<Record<string, string>>({})
  const [archivosLicencia, setArchivosLicencia] = useState<Record<string, File | null>>({})

  const licenciasDisponibles = [
    { id: 'A1', nombre: 'Clase A1', desc: 'Motocicletas' },
    { id: 'A2', nombre: 'Clase A2', desc: 'Vehículos particulares' },
    { id: 'A3', nombre: 'Clase A3', desc: 'Transporte de pasajeros' },
    { id: 'A4', nombre: 'Clase A4', desc: 'Transporte de carga' },
    { id: 'A5', nombre: 'Clase A5', desc: 'Transporte de carga pesada' },
    { id: 'D', nombre: 'Clase D', desc: 'Transporte de pasajeros' },
    { id: 'E', nombre: 'Clase E', desc: 'Vehículos articulados o con remolque' },
    { id: 'F', nombre: 'Clase F', desc: 'Vehículos especiales o maquinaria' },
  ]

  const toggleLicencia = (id: string) => {
    setLicenciasSel(prev => prev.includes(id) ? prev.filter(l => l !== id) : [...prev, id])
  }

  const licenciaPrincipal = licenciasSel.filter(l => l !== 'otros')[licenciasSel.filter(l => l !== 'otros').length - 1] || ''

  const handleGuardarPaso2 = async (salir: boolean, avanzar?: number) => {
    setGuardando(true)
    setMensaje('')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setGuardando(false); return }

    const documentosUrls: Record<string, string> = {}
    for (const [licId, archivo] of Object.entries(archivosLicencia)) {
      if (archivo) {
        const ext = archivo.name.split('.').pop()
        const path = `${user.id}/licencia_${licId}.${ext}`
        const { error: uploadError } = await supabase.storage.from('documentos').upload(path, archivo, { upsert: true })
        if (!uploadError) {
          const { data: urlData } = supabase.storage.from('documentos').getPublicUrl(path)
          documentosUrls[licId] = urlData.publicUrl
        }
      }
    }

    const { error } = await supabase.from('profiles').update({
      licencias: licenciasSel,
      licencias_vencimientos: fechasVencimiento,
      ...(Object.keys(documentosUrls).length ? { licencias_documentos: documentosUrls } : {}),
    }).eq('id', user.id)

    if (error) {
      setMensaje('Error al guardar: ' + error.message)
    } else {
      setMensaje('✅ Progreso guardado')
      if (salir) router.push('/dashboard/conductor')
      else if (avanzar) setPasoActivo(avanzar)
    }
    setGuardando(false)
  }

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push('/'); return }
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(data)
      if (data) {
        setNombreCompleto(`${data.nombre || ''} ${data.apellido || ''}`.trim())
        setRut(data.rut || '')
        setFechaNacimiento(data.fecha_nacimiento || '')
        setTelefono(data.telefono || '')
        setEmailContacto(data.email || '')
        setRegionSel(data.region || '')
        setComunaSel(data.comuna || '')
        setDispFueraRegion(data.disponibilidad_fuera_region || '')
        setLicenciasSel(data.licencias || [])
        setFechasVencimiento(data.licencias_vencimientos || {})
      }
    })
  }, [])

  const handleGuardar = async (salir: boolean, avanzar?: number) => {
    setGuardando(true)
    setMensaje('')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setGuardando(false); return }

    const partesNombre = nombreCompleto.trim().split(' ')
    const nombre = partesNombre[0] || ''
    const apellido = partesNombre.slice(1).join(' ') || ''

    const { error } = await supabase.from('profiles').update({
      nombre, apellido,
      rut,
      fecha_nacimiento: fechaNacimiento || null,
      telefono,
      email: emailContacto,
      region: regionSel,
      comuna: comunaSel,
      disponibilidad_fuera_region: dispFueraRegion,
    }).eq('id', user.id)

    if (error) {
      setMensaje('Error al guardar: ' + error.message)
    } else {
      setMensaje('✅ Progreso guardado')
      if (salir) router.push('/dashboard/conductor')
      else if (avanzar) setPasoActivo(avanzar)
    }
    setGuardando(false)
  }

  const pasos = [
    { num: 1, label: 'Información\nPersonal' },
    { num: 2, label: 'Licencias' },
    { num: 3, label: 'Experiencia' },
    { num: 4, label: 'Equipos' },
    { num: 5, label: 'Documentación' },
    { num: 6, label: 'Foto y CV' },
  ]

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f4f7fa', fontFamily: "'Barlow', sans-serif" }}>
      {/* SIDEBAR */}
      <div style={{ width: '220px', minWidth: '220px', background: '#020D24', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, height: '100vh', overflowY: 'auto', zIndex: 50 }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: '10px', background: '#020D24' }}>
          <img src="/NetDriver_Logo.png" alt="NetDriver" onClick={() => router.push('/')} style={{ height: '68px', width: '220px', objectFit: 'contain', cursor: 'pointer' }} />
        </div>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '12px' }}>
            <div style={{ position: 'relative', width: '72px', height: '72px' }}>
              <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'white', fontSize: '1.4rem', border: '3px solid #2563eb' }}>
                {profile?.nombre?.[0]}{profile?.apellido?.[0]}
              </div>
            </div>
          </div>
          <div style={{ marginBottom: '8px' }}>
            <div style={{ fontWeight: 700, color: 'white', fontSize: '0.95rem' }}>{profile?.nombre} {profile?.apellido}</div>
            <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', marginTop: '2px' }}>Conductor Profesional</div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-start', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
            <span style={{ background: 'rgba(39,174,96,0.15)', border: '1px solid rgba(39,174,96,0.4)', color: '#2ecc71', fontSize: '0.65rem', padding: '2px 8px', borderRadius: '20px' }}>✓ Perfil verificado</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '6px', marginBottom: '12px' }}>
            <span style={{ color: '#f39c12', fontSize: '0.85rem' }}>★★★★★</span>
            <span style={{ color: 'white', fontSize: '0.85rem', fontWeight: 600 }}>4.8</span>
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem' }}>(128 reseñas)</span>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
              <div style={{ position: 'relative', width: '48px', height: '48px', flexShrink: 0 }}>
                <svg width="48" height="48" viewBox="0 0 48 48">
                  <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="4"/>
                  <circle cx="24" cy="24" r="20" fill="none" stroke="#22c55e" strokeWidth="4" strokeDasharray="125.6" strokeDashoffset="18.8" strokeLinecap="round" transform="rotate(-90 24 24)"/>
                </svg>
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', fontSize: '0.65rem', fontWeight: 700, color: 'white' }}>85%</div>
              </div>
              <div>
                <div style={{ fontWeight: 700, color: 'white', fontSize: '0.8rem' }}>Perfil incompleto</div>
                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.3 }}>Completa tu perfil para tener más oportunidades.</div>
              </div>
            </div>
            <button onClick={() => router.push('/dashboard/conductor/completar-perfil')} style={{ width: '100%', background: '#2563eb', border: 'none', color: 'white', borderRadius: '8px', padding: '8px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}>Completar perfil</button>
          </div>
        </div>

        {/* Beneficios */}
        <div style={{ margin: '16px 20px 0', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '16px' }}>
          <div style={{ color: 'white', fontWeight: 700, fontSize: '0.85rem', marginBottom: '12px' }}>Al completar tu perfil obtendrás:</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#22c55e', fontSize: '0.9rem' }}><i className="ti ti-file-text" style={{ fontSize: '1rem' }}></i></span>
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.78rem' }}>CV profesional descargable</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#22c55e', fontSize: '0.9rem' }}><i className="ti ti-eye" style={{ fontSize: '1rem' }}></i></span>
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.78rem' }}>Más visibilidad para empresas</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#22c55e', fontSize: '0.9rem' }}><i className="ti ti-star" style={{ fontSize: '1rem' }}></i></span>
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.78rem' }}>Postulaciones prioritarias</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#22c55e', fontSize: '0.9rem' }}><i className="ti ti-circle-check" style={{ fontSize: '1rem' }}></i></span>
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.78rem' }}>Sello NetDriver Verificado</span>
            </div>
          </div>
        </div>

        {/* Ayuda */}
        <div style={{ margin: '12px 20px 16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '14px', display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' }}>
          <span style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.6 15.36 3.49 16.86L2.05 22L7.3 20.62C8.74 21.41 10.37 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2ZM12.04 20.16C10.56 20.16 9.11 19.76 7.85 19L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.22 15 3.79 13.47 3.79 11.91C3.79 7.37 7.5 3.66 12.05 3.66C14.25 3.66 16.31 4.51 17.85 6.06C19.39 7.61 20.29 9.66 20.29 11.92C20.29 16.46 16.58 20.16 12.04 20.16ZM16.56 13.99C16.31 13.87 15.09 13.27 14.87 13.19C14.65 13.1 14.49 13.06 14.32 13.31C14.16 13.55 13.69 14.13 13.55 14.29C13.41 14.45 13.26 14.46 13.02 14.34C12.79 14.22 11.99 13.94 11.27 13.29C10.71 12.78 10.34 12.16 10.21 11.91C10.07 11.66 10.19 11.53 10.32 11.41C10.43 11.3 10.57 11.13 10.7 10.98C10.83 10.83 10.88 10.72 10.97 10.55C11.06 10.38 11.01 10.27 10.95 10.15C10.88 10.04 10.32 8.75 10.13 8.27C9.94 7.79 9.74 7.84 9.59 7.84C9.44 7.83 9.27 7.83 9.1 7.83C8.93 7.83 8.65 7.9 8.4 8.17C8.15 8.43 7.41 9.13 7.41 10.42C7.41 11.71 8.42 12.96 8.55 13.13C8.69 13.3 10.32 15.93 12.9 16.91C15.48 17.89 15.48 17.56 15.96 17.51C16.43 17.46 17.51 16.84 17.74 16.18C17.96 15.52 17.96 14.95 17.88 14.83C17.79 14.71 17.6 14.65 17.36 14.53L16.56 13.99Z"/></svg>
          </span>
          <div>
            <div style={{ color: 'white', fontWeight: 700, fontSize: '0.8rem' }}>¿Necesitas ayuda?</div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.72rem', marginTop: '2px' }}>Escríbenos por WhatsApp</div>
          </div>
        </div>

        <nav style={{ flex: 1, padding: '10px 0' }}></nav>
      </div>

      {/* MAIN */}
      <div style={{ marginLeft: '220px', flex: 1, padding: '28px' }}>
        <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #e8eef5', overflow: 'hidden' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '24px 28px', borderBottom: '1px solid #e8eef5' }}>
            <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#e8f0fe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>📝</div>
              <div>
                <h1 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1a3a5c', margin: 0 }}>Completa tu perfil</h1>
                <p style={{ color: '#8fa3b8', fontSize: '0.85rem', margin: '2px 0 0' }}>Sigue estos pasos y obtén tu CV profesional</p>
              </div>
            </div>
            <button onClick={() => pasoActivo === 1 ? handleGuardar(true) : handleGuardarPaso2(true)} disabled={guardando} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'transparent', border: '1px solid #e8eef5', color: '#1a3a5c', padding: '8px 14px', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 600, cursor: guardando ? 'wait' : 'pointer' }}>📄 {guardando ? 'Guardando...' : 'Guardar y salir'}</button>
          </div>

          {/* Stepper */}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '28px 40px', borderBottom: '1px solid #e8eef5' }}>
            {pasos.map((p, i) => (
              <div key={p.num} style={{ display: 'flex', alignItems: 'center', flex: i < pasos.length - 1 ? 1 : 'none' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: pasoActivo >= p.num ? '#2563eb' : '#e8eef5', color: pasoActivo >= p.num ? 'white' : '#8fa3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.95rem' }}>{pasoActivo > p.num ? '✓' : p.num}</div>
                  <div style={{ fontSize: '0.78rem', color: pasoActivo >= p.num ? '#2563eb' : '#8fa3b8', fontWeight: pasoActivo >= p.num ? 700 : 500, textAlign: 'center', whiteSpace: 'pre-line', lineHeight: 1.3 }}>{p.label}</div>
                </div>
                {i < pasos.length - 1 && <div style={{ flex: 1, height: '2px', background: pasoActivo > p.num ? '#2563eb' : '#e8eef5', margin: '0 8px', marginTop: '-20px' }} />}
              </div>
            ))}
          </div>

          {/* Contenido del paso */}
          <div style={{ padding: '28px 40px' }}>
            {pasoActivo === 1 && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                  <div>
                    <div style={{ color: '#2563eb', fontWeight: 700, fontSize: '0.85rem', marginBottom: '4px' }}>Paso 1 de 6</div>
                    <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1a3a5c', margin: 0 }}>Información personal</h2>
                    <p style={{ color: '#8fa3b8', fontSize: '0.88rem', margin: '4px 0 0' }}>Cuéntanos tus datos básicos</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#f4f7fa', border: '1px solid #e8eef5', borderRadius: '10px', padding: '10px 16px' }}>
                    <span style={{ color: '#22c55e', fontSize: '1.1rem' }}>🛡️</span>
                    <div>
                      <div style={{ fontWeight: 700, color: '#1a3a5c', fontSize: '0.82rem' }}>Tu información está segura</div>
                      <div style={{ color: '#8fa3b8', fontSize: '0.75rem' }}>Encriptamos tus datos</div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#1a3a5c', display: 'block', marginBottom: '6px' }}>Nombre completo</label>
                    <input value={nombreCompleto} onChange={e => setNombreCompleto(e.target.value)} placeholder="Ingresa tu nombre completo" style={{ width: '100%', background: '#f4f7fa', border: '1px solid #e8eef5', borderRadius: '8px', padding: '11px 14px', fontSize: '0.88rem', outline: 'none', color: '#1a3a5c', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#1a3a5c', display: 'block', marginBottom: '6px' }}>RUT</label>
                    <input value={rut} onChange={e => setRut(e.target.value)} placeholder="12.345.678-9" style={{ width: '100%', background: '#f4f7fa', border: '1px solid #e8eef5', borderRadius: '8px', padding: '11px 14px', fontSize: '0.88rem', outline: 'none', color: '#1a3a5c', boxSizing: 'border-box' }} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#1a3a5c', display: 'block', marginBottom: '6px' }}>Fecha de nacimiento</label>
                    <input type="date" value={fechaNacimiento} onChange={e => setFechaNacimiento(e.target.value)} style={{ width: '100%', background: '#f4f7fa', border: '1px solid #e8eef5', borderRadius: '8px', padding: '11px 14px', fontSize: '0.88rem', outline: 'none', color: '#1a3a5c', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#1a3a5c', display: 'block', marginBottom: '6px' }}>Teléfono</label>
                    <input value={telefono} onChange={e => setTelefono(e.target.value)} placeholder="+56 9 1234 5678" style={{ width: '100%', background: '#f4f7fa', border: '1px solid #e8eef5', borderRadius: '8px', padding: '11px 14px', fontSize: '0.88rem', outline: 'none', color: '#1a3a5c', boxSizing: 'border-box' }} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#1a3a5c', display: 'block', marginBottom: '6px' }}>Correo electrónico</label>
                    <input value={emailContacto} onChange={e => setEmailContacto(e.target.value)} placeholder="correo@ejemplo.com" style={{ width: '100%', background: '#f4f7fa', border: '1px solid #e8eef5', borderRadius: '8px', padding: '11px 14px', fontSize: '0.88rem', outline: 'none', color: '#1a3a5c', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#1a3a5c', display: 'block', marginBottom: '6px' }}>Región</label>
                    <select value={regionSel} onChange={e => { setRegionSel(e.target.value); setComunaSel('') }} style={{ width: '100%', background: '#f4f7fa', border: '1px solid #e8eef5', borderRadius: '8px', padding: '11px 14px', fontSize: '0.88rem', outline: 'none', color: '#1a3a5c' }}>
                      <option value="">Selecciona tu región</option>
                      {regiones.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#1a3a5c', display: 'block', marginBottom: '6px' }}>Comuna</label>
                    <select value={comunaSel} onChange={e => setComunaSel(e.target.value)} disabled={!regionSel} style={{ width: '100%', background: regionSel ? '#f4f7fa' : '#eef1f5', border: '1px solid #e8eef5', borderRadius: '8px', padding: '11px 14px', fontSize: '0.88rem', outline: 'none', color: regionSel ? '#1a3a5c' : '#8fa3b8', cursor: regionSel ? 'pointer' : 'not-allowed' }}>
                      <option value="">{regionSel ? 'Selecciona tu comuna' : 'Primero selecciona una región'}</option>
                      {regionSel && regionesComunas[regionSel]?.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#1a3a5c', display: 'block', marginBottom: '6px' }}>Disponibilidad para trabajar fuera de su región</label>
                    <select value={dispFueraRegion} onChange={e => setDispFueraRegion(e.target.value)} style={{ width: '100%', background: '#f4f7fa', border: '1px solid #e8eef5', borderRadius: '8px', padding: '11px 14px', fontSize: '0.88rem', outline: 'none', color: '#1a3a5c' }}>
                      <option value="">Selecciona una opción</option>
                      <option value="si">Sí</option>
                      <option value="no">No</option>
                    </select>
                  </div>
                </div>

                <div style={{ background: '#f4f7fa', border: '1px solid #e8eef5', borderRadius: '10px', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
                  <span style={{ color: '#2563eb' }}>ℹ️</span>
                  <span style={{ color: '#8fa3b8', fontSize: '0.85rem' }}>Esta información será utilizada para crear tu perfil y generar tu CV profesional.</span>
                </div>

                {mensaje && <div style={{ fontSize: '0.85rem', color: mensaje.includes('Error') ? '#e74c3c' : '#22c55e', marginBottom: '16px', textAlign: 'right' }}>{mensaje}</div>}

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <button onClick={() => router.push('/dashboard/conductor')} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#2563eb', border: 'none', color: 'white', padding: '12px 28px', borderRadius: '8px', fontSize: '0.92rem', fontWeight: 700, cursor: 'pointer' }}>← Volver atrás</button>
                  <button onClick={() => handleGuardar(false, 2)} disabled={guardando} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#2563eb', border: 'none', color: 'white', padding: '12px 28px', borderRadius: '8px', fontSize: '0.92rem', fontWeight: 700, cursor: guardando ? 'wait' : 'pointer' }}>{guardando ? 'Guardando...' : 'Continuar →'}</button>
                </div>
              </>
            )}
            {pasoActivo === 2 && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                  <div>
                    <div style={{ color: '#2563eb', fontWeight: 700, fontSize: '0.85rem', marginBottom: '4px' }}>Paso 2 de 6</div>
                    <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1a3a5c', margin: 0 }}>Licencias</h2>
                    <p style={{ color: '#8fa3b8', fontSize: '0.88rem', margin: '4px 0 0' }}>Selecciona todas las licencias que posees</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#f4f7fa', border: '1px solid #e8eef5', borderRadius: '10px', padding: '10px 16px' }}>
                    <span style={{ color: '#22c55e', fontSize: '1.1rem' }}>🛡️</span>
                    <div>
                      <div style={{ fontWeight: 700, color: '#1a3a5c', fontSize: '0.82rem' }}>Tus licencias están seguras</div>
                      <div style={{ color: '#8fa3b8', fontSize: '0.75rem' }}>Solo las empresas verificadas podrán verlas.</div>
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1a3a5c', marginBottom: '14px' }}>Selecciona tus licencias</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                    {licenciasDisponibles.map(lic => (
                      <div key={lic.id} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div onClick={() => toggleLicencia(lic.id)} style={{ position: 'relative', background: licenciasSel.includes(lic.id) ? '#eaf1fe' : '#fff', border: licenciasSel.includes(lic.id) ? '2px solid #2563eb' : '1px solid #e8eef5', borderRadius: '10px', padding: '20px 12px', textAlign: 'center', cursor: 'pointer' }}>
                          <input type="checkbox" checked={licenciasSel.includes(lic.id)} onChange={() => {}} onClick={e => e.stopPropagation()} style={{ position: 'absolute', top: '10px', left: '10px', width: '16px', height: '16px', accentColor: '#2563eb', pointerEvents: 'none' }} />
                          <div style={{ width: '46px', height: '46px', borderRadius: '10px', background: '#eef1f5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
                            <i className="ti ti-id-badge-2" style={{ fontSize: '1.4rem', color: '#8fa3b8' }}></i>
                          </div>
                          <div style={{ fontWeight: 700, color: '#1a3a5c', fontSize: '0.92rem', marginBottom: '2px' }}>{lic.nombre}</div>
                          <div style={{ color: '#8fa3b8', fontSize: '0.78rem' }}>{lic.desc}</div>
                        </div>
                        {licenciasSel.includes(lic.id) && (
                          <>
                            <div>
                              <label style={{ fontSize: '0.7rem', fontWeight: 600, color: '#1a3a5c', display: 'block', marginBottom: '4px' }}>Vencimiento</label>
                              <input type="date" value={fechasVencimiento[lic.id] || ''} onChange={e => setFechasVencimiento(prev => ({ ...prev, [lic.id]: e.target.value }))} style={{ width: '100%', background: '#f4f7fa', border: '1px solid #e8eef5', borderRadius: '6px', padding: '6px 8px', fontSize: '0.72rem', outline: 'none', color: '#1a3a5c', boxSizing: 'border-box' }} />
                            </div>
                            <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px', border: '1.5px dashed #e8eef5', borderRadius: '6px', padding: '12px 4px', cursor: 'pointer', textAlign: 'center', background: '#fafbfc' }}>
                              <i className="ti ti-cloud-upload" style={{ fontSize: '1.4rem', color: '#8fa3b8' }}></i>
                              <span style={{ color: '#2563eb', fontWeight: 600, fontSize: '0.8rem', wordBreak: 'break-all', maxWidth: '100%' }}>{archivosLicencia[lic.id] ? archivosLicencia[lic.id]!.name : 'Subir documento'}</span>
                              <input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={e => setArchivosLicencia(prev => ({ ...prev, [lic.id]: e.target.files?.[0] || null }))} style={{ display: 'none' }} />
                            </label>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>


                {mensaje && <div style={{ fontSize: '0.85rem', color: mensaje.includes('Error') ? '#e74c3c' : '#22c55e', marginBottom: '16px', textAlign: 'right' }}>{mensaje}</div>}

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <button onClick={() => setPasoActivo(1)} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#2563eb', border: 'none', color: 'white', padding: '12px 28px', borderRadius: '8px', fontSize: '0.92rem', fontWeight: 700, cursor: 'pointer' }}>← Volver atrás</button>
                  <button onClick={() => handleGuardarPaso2(false, 3)} disabled={guardando} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#2563eb', border: 'none', color: 'white', padding: '12px 28px', borderRadius: '8px', fontSize: '0.92rem', fontWeight: 700, cursor: guardando ? 'wait' : 'pointer' }}>{guardando ? 'Guardando...' : 'Continuar →'}</button>
                </div>
              </>
            )}

            {pasoActivo > 2 && (
              <div style={{ textAlign: 'center', padding: '60px 0', color: '#8fa3b8' }}>
                <p style={{ fontSize: '1rem' }}>Paso {pasoActivo}: {pasos[pasoActivo-1].label.replace('\\n',' ')} — próximamente</p>
                <button onClick={() => setPasoActivo(pasoActivo - 1)} style={{ marginTop: '16px', background: 'transparent', border: '1px solid #e8eef5', color: '#1a3a5c', padding: '10px 24px', borderRadius: '8px', fontSize: '0.88rem', cursor: 'pointer' }}>← Volver</button>
              </div>
            )}
          </div>
        </div>
        <p style={{ textAlign: 'center', color: '#8fa3b8', fontSize: '0.8rem', marginTop: '16px' }}>🔒 Puedes guardar y continuar después. Tu progreso se guardará automáticamente.</p>
      </div>
    </div>
  )
}
