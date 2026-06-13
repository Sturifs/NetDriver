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

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push('/'); return }
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(data)
    })
  }, [])

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
        <nav style={{ flex: 1, padding: '10px 0' }}>
          <button onClick={() => router.push('/dashboard/conductor')} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 20px', background: 'transparent', border: 'none', borderLeft: '3px solid transparent', color: 'rgba(255,255,255,0.55)', fontSize: '0.85rem', cursor: 'pointer', textAlign: 'left' }}>
            <span>🏠</span><span style={{ flex: 1 }}>Inicio</span>
          </button>
        </nav>
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
            <button onClick={() => router.push('/dashboard/conductor')} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'transparent', border: '1px solid #e8eef5', color: '#1a3a5c', padding: '8px 14px', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}>📄 Guardar y salir</button>
          </div>

          {/* Stepper */}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '28px 40px', borderBottom: '1px solid #e8eef5' }}>
            {pasos.map((p, i) => (
              <div key={p.num} style={{ display: 'flex', alignItems: 'center', flex: i < pasos.length - 1 ? 1 : 'none' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: pasoActivo === p.num ? '#2563eb' : '#e8eef5', color: pasoActivo === p.num ? 'white' : '#8fa3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.95rem' }}>{p.num}</div>
                  <div style={{ fontSize: '0.78rem', color: pasoActivo === p.num ? '#2563eb' : '#8fa3b8', fontWeight: pasoActivo === p.num ? 700 : 500, textAlign: 'center', whiteSpace: 'pre-line', lineHeight: 1.3 }}>{p.label}</div>
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
                    <input placeholder="Ingresa tu nombre completo" style={{ width: '100%', background: '#f4f7fa', border: '1px solid #e8eef5', borderRadius: '8px', padding: '11px 14px', fontSize: '0.88rem', outline: 'none', color: '#1a3a5c', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#1a3a5c', display: 'block', marginBottom: '6px' }}>RUT</label>
                    <input placeholder="12.345.678-9" style={{ width: '100%', background: '#f4f7fa', border: '1px solid #e8eef5', borderRadius: '8px', padding: '11px 14px', fontSize: '0.88rem', outline: 'none', color: '#1a3a5c', boxSizing: 'border-box' }} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#1a3a5c', display: 'block', marginBottom: '6px' }}>Fecha de nacimiento</label>
                    <input type="date" style={{ width: '100%', background: '#f4f7fa', border: '1px solid #e8eef5', borderRadius: '8px', padding: '11px 14px', fontSize: '0.88rem', outline: 'none', color: '#1a3a5c', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#1a3a5c', display: 'block', marginBottom: '6px' }}>Teléfono</label>
                    <input placeholder="+56 9 1234 5678" style={{ width: '100%', background: '#f4f7fa', border: '1px solid #e8eef5', borderRadius: '8px', padding: '11px 14px', fontSize: '0.88rem', outline: 'none', color: '#1a3a5c', boxSizing: 'border-box' }} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#1a3a5c', display: 'block', marginBottom: '6px' }}>Correo electrónico</label>
                    <input placeholder="correo@ejemplo.com" defaultValue={profile?.email || ''} style={{ width: '100%', background: '#f4f7fa', border: '1px solid #e8eef5', borderRadius: '8px', padding: '11px 14px', fontSize: '0.88rem', outline: 'none', color: '#1a3a5c', boxSizing: 'border-box' }} />
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
                </div>

                <div style={{ background: '#f4f7fa', border: '1px solid #e8eef5', borderRadius: '10px', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
                  <span style={{ color: '#2563eb' }}>ℹ️</span>
                  <span style={{ color: '#8fa3b8', fontSize: '0.85rem' }}>Esta información será utilizada para crear tu perfil y generar tu CV profesional.</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button onClick={() => setPasoActivo(2)} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#2563eb', border: 'none', color: 'white', padding: '12px 28px', borderRadius: '8px', fontSize: '0.92rem', fontWeight: 700, cursor: 'pointer' }}>Continuar →</button>
                </div>
              </>
            )}

            {pasoActivo > 1 && (
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
