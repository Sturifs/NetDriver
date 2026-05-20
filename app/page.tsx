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
  const [nombreEmpresa, setNombreEmpresa] = useState('')
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
        email,
        nombre_empresa: activeModal === 'empresa' ? nombreEmpresa : null
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
  <div style={{ background: '#020D24', minHeight: '100vh', fontFamily: "'Inter', sans-serif", color: 'white' }}>
    <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px', height: '85px', background: 'rgba(2,13,36,0.98)', borderBottom: '1px solid rgba(255,255,255,0.08)', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100 }}>
      <img src="/NetDriver_Logo.png" alt="NetDriver" style={{ height: '75px', objectFit: 'contain' }} />
      <div style={{ display: 'flex', gap: '32px' }}>
        {['Cómo funciona','Planes','Para empresas','Referidos','Recursos'].map(item => (
          <span key={item} style={{ color: 'rgba(255,255,255,0.72)', fontSize: '0.88rem', cursor: 'pointer' }}>{item}</span>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '10px' }}>
        <button onClick={() => openModal('conductor')} style={{ padding: '9px 22px', borderRadius: '8px', border: '1.5px solid rgba(255,255,255,0.35)', background: 'transparent', color: 'white', fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer' }}>Soy Conductor</button>
        <button onClick={() => openModal('empresa')} style={{ padding: '9px 22px', borderRadius: '8px', border: 'none', background: '#22c55e', color: 'white', fontSize: '0.88rem', fontWeight: 700, cursor: 'pointer' }}>Soy Empresa</button>
      </div>
    </nav>

    <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', padding: '80px 40px 40px', position: 'relative', background: 'url(/truck_bg.png) center center / cover no-repeat', backgroundBlendMode: 'overlay' }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(34,197,94,0.04) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 70% at 60% 50%, rgba(7,26,62,0.8) 0%, transparent 70%)' }} />

      {/* TEXTO IZQUIERDA */}
      <div style={{ position: 'relative', zIndex: 2, width: '35%', minWidth: '300px', flexShrink: 0 }}>

        <h1 style={{ fontSize: 'clamp(3rem,5vw,4.4rem)', fontWeight: 900, lineHeight: 1.0, marginBottom: '16px', letterSpacing: '-1px' }}>
          LA RED DE<br/>
          <span style={{ color: '#22c55e' }}>TRANSPORTE</span><br/>
          DE CHILE
        </h1>
        <p style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,0.62)', lineHeight: 1.65, marginBottom: '30px' }}>Conductores, operadores y empresas conectados en una sola plataforma.</p>
        <div style={{ display: 'flex', gap: '12px', marginBottom: '44px' }}>
          <button onClick={() => openModal('conductor')} style={{ padding: '13px 28px', borderRadius: '8px', border: 'none', background: '#22c55e', color: 'white', fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer' }}>Soy Conductor →</button>
          <button onClick={() => openModal('empresa')} style={{ padding: '13px 28px', borderRadius: '8px', border: '1.5px solid rgba(255,255,255,0.28)', background: 'transparent', color: 'white', fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer' }}>Soy Empresa</button>
        </div>
        <div style={{ display: 'flex', gap: '40px' }}>
          {[['+2.400','Conductores'],['+380','Empresas'],['15','Regiones']].map(([num,lbl]) => (
            <div key={lbl}><div style={{ fontSize: '1.5rem', fontWeight: 900 }}>{num}</div><div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.48)', marginTop: '2px' }}>{lbl}</div></div>
          ))}
        </div>
      </div>

      {/* MAPA + TARJETAS DERECHA */}
      <div style={{ position: 'relative', zIndex: 2, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '860px', marginRight: '420px' }}>

        {/* TARJETAS IZQUIERDA DEL MAPA - Norte, Centro, Sur */}
        <div style={{ position: 'absolute', left: '220px', top: '22%', zIndex: 3 }}>
          <div style={{ background: 'rgba(7,26,62,0.95)', border: '1px solid rgba(255,193,7,0.4)', borderRadius: '12px', padding: '11px 14px', width: '175px', backdropFilter: 'blur(10px)' }}>
            <div style={{ fontSize: '0.68rem', color: '#fbbf24', fontWeight: 700, marginBottom: '5px' }}>⚡ PEGA RELÁMPAGO</div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, marginBottom: '2px' }}>Iquique → Antofagasta</div>
            <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.55)', marginBottom: '4px' }}>Camión tolva • 2 días</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 900, color: '#22c55e' }}>$320.000</div>
          </div>
        </div>
        <div style={{ position: 'absolute', left: '120px', top: '40%', zIndex: 3 }}>
          <div style={{ background: 'rgba(7,26,62,0.95)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '12px', padding: '11px 14px', width: '175px', backdropFilter: 'blur(10px)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'linear-gradient(135deg,#22c55e,#16a34a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>👤</div>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700 }}>Carlos M. ✓</div>
                <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.55)' }}>Conductor A2 • Stgo</div>
                <div style={{ color: '#fbbf24', fontSize: '0.65rem' }}>★★★★★ 4.9</div>
              </div>
            </div>
          </div>
        </div>
        <div style={{ position: 'absolute', left: '30px', top: '72%', zIndex: 3 }}>
          <div style={{ background: 'rgba(7,26,62,0.95)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '12px', padding: '11px 14px', width: '175px', backdropFilter: 'blur(10px)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>👤</div>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700 }}>Jorge P. ✓</div>
                <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.55)' }}>Conductor A4 • Conce</div>
                <div style={{ color: '#fbbf24', fontSize: '0.65rem' }}>★★★★★ 5.0</div>
              </div>
            </div>
          </div>
        </div>

        {/* IMAGEN MAPA - fondo transparente con lighten */}
        <img src="/chile_map.png" alt="Mapa Chile" style={{ width: '520px', height: '960px', objectFit: 'contain', position: 'relative', zIndex: 2, mixBlendMode: 'lighten' }} />

        {/* TARJETAS DERECHA DEL MAPA - Norte, Centro, Sur */}
        <div style={{ position: 'absolute', right: '50px', top: '12%', zIndex: 3 }}>
          <div style={{ background: 'rgba(7,26,62,0.95)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '12px', padding: '12px 14px', width: '185px', backdropFilter: 'blur(10px)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg,#22c55e,#16a34a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>👤</div>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700 }}>Conductor Verificado ✓</div>
                <div style={{ color: '#fbbf24', fontSize: '0.68rem' }}>★★★★★ 4.9 (230)</div>
              </div>
            </div>
          </div>
        </div>
        <div style={{ position: 'absolute', right: '240px', top: '50%', zIndex: 3 }}>
          <div style={{ background: 'rgba(7,26,62,0.95)', border: '1px solid rgba(37,99,235,0.3)', borderRadius: '10px', padding: '9px 11px', width: '155px', backdropFilter: 'blur(10px)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700 }}>📋 Oferta de trabajo</div>
              <span style={{ color: '#22c55e' }}>+</span>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.6)', marginBottom: '2px' }}>📍 Santiago</div>
            <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.6)', marginBottom: '8px' }}>Traslado de maquinaria</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#22c55e' }}>$850.000</div>
          </div>
        </div>
        <div style={{ position: 'absolute', right: '140px', top: '71%', zIndex: 3 }}>
          <div style={{ background: 'rgba(7,26,62,0.95)', border: '1px solid rgba(255,193,7,0.4)', borderRadius: '12px', padding: '11px 14px', width: '185px', backdropFilter: 'blur(10px)' }}>
            <div style={{ fontSize: '0.68rem', color: '#fbbf24', fontWeight: 700, marginBottom: '5px' }}>⚡ PEGA RELÁMPAGO</div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, marginBottom: '2px' }}>Calama → Copiapó</div>
            <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.55)', marginBottom: '4px' }}>Maquinaria pesada • 3 días</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 900, color: '#22c55e' }}>$650.000</div>
          </div>
        </div>
      </div>
    </section>

    <div style={{ background: 'rgba(7,26,62,0.95)', borderTop: '1px solid rgba(37,99,235,0.15)', borderBottom: '1px solid rgba(37,99,235,0.15)', padding: '18px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ fontSize: '2rem' }}>📄</div>
        <div><span style={{ fontWeight: 700 }}>¿Eres conductor profesional? </span><span style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.62)' }}>Descarga tu Hoja de Vida desde el Registro Civil de Chile.</span></div>
      </div>
      <a href="https://www.registrocivil.cl" target="_blank" rel="noopener" style={{ padding: '11px 22px', borderRadius: '8px', background: 'white', color: '#0f172a', textDecoration: 'none', fontSize: '0.88rem', fontWeight: 700, whiteSpace: 'nowrap' }}>↓ DESCARGA TU HOJA DE VIDA</a>
    </div>

    <section style={{ background: 'white', padding: '72px 40px', color: '#0f172a' }}>
      <div style={{ textAlign: 'center', marginBottom: '52px' }}>
        <div style={{ fontSize: '0.78rem', color: '#22c55e', fontWeight: 700, letterSpacing: '0.14em', marginBottom: '12px' }}>¿CÓMO FUNCIONA?</div>
        <h2 style={{ fontSize: '2.2rem', fontWeight: 900 }}>SIMPLE. RÁPIDO. EFECTIVO.</h2>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '56px', maxWidth: '920px', margin: '0 auto' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '28px', paddingBottom: '14px', borderBottom: '2px solid #e2e8f0' }}>
            <span>👤</span><span style={{ fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.06em', color: '#2563eb' }}>PARA CONDUCTORES</span>
          </div>
          {[['01','Crea tu perfil','Regístrate gratis y carga tu experiencia, licencias y disponibilidad.'],['02','Genera tu CV gratis 📄','Crea tu CV profesional y descárgalo. Plan Premium sin sello de agua.'],['03','Postula y acepta Pegas Relámpago ⚡','Accede a ofertas de trabajo en transporte y logística en todo Chile.'],['04','Recibe alertas 🔔','Alertas por correo o WhatsApp antes de que venzan tus documentos.']].map(([num,title,desc]) => (
            <div key={num} style={{ display: 'flex', gap: '18px', marginBottom: '26px' }}>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#2563eb', minWidth: '36px' }}>{num}</div>
              <div><div style={{ fontWeight: 700, marginBottom: '5px', fontSize: '0.92rem' }}>{title}</div><div style={{ fontSize: '0.82rem', color: '#64748b', lineHeight: 1.55 }}>{desc}</div></div>
            </div>
          ))}
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '28px', paddingBottom: '14px', borderBottom: '2px solid #e2e8f0' }}>
            <span>🏢</span><span style={{ fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.06em', color: '#22c55e' }}>PARA EMPRESAS</span>
          </div>
          {[['01','Registra tu empresa','Crea una cuenta empresarial y comienza a usar la plataforma.'],['02','Publica ofertas de trabajo','Sube tus vacantes y recibe postulaciones de conductores verificados.'],['03','Certifica tus equipos 🛡️','Registra y certifica tu flota de vehículos y maquinaria.'],['04','Acceso ilimitado con Plan Pro','Búsqueda ilimitada y pretensiones de renta de candidatos.']].map(([num,title,desc]) => (
            <div key={num} style={{ display: 'flex', gap: '18px', marginBottom: '26px' }}>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#22c55e', minWidth: '36px' }}>{num}</div>
              <div><div style={{ fontWeight: 700, marginBottom: '5px', fontSize: '0.92rem' }}>{title}</div><div style={{ fontSize: '0.82rem', color: '#64748b', lineHeight: 1.55 }}>{desc}</div></div>
            </div>
          ))}
        </div>
      </div>
    </section>

    <section style={{ background: '#f8fafc', padding: '72px 40px', color: '#0f172a' }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{ fontSize: '0.78rem', color: '#22c55e', fontWeight: 700, letterSpacing: '0.14em', marginBottom: '10px' }}>PLANES Y PRECIOS</div>
        <h2 style={{ fontSize: '2.2rem', fontWeight: 900, marginBottom: '28px' }}>ELIGE TU PLAN</h2>
        <div style={{ display: 'inline-flex', background: '#e2e8f0', borderRadius: '8px', padding: '4px' }}>
          <button style={{ padding: '9px 28px', borderRadius: '6px', border: 'none', background: '#1e3a5f', color: 'white', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer' }}>CONDUCTOR</button>
          <button style={{ padding: '9px 28px', borderRadius: '6px', border: 'none', background: 'transparent', color: '#94a3b8', fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer' }}>EMPRESA</button>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', maxWidth: '820px', margin: '0 auto' }}>
        <div style={{ background: 'white', borderRadius: '16px', padding: '30px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700, letterSpacing: '0.1em', marginBottom: '10px' }}>CONDUCTOR / OPERADOR</div>
          <div style={{ fontWeight: 900, fontSize: '1rem', marginBottom: '6px' }}>PLAN GRATUITO</div>
          <div style={{ fontSize: '2.4rem', fontWeight: 900, marginBottom: '4px' }}>GRATIS</div>
          <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: '22px' }}>Sin tarjeta de crédito</div>
          {['Aplicar a 1 oferta al mes','1 Pega Relámpago ⚡ al mes','CV profesional con sello NetDriver','Link de perfil compartible','Alertas de vencimiento','Programa de referidos'].map(f => (
            <div key={f} style={{ display: 'flex', gap: '8px', marginBottom: '9px', fontSize: '0.85rem' }}><span style={{ color: '#22c55e', fontWeight: 700 }}>✓</span>{f}</div>
          ))}
          <button onClick={() => openModal('conductor')} style={{ width: '100%', padding: '13px', marginTop: '22px', borderRadius: '9px', border: '1.5px solid #1e3a5f', background: 'transparent', color: '#1e3a5f', fontWeight: 700, cursor: 'pointer' }}>Comenzar gratis</button>
        </div>
        <div style={{ background: '#1e3a5f', borderRadius: '16px', padding: '30px', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '18px', right: '18px', background: '#22c55e', color: 'white', fontSize: '0.68rem', fontWeight: 700, padding: '4px 12px', borderRadius: '20px' }}>MÁS POPULAR</div>
          <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.55)', fontWeight: 700, letterSpacing: '0.1em', marginBottom: '10px' }}>CONDUCTOR / OPERADOR</div>
          <div style={{ fontWeight: 900, fontSize: '1rem', color: 'white', marginBottom: '6px' }}>PLAN PREMIUM</div>
          <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#22c55e', marginBottom: '4px' }}>$2.000</div>
          <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.48)', marginBottom: '22px' }}>por mes - cancela cuando quieras</div>
          {['Postulaciones ilimitadas','Pegas Relámpago ⚡ ilimitadas','CV sin sello de agua','Sello NetDriver Verificado ✓','Mayor visibilidad','Pretensión de renta visible para empresas Pro','Soporte prioritario'].map(f => (
            <div key={f} style={{ display: 'flex', gap: '8px', marginBottom: '9px', fontSize: '0.85rem', color: 'rgba(255,255,255,0.85)' }}><span style={{ color: '#22c55e', fontWeight: 700 }}>✓</span>{f}</div>
          ))}
          <button onClick={() => openModal('conductor')} style={{ width: '100%', padding: '13px', marginTop: '22px', borderRadius: '9px', border: 'none', background: '#22c55e', color: 'white', fontWeight: 700, cursor: 'pointer' }}>Suscribirse ahora</button>
        </div>
      </div>
    </section>

    <section style={{ background: '#020D24', padding: '56px 40px' }}>
      <div style={{ maxWidth: '860px', margin: '0 auto', background: 'rgba(7,26,62,0.85)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '16px', padding: '36px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '28px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ fontSize: '2.8rem' }}>🤝</div>
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: '6px' }}>PROGRAMA DE <span style={{ color: '#22c55e' }}>REFERIDOS</span></div>
            <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.55)' }}>Invita a otros conductores y obtén meses premium gratis.</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'center' }}><div style={{ fontSize: '2rem', fontWeight: 900, color: '#22c55e' }}>5</div><div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)' }}>AMIGOS REFERIDOS</div></div>
          <div style={{ fontSize: '1.4rem', color: 'rgba(255,255,255,0.35)' }}>→</div>
          <div style={{ textAlign: 'center' }}><div style={{ fontSize: '2rem', fontWeight: 900, color: '#22c55e' }}>6</div><div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)' }}>MESES PREMIUM GRATIS</div></div>
          <button onClick={() => openModal('conductor')} style={{ padding: '12px 24px', borderRadius: '8px', border: 'none', background: '#22c55e', color: 'white', fontWeight: 700, cursor: 'pointer' }}>Únete y empieza a referir →</button>
        </div>
      </div>
    </section>

    <footer style={{ background: '#020D24', borderTop: '1px solid rgba(255,255,255,0.07)', padding: '52px 40px 24px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '36px', maxWidth: '1100px', margin: '0 auto 36px' }}>
        <div>
          <img src="/NetDriver_Logo.png" alt="NetDriver" style={{ height: '28px', objectFit: 'contain', marginBottom: '14px' }} />
          <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.48)', lineHeight: 1.65, maxWidth: '220px', marginBottom: '16px' }}>La plataforma que conecta conductores con empresas de transporte en todo Chile.</p>
          <div style={{ display: 'flex', gap: '10px' }}>
            {['f','in','▶'].map(s => (<div key={s} style={{ width: '32px', height: '32px', borderRadius: '6px', background: 'rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.82rem', cursor: 'pointer', color: 'rgba(255,255,255,0.6)' }}>{s}</div>))}
          </div>
        </div>
        {([['CONDUCTORES',['Cómo funciona','Plan Premium','Pegas Relámpago','Crear CV gratis','Programa Referidos']],['EMPRESAS',['Buscar conductores','Publicar ofertas','Certificar equipos','Plan Pro']],['NETDRIVER',['Sobre nosotros','Términos de uso','Privacidad','Contacto']]] as [string,string[]][]).map(([title,links]) => (
          <div key={title}><div style={{ fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.1em', marginBottom: '16px', color: 'rgba(255,255,255,0.45)' }}>{title}</div>{links.map(l => (<div key={l} style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.58)', marginBottom: '9px', cursor: 'pointer' }}>{l}</div>))}</div>
        ))}
      </div>
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '22px', display: 'flex', justifyContent: 'space-between', maxWidth: '1100px', margin: '0 auto', fontSize: '0.78rem', color: 'rgba(255,255,255,0.3)' }}>
        <span>© 2025 NetDriver.cl — Todos los derechos reservados.</span>
        <span>Hecho 🇨🇱 en Chile</span>
      </div>
    </footer>

    {activeModal && (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, padding: '20px' }}>
        <div style={{ background: '#0d1f3c', border: '1px solid rgba(34,197,94,0.25)', borderRadius: '20px', padding: '36px', width: '100%', maxWidth: '420px', position: 'relative' }}>
          <button onClick={() => setActiveModal(null)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
          <img src="/NetDriver_Logo.png" alt="NetDriver" style={{ height: '30px', objectFit: 'contain', marginBottom: '22px' }} />
          <div style={{ display: 'flex', gap: '6px', marginBottom: '22px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '4px' }}>
            {['login','registro'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab as 'login' | 'registro')} style={{ flex: 1, padding: '9px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.88rem', background: activeTab === tab ? '#22c55e' : 'transparent', color: activeTab === tab ? 'white' : 'rgba(255,255,255,0.5)' }}>{tab === 'login' ? 'Iniciar Sesión' : 'Registrarse'}</button>
            ))}
          </div>
          {activeTab === 'registro' && (
            <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '4px' }}>
              {(['conductor','empresa'] as const).map(plan => (
                <button key={plan} onClick={() => setActivePlan(plan)} style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', background: activePlan === plan ? 'rgba(34,197,94,0.3)' : 'transparent', color: activePlan === plan ? 'white' : 'rgba(255,255,255,0.5)' }}>{plan === 'conductor' ? '🚛 Conductor' : '🏢 Empresa'}</button>
              ))}
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {activeTab === 'registro' && activePlan === 'empresa' && (
              <input value={nombreEmpresa} onChange={e => setNombreEmpresa(e.target.value)} placeholder="Nombre de la empresa" style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'white', fontSize: '0.9rem', outline: 'none' }} />
            )}
            {activeTab === 'registro' && (
              <>
                <input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Nombre" style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'white', fontSize: '0.9rem', outline: 'none' }} />
                <input value={apellido} onChange={e => setApellido(e.target.value)} placeholder="Apellido" style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'white', fontSize: '0.9rem', outline: 'none' }} />
              </>
            )}
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" type="email" style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'white', fontSize: '0.9rem', outline: 'none' }} />
            <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Contraseña" type="password" style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'white', fontSize: '0.9rem', outline: 'none' }} />
            {mensaje && <div style={{ fontSize: '0.85rem', color: mensaje.includes('Error') ? '#f87171' : '#22c55e', textAlign: 'center' }}>{mensaje}</div>}
            <button onClick={activeTab === 'login' ? handleLogin : handleRegistro} disabled={loading} style={{ padding: '13px', borderRadius: '10px', border: 'none', marginTop: '4px', background: '#22c55e', color: 'white', fontSize: '0.95rem', fontWeight: 700, cursor: loading ? 'wait' : 'pointer' }}>{loading ? 'Procesando...' : activeTab === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}</button>
          </div>
        </div>
      </div>
    )}
  </div>
  )
}
