'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { supabase } from './supabase'

export default function Home() {
  const router = useRouter()
  const [activeModal, setActiveModal] = useState<string | null>(null)
  const [activePlan, setActivePlan] = useState<'conductor' | 'empresa'>('conductor')
  const [activeTab, setActiveTab] = useState<string>('login')
  const [nombre, setNombre] = useState('')
  const [apellido, setApellido] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [mensaje, setMensaje] = useState('')

  const openModal = (type: string) => {
    setActiveModal(type)
    setActiveTab('login')
    setMensaje('')
  }

  const handleRegistro = async () => {
    if (!nombre || !email || !password) {
      setMensaje('Por favor completa todos los campos.')
      return
    }
    setLoading(true)
    setMensaje('')
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nombre,
          apellido,
          tipo: activeModal
        }
      }
    })
    if (error) {
      setMensaje('Error: ' + error.message)
    } else {
      await supabase.from('profiles').insert({
        id: data.user?.id,
        tipo: activeModal,
        nombre,
        apellido,
        email
      })
      setMensaje('✅ ¡Cuenta creada! Ya puedes iniciar sesión.')
      setActiveTab('login')
    }
    setLoading(false)
  }

  const handleLogin = async () => {
    if (!email || !password) {
      setMensaje('Por favor ingresa tu correo y contraseña.')
      return
    }
    setLoading(true)
    setMensaje('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setMensaje('Error: ' + error.message)
    } else {
      const { data: { user } } = await supabase.auth.getUser()
      const { data: profile } = await supabase.from('profiles').select('tipo').eq('id', user?.id).single()
      if (profile?.tipo === 'empresa') {
        router.push('/dashboard/empresa')
      } else {
        router.push('/dashboard/conductor')
      }
    }
    setLoading(false)
  }
  return (
    <>
      {/* NAV */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 5%', height: '72px',
        background: 'rgba(255,255,255,0.97)',
        borderBottom: '1px solid #e8eef5',
        boxShadow: '0 2px 20px rgba(26,58,92,0.08)'
      }}>
        <a href="/" style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: '1.7rem', fontWeight: 800, color: '#1a3a5c',
          textDecoration: 'none'
        }}>
          🚛 NetDriver
        </a>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={() => openModal('conductor')} style={{
            padding: '9px 22px', borderRadius: '6px',
            border: '2px solid #1a3a5c', color: '#1a3a5c',
            background: 'transparent', fontFamily: "'Barlow', sans-serif",
            fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer'
          }}>Soy Conductor</button>
          <button onClick={() => openModal('empresa')} style={{
            padding: '9px 22px', borderRadius: '6px',
            border: '2px solid #27ae60', background: '#27ae60',
            color: 'white', fontFamily: "'Barlow', sans-serif",
            fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer'
          }}>Soy Empresa</button>
        </div>
      </nav>

      {/* BANNER REGISTRO CIVIL */}
      <div style={{
        background: 'linear-gradient(90deg, #1a3a5c 0%, #254d78 100%)',
        padding: '14px 5%', marginTop: '72px',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap'
      }}>
        <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.88rem', lineHeight: 1.5 }}>
          <strong style={{ color: 'white' }}>¿Eres conductor profesional?</strong> Descarga tu Hoja de Vida de Conductor directamente desde el Registro Civil de Chile.
        </p>
        <a href="https://www.registrocivil.cl" target="_blank" rel="noopener" style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          padding: '12px 24px', borderRadius: '8px',
          background: 'white', color: '#1a3a5c',
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: '1rem', fontWeight: 800,
          textTransform: 'uppercase', textDecoration: 'none',
          whiteSpace: 'nowrap'
        }}>
          ⬇ Descarga tu Hoja de Vida de Conductor
        </a>
      </div>

      {/* HERO */}
      <section style={{
        minHeight: '100vh', background: '#0f2540',
        display: 'flex', alignItems: 'center',
        position: 'relative', overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse 60% 60% at 80% 50%, rgba(39,174,96,0.12) 0%, transparent 70%), linear-gradient(135deg, #0f2540 0%, #1a3a5c 60%, #0f2540 100%)'
        }} />
        <div style={{
          position: 'relative', zIndex: 2,
          maxWidth: '1200px', margin: '0 auto',
          padding: '80px 5%', width: '100%',
          textAlign: 'center'
        }}>
          <div style={{
            display: 'inline-block',
            background: 'rgba(39,174,96,0.2)', border: '1px solid #27ae60',
            color: '#2ecc71', fontSize: '0.78rem', fontWeight: 600,
            letterSpacing: '0.1em', textTransform: 'uppercase',
            padding: '5px 14px', borderRadius: '20px', marginBottom: '24px'
          }}>🇨🇱 La red de conductores de Chile</div>

          <h1 style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 'clamp(3rem, 8vw, 6rem)',
            fontWeight: 900, lineHeight: 0.95,
            color: 'white', textTransform: 'uppercase', marginBottom: '24px'
          }}>
            Conectamos<br />
            <span style={{ color: '#2ecc71' }}>Conductores</span><br />
            con Empresas
          </h1>

          <p style={{
            fontSize: '1.1rem', color: 'rgba(255,255,255,0.65)',
            maxWidth: '500px', margin: '0 auto 40px', lineHeight: 1.7
          }}>
            La plataforma que une a conductores y operadores con empresas de transporte. Rápido, verificado y en todo el país.
          </p>

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '60px' }}>
            <button onClick={() => openModal('conductor')} style={{
              padding: '15px 32px', borderRadius: '8px',
              background: '#27ae60', color: 'white',
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: '1rem', fontWeight: 700,
              textTransform: 'uppercase', border: 'none',
              cursor: 'pointer', letterSpacing: '0.05em'
            }}>Soy Conductor →</button>
            <button onClick={() => openModal('empresa')} style={{
              padding: '15px 32px', borderRadius: '8px',
              background: 'transparent', color: 'white',
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: '1rem', fontWeight: 700,
              textTransform: 'uppercase', cursor: 'pointer',
              border: '2px solid rgba(255,255,255,0.3)',
              letterSpacing: '0.05em'
            }}>Soy Empresa</button>
          </div>

          <div style={{ display: 'flex', gap: '40px', justifyContent: 'center' }}>
            {[['+ 2.400', 'Conductores'], ['+ 380', 'Empresas'], ['15', 'Regiones']].map(([num, label]) => (
              <div key={label}>
                <div style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: '2rem', fontWeight: 800, color: 'white', lineHeight: 1
                }}><span style={{ color: '#2ecc71' }}>{num}</span></div>
                <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: '4px' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section style={{ padding: '100px 5%', background: '#f4f7fb' }}>
        <p style={{ textAlign: 'center', fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#27ae60', marginBottom: '16px' }}>¿Cómo funciona?</p>
        <h2 style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: 'clamp(2rem, 4vw, 3.2rem)',
          fontWeight: 800, textAlign: 'center', color: '#1a3a5c',
          textTransform: 'uppercase', marginBottom: '60px'
        }}>Simple. Rápido. Efectivo.</h2>

        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px' }}>
          {[
            { title: 'Para Conductores', color: '#1a3a5c', steps: [
              ['01', 'Crea tu perfil', 'Regístrate gratis y carga tu experiencia, licencias y disponibilidad.'],
              ['02', 'Genera tu CV gratis 📄', 'Crea tu CV profesional y descárgalo. Plan Premium sin sello de agua.'],
              ['03', 'Postula y acepta Pegas Relámpago ⚡', 'Accede a ofertas de trabajo en transporte y logística en todo Chile.'],
              ['04', 'Recibe alertas 🔔', 'Alertas por correo o WhatsApp antes de que venzan tus documentos.'],
            ]},
            { title: 'Para Empresas', color: '#27ae60', steps: [
              ['01', 'Registra tu empresa', 'Crea una cuenta empresarial y comienza a usar la plataforma.'],
              ['02', 'Publica ofertas de trabajo', 'Sube tus vacantes y recibe postulaciones de conductores verificados.'],
              ['03', 'Certifica tus equipos 🛡️', 'Registra y certifica tu flota de vehículos y maquinaria.'],
              ['04', 'Acceso ilimitado con Plan Pro', 'Búsqueda ilimitada y pretensiones de renta de candidatos.'],
            ]},
          ].map(({ title, color, steps }) => (
            <div key={title}>
              <h3 style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: '1.4rem', fontWeight: 800, color: '#1a3a5c',
                textTransform: 'uppercase', marginBottom: '32px',
                paddingBottom: '20px', borderBottom: `3px solid ${color}`
              }}>{title}</h3>
              {steps.map(([num, title2, desc]) => (
                <div key={num} style={{
                  display: 'flex', gap: '16px', marginBottom: '24px',
                  padding: '20px', borderRadius: '12px',
                  background: 'white', border: '1px solid #e8eef5'
                }}>
                  <div style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontSize: '2rem', fontWeight: 900, color: '#e8eef5',
                    lineHeight: 1, flexShrink: 0, width: '36px'
                  }}>{num}</div>
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.95rem', color: '#1a3a5c', marginBottom: '4px' }}>{title2}</strong>
                    <p style={{ fontSize: '0.85rem', color: '#8fa3b8', lineHeight: 1.5 }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* PLANES */}
      <section style={{ padding: '100px 5%', background: 'white' }}>
        <p style={{ textAlign: 'center', fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#27ae60', marginBottom: '16px' }}>Planes y Precios</p>
        <h2 style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: 'clamp(2rem, 4vw, 3.2rem)',
          fontWeight: 800, textAlign: 'center', color: '#1a3a5c',
          textTransform: 'uppercase', marginBottom: '40px'
        }}>Elige tu Plan</h2>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '50px' }}>
          <div style={{ display: 'flex', background: '#e8eef5', borderRadius: '10px', padding: '6px' }}>
            {(['conductor', 'empresa'] as const).map(plan => (
              <button key={plan} onClick={() => setActivePlan(plan)} style={{
                padding: '10px 28px', borderRadius: '7px',
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: '1rem', fontWeight: 700, textTransform: 'uppercase',
                border: 'none', cursor: 'pointer',
                background: activePlan === plan ? '#1a3a5c' : 'transparent',
                color: activePlan === plan ? 'white' : '#8fa3b8'
              }}>{plan === 'conductor' ? 'Conductor' : 'Empresa'}</button>
            ))}
          </div>
        </div>

        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px' }}>
          {activePlan === 'conductor' ? (
            <>
              <div style={{ borderRadius: '16px', padding: '36px', border: '2px solid #e8eef5' }}>
                <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#8fa3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Conductor / Operador</p>
                <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '1.8rem', fontWeight: 800, color: '#1a3a5c', textTransform: 'uppercase', marginBottom: '20px' }}>Plan Gratuito</h3>
                <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '2.5rem', fontWeight: 900, color: '#1a3a5c', marginBottom: '4px' }}>GRATIS</p>
                <p style={{ fontSize: '0.85rem', color: '#8fa3b8', marginBottom: '28px' }}>Sin tarjeta de crédito</p>
                {['Aplicar a 1 oferta al mes', '1 Pega Relámpago ⚡ al mes', 'CV profesional con sello NetDriver', 'Link de perfil compartible', 'Alertas de vencimiento', 'Programa de referidos'].map(f => (
                  <p key={f} style={{ fontSize: '0.9rem', padding: '8px 0', borderBottom: '1px solid #e8eef5', color: '#1a2e42' }}>✅ {f}</p>
                ))}
                <button onClick={() => openModal('conductor')} style={{
                  display: 'block', width: '100%', padding: '14px', marginTop: '28px',
                  borderRadius: '8px', border: '2px solid #1a3a5c',
                  background: 'transparent', color: '#1a3a5c',
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: '1rem', fontWeight: 700, textTransform: 'uppercase', cursor: 'pointer'
                }}>Comenzar gratis</button>
              </div>

              <div style={{ borderRadius: '16px', padding: '36px', border: '2px solid #27ae60', background: 'linear-gradient(135deg, #0f2540 0%, #1a3a5c 100%)', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '20px', right: '20px', background: '#27ae60', color: 'white', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', padding: '4px 12px', borderRadius: '20px' }}>Más popular</div>
                <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#2ecc71', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Conductor / Operador</p>
                <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '1.8rem', fontWeight: 800, color: 'white', textTransform: 'uppercase', marginBottom: '20px' }}>Plan Premium</h3>
                <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '3rem', fontWeight: 900, color: '#2ecc71', lineHeight: 1, marginBottom: '4px' }}>$4.990</p>
                <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', marginBottom: '28px' }}>por mes · cancela cuando quieras</p>
                {['Postulaciones ilimitadas', 'Pegas Relámpago ⚡ ilimitadas', 'CV sin sello de agua', 'Sello NetDriver Verificado ✓', 'Mayor visibilidad', 'Pretensión de renta visible para empresas Pro', 'Soporte prioritario'].map(f => (
                  <p key={f} style={{ fontSize: '0.9rem', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)' }}>✅ {f}</p>
                ))}
                <button onClick={() => openModal('conductor')} style={{
                  display: 'block', width: '100%', padding: '14px', marginTop: '28px',
                  borderRadius: '8px', border: '2px solid #27ae60',
                  background: '#27ae60', color: 'white',
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: '1rem', fontWeight: 700, textTransform: 'uppercase', cursor: 'pointer'
                }}>Suscribirse ahora</button>
              </div>
            </>
          ) : (
            <>
              <div style={{ borderRadius: '16px', padding: '36px', border: '2px solid #e8eef5' }}>
                <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#8fa3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Empresa de Transporte</p>
                <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '1.8rem', fontWeight: 800, color: '#1a3a5c', textTransform: 'uppercase', marginBottom: '20px' }}>Plan Gratuito</h3>
                <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '2.5rem', fontWeight: 900, color: '#1a3a5c', marginBottom: '4px' }}>GRATIS</p>
                <p style={{ fontSize: '0.85rem', color: '#8fa3b8', marginBottom: '28px' }}>Sin tarjeta de crédito</p>
                {['Buscar 1 conductor al mes', 'Arrendar 1 equipo al mes', 'Publicar 1 oferta al mes', 'Módulo básico certificación equipos', '🔒 Pretensión de renta: no disponible'].map(f => (
                  <p key={f} style={{ fontSize: '0.9rem', padding: '8px 0', borderBottom: '1px solid #e8eef5', color: '#1a2e42' }}>{f.startsWith('🔒') ? f : `✅ ${f}`}</p>
                ))}
                <button onClick={() => openModal('empresa')} style={{
                  display: 'block', width: '100%', padding: '14px', marginTop: '28px',
                  borderRadius: '8px', border: '2px solid #1a3a5c',
                  background: 'transparent', color: '#1a3a5c',
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: '1rem', fontWeight: 700, textTransform: 'uppercase', cursor: 'pointer'
                }}>Comenzar gratis</button>
              </div>

              <div style={{ borderRadius: '16px', padding: '36px', border: '2px solid #27ae60', background: 'linear-gradient(135deg, #0f2540 0%, #1a3a5c 100%)', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '20px', right: '20px', background: '#27ae60', color: 'white', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', padding: '4px 12px', borderRadius: '20px' }}>Empresas Pro</div>
                <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#2ecc71', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Empresa de Transporte</p>
                <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '1.8rem', fontWeight: 800, color: 'white', textTransform: 'uppercase', marginBottom: '20px' }}>Plan Pro</h3>
                <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '3rem', fontWeight: 900, color: '#2ecc71', lineHeight: 1, marginBottom: '4px' }}>$150.000</p>
                <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', marginBottom: '28px' }}>por mes · facturación mensual</p>
                {['Búsqueda ilimitada de conductores', 'Publicación ilimitada de ofertas', 'Publicación ilimitada de equipos', 'Convocatoria masiva', 'Ver pretensión de renta ✓', 'Certificación completa de flota', 'Dashboard con métricas'].map(f => (
                  <p key={f} style={{ fontSize: '0.9rem', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)' }}>✅ {f}</p>
                ))}
                <button onClick={() => openModal('empresa')} style={{
                  display: 'block', width: '100%', padding: '14px', marginTop: '28px',
                  borderRadius: '8px', border: '2px solid #27ae60',
                  background: '#27ae60', color: 'white',
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: '1rem', fontWeight: 700, textTransform: 'uppercase', cursor: 'pointer'
                }}>Contratar Plan Pro</button>
              </div>
            </>
          )}
        </div>
      </section>

      {/* REFERIDOS */}
      <section style={{ padding: '80px 5%', background: '#0f2540', textAlign: 'center' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <div style={{ fontSize: '2rem', marginBottom: '24px' }}>🤝</div>
          <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 900, color: 'white', textTransform: 'uppercase', marginBottom: '16px' }}>
            Programa de <span style={{ color: '#2ecc71' }}>Referidos</span>
          </h2>
          <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, marginBottom: '32px' }}>
            Invita a otros conductores y obtén meses premium gratis.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '24px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '28px 40px', marginBottom: '32px' }}>
            <div><div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '2.5rem', fontWeight: 900, color: '#2ecc71' }}>5</div><div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', marginTop: '4px' }}>Amigos referidos</div></div>
            <div style={{ fontSize: '1.5rem', color: 'rgba(255,255,255,0.3)' }}>→</div>
            <div><div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '2.5rem', fontWeight: 900, color: '#2ecc71' }}>6</div><div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', marginTop: '4px' }}>Meses premium gratis</div></div>
          </div>
          <button onClick={() => openModal('conductor')} style={{ padding: '15px 32px', borderRadius: '8px', background: '#27ae60', color: 'white', fontFamily: "'Barlow Condensed', sans-serif", fontSize: '1rem', fontWeight: 700, textTransform: 'uppercase', border: 'none', cursor: 'pointer' }}>
            Únete y empieza a referir →
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: '60px 5% 30px', background: '#0a1f35', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '48px', marginBottom: '48px' }}>
          <div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '1.8rem', fontWeight: 800, color: 'white', marginBottom: '12px' }}>🚛 NetDriver</div>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.7, maxWidth: '260px' }}>La plataforma que conecta conductores con empresas de transporte en todo Chile.</p>
          </div>
          {[
            ['Conductores', ['Cómo funciona', 'Plan Premium', 'Pegas Relámpago', 'Crear CV gratis', 'Programa Referidos']],
            ['Empresas', ['Buscar conductores', 'Publicar ofertas', 'Certificación equipos', 'Plan Pro']],
            ['NetDriver', ['Sobre nosotros', 'Términos de uso', 'Privacidad', 'Contacto']],
          ].map(([title, links]) => (
            <div key={title as string}>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '0.85rem', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>{title}</div>
              {(links as string[]).map(link => (
                <p key={link} style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.6)', marginBottom: '10px', cursor: 'pointer' }}>{link}</p>
              ))}
            </div>
          ))}
        </div>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.06)', fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)' }}>
          <span>© 2025 NetDriver.cl — Todos los derechos reservados</span>
          <span>Hecho con ❤️ en Chile 🇨🇱</span>
        </div>
      </footer>

      {/* MODAL */}
      {activeModal && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setActiveModal(null) }}
          style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(10,31,53,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
        >
          <div
            onClick={e => e.stopPropagation()}
            onMouseDown={e => e.stopPropagation()}
            style={{ background: 'white', borderRadius: '20px', width: '100%', maxWidth: '460px', overflow: 'hidden' }}
          >
            <div style={{ padding: '28px 32px 22px', background: '#0f2540', position: 'relative' }}>
              <div style={{ display: 'inline-block', background: 'rgba(39,174,96,0.2)', border: '1px solid #27ae60', color: '#2ecc71', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', padding: '4px 12px', borderRadius: '20px', marginBottom: '10px' }}>
                {activeModal === 'empresa' ? '🏢 Empresa de Transporte' : '🚛 Conductor / Operador'}
              </div>
              <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '1.7rem', fontWeight: 800, color: 'white', textTransform: 'uppercase' }}>Bienvenido a NetDriver</h3>
              <button onClick={() => setActiveModal(null)} style={{ position: 'absolute', top: '18px', right: '18px', width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1.1rem' }}>✕</button>
            </div>
            <div style={{ padding: '28px 32px' }}>
              <div style={{ display: 'flex', marginBottom: '24px', borderBottom: '2px solid #e8eef5' }}>
                {['login', 'registro'].map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)} style={{
                    flex: 1, padding: '10px', textAlign: 'center',
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontSize: '1rem', fontWeight: 700, textTransform: 'uppercase',
                    border: 'none', background: 'transparent', cursor: 'pointer',
                    color: activeTab === tab ? '#1a3a5c' : '#8fa3b8',
                    borderBottom: activeTab === tab ? '3px solid #1a3a5c' : '3px solid transparent',
                    marginBottom: '-2px'
                  }}>{tab === 'login' ? 'Iniciar Sesión' : 'Registrarse'}</button>
                ))}
              </div>

              {activeTab === 'login' ? (
                <>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#1a3a5c', marginBottom: '5px', textTransform: 'uppercase' }}>Correo electrónico</label>
                    <input type="email" placeholder="correo@ejemplo.cl" value={email} onChange={e => setEmail(e.target.value)} style={{ width: '100%', padding: '11px 13px', borderRadius: '8px', border: '2px solid #e8eef5', fontFamily: "'Barlow', sans-serif", fontSize: '0.9rem', outline: 'none', color: '#1a3a5c' }} />
                  </div>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#1a3a5c', marginBottom: '5px', textTransform: 'uppercase' }}>Contraseña</label>
                    <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} style={{ width: '100%', padding: '11px 13px', borderRadius: '8px', border: '2px solid #e8eef5', fontFamily: "'Barlow', sans-serif", fontSize: '0.9rem', outline: 'none', color: '#1a3a5c' }} />
                  </div>
                  <button onClick={handleLogin} disabled={loading} style={{ width: '100%', padding: '13px', borderRadius: '8px', background: '#1a3a5c', color: 'white', border: 'none', fontFamily: "'Barlow Condensed', sans-serif", fontSize: '1.1rem', fontWeight: 700, textTransform: 'uppercase', cursor: 'pointer', marginTop: '8px' }}>
                    Iniciar Sesión
                  </button>
                  {mensaje && <p style={{ fontSize: '0.85rem', color: mensaje.startsWith('✅') ? '#27ae60' : '#dc2626', marginBottom: '10px', textAlign: 'center' }}>{mensaje}</p>}
                  <div style={{ textAlign: 'center', margin: '16px 0', fontSize: '0.8rem', color: '#8fa3b8' }}>o continúa con</div>
                  <button style={{ width: '100%', padding: '13px', borderRadius: '8px', background: '#e8eef5', color: '#1a3a5c', border: 'none', fontFamily: "'Barlow Condensed', sans-serif", fontSize: '1.1rem', fontWeight: 700, cursor: 'pointer' }}>
                    🌐 Google
                  </button>
                </>
              ) : (
                <>
<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#1a3a5c', marginBottom: '5px', textTransform: 'uppercase' }}>Nombre</label>
                      <input type="text" placeholder="Juan" value={nombre} onChange={e => setNombre(e.target.value)} style={{ width: '100%', padding: '11px 13px', borderRadius: '8px', border: '2px solid #e8eef5', fontFamily: "'Barlow', sans-serif", fontSize: '0.9rem', outline: 'none', color: '#1a3a5c' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#1a3a5c', marginBottom: '5px', textTransform: 'uppercase' }}>Apellido</label>
                      <input type="text" placeholder="Pérez" value={apellido} onChange={e => setApellido(e.target.value)} style={{ width: '100%', padding: '11px 13px', borderRadius: '8px', border: '2px solid #e8eef5', fontFamily: "'Barlow', sans-serif", fontSize: '0.9rem', outline: 'none', color: '#1a3a5c' }} />
                    </div>
                  </div>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#1a3a5c', marginBottom: '5px', textTransform: 'uppercase' }}>Correo electrónico</label>
                    <input type="email" placeholder="correo@ejemplo.cl" value={email} onChange={e => setEmail(e.target.value)} style={{ width: '100%', padding: '11px 13px', borderRadius: '8px', border: '2px solid #e8eef5', fontFamily: "'Barlow', sans-serif", fontSize: '0.9rem', outline: 'none', color: '#1a3a5c' }} />
                  </div>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#1a3a5c', marginBottom: '5px', textTransform: 'uppercase' }}>Contraseña</label>
                    <input type="password" placeholder="Mínimo 8 caracteres" value={password} onChange={e => setPassword(e.target.value)} style={{ width: '100%', padding: '11px 13px', borderRadius: '8px', border: '2px solid #e8eef5', fontFamily: "'Barlow', sans-serif", fontSize: '0.9rem', outline: 'none', color: '#1a3a5c' }} />
                  </div>
                  {mensaje && <p style={{ fontSize: '0.85rem', color: mensaje.startsWith('✅') ? '#27ae60' : '#dc2626', marginBottom: '10px', textAlign: 'center' }}>{mensaje}</p>}
                  <button onClick={handleRegistro} disabled={loading} style={{ width: '100%', padding: '13px', borderRadius: '8px', background: loading ? '#8fa3b8' : '#27ae60', color: 'white', border: 'none', fontFamily: "'Barlow Condensed', sans-serif", fontSize: '1.1rem', fontWeight: 700, textTransform: 'uppercase', cursor: loading ? 'not-allowed' : 'pointer', marginTop: '8px' }}>
                    {loading ? 'Creando cuenta...' : 'Crear cuenta gratis'}
                  </button>                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* WHATSAPP */}
      <a href="https://wa.me/56912345678?text=Hola%20NetDriver%2C%20tengo%20una%20consulta." target="_blank" rel="noopener" style={{
        position: 'fixed', bottom: '28px', right: '28px', zIndex: 300,
        width: '58px', height: '58px', borderRadius: '50%',
        background: '#25D366', display: 'flex', alignItems: 'center',
        justifyContent: 'center', textDecoration: 'none',
        boxShadow: '0 4px 20px rgba(37,211,102,0.5)',
        fontSize: '1.8rem'
      }}>💬</a>
    </>
  )
}