'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../supabase'

export default function DashboardConductor() {
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [navActivo, setNavActivo] = useState('inicio')

  useEffect(() => {
    const cargar = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/'); return }
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (data?.tipo !== 'conductor') { router.push('/'); return }
      setProfile(data)
      setLoading(false)
    }
    cargar()
  }, [router])

  const handleCerrarSesion = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f4f7fa' }}>
      <p style={{ color: '#1a3a5c', fontFamily: 'sans-serif', fontSize: '1.1rem' }}>Cargando tu dashboard...</p>
    </div>
  )

  const navItems = [
    { id: 'inicio', icono: '🏠', label: 'Inicio' },
    { id: 'buscar', icono: '🔍', label: 'Buscar empleos' },
    { id: 'documentos', icono: '🗂️', label: 'Documentos' },
    { id: 'equipos', icono: '🚛', label: 'Mis equipos' },
    { id: 'actividad', icono: '📊', label: 'Actividad' },
    { id: 'mensajes', icono: '💬', label: 'Mensajes', badge: '5', badgeColor: '#e74c3c' },
    { id: 'notificaciones', icono: '🔔', label: 'Notificaciones', badge: '3', badgeColor: '#e74c3c' },
  ]

  const empleos = [
    { empresa: 'CA', nombre: 'Conductor A4', compania: 'Transporte Andes', lugar: 'Antofagasta, II Región', tags: ['Minera', 'Turnos 7x7'], salario: '$1.800.000 - $2.200.000', tiempo: 'Hace 2 horas', destacado: true, color: '#1a3a5c',
      logo: <svg width="38" height="38" viewBox="0 0 38 38"><rect width="38" height="38" rx="8" fill="#1a3a5c"/><path d="M7 26 L19 10 L31 26 Z" fill="none" stroke="white" strokeWidth="2.5"/><circle cx="19" cy="20" r="3" fill="#27ae60"/></svg> },
    { empresa: 'LS', nombre: 'Conductor A5', compania: 'Logística Sur Ltda.', lugar: 'Santiago, RM', tags: ['Reparto', 'Lunes a Viernes'], salario: '$950.000 - $1.200.000', tiempo: 'Hace 5 horas', destacado: false, color: '#27ae60',
      logo: <svg width="38" height="38" viewBox="0 0 38 38"><rect width="38" height="38" rx="8" fill="#e8f5e9"/><rect x="8" y="16" width="14" height="10" rx="2" fill="#27ae60"/><rect x="22" y="20" width="8" height="6" rx="1" fill="#1b5e20"/><circle cx="13" cy="27" r="2.5" fill="#1a3a5c"/><circle cx="26" cy="27" r="2.5" fill="#1a3a5c"/></svg> },
    { empresa: 'MN', nombre: 'Conductor A4', compania: 'Minera del Norte', lugar: 'Calama, II Región', tags: ['Minera', 'Turnos 14x14'], salario: '$2.100.000 - $2.500.000', tiempo: 'Hace 1 día', destacado: false, color: '#e67e22',
      logo: <svg width="38" height="38" viewBox="0 0 38 38"><rect width="38" height="38" rx="8" fill="#fef3e2"/><polygon points="19,8 30,28 8,28" fill="#e67e22"/><rect x="15" y="20" width="8" height="8" fill="#fef3e2"/></svg> },
    { empresa: 'BB', nombre: 'Conductor Profesional', compania: 'Buses Bio Bio', lugar: 'Concepción, VIII Región', tags: ['Pasajeros', 'Turnos Rotativos'], salario: '$1.100.000 - $1.400.000', tiempo: 'Hace 1 día', destacado: false, color: '#2563eb',
      logo: <svg width="38" height="38" viewBox="0 0 38 38"><rect width="38" height="38" rx="8" fill="#e8f0fe"/><rect x="6" y="14" width="26" height="14" rx="3" fill="#2563eb"/><rect x="8" y="11" width="22" height="5" rx="2" fill="#1a3a5c"/><circle cx="12" cy="29" r="2.5" fill="#1a3a5c"/><circle cx="26" cy="29" r="2.5" fill="#1a3a5c"/><rect x="10" y="17" width="5" height="4" rx="1" fill="white"/><rect x="17" y="17" width="5" height="4" rx="1" fill="white"/><rect x="24" y="17" width="5" height="4" rx="1" fill="white"/></svg> },
    { empresa: 'TR', nombre: 'Conductor A3', compania: 'Transportes Rápido', lugar: 'Valparaíso, V Región', tags: ['Carga', 'Lunes a Sábado'], salario: '$850.000 - $1.100.000', tiempo: 'Hace 2 días', destacado: false, color: '#8e44ad',
      logo: <svg width="38" height="38" viewBox="0 0 38 38"><rect width="38" height="38" rx="8" fill="#f3e8fd"/><path d="M6 22 L20 22 L20 16 L28 16 L32 22 L32 26 L6 26 Z" fill="#8e44ad"/><circle cx="12" cy="27" r="2.5" fill="#4a1b8c"/><circle cx="27" cy="27" r="2.5" fill="#4a1b8c"/><rect x="8" y="18" width="6" height="4" rx="1" fill="white"/></svg> },
    { empresa: 'SC', nombre: 'Conductor A5', compania: 'Servicios del Centro', lugar: 'Santiago, RM', tags: ['Urbano', 'Turnos Rotativos'], salario: '$900.000 - $1.050.000', tiempo: 'Hace 2 días', destacado: false, color: '#e74c3c',
      logo: <svg width="38" height="38" viewBox="0 0 38 38"><rect width="38" height="38" rx="8" fill="#fee2e2"/><circle cx="19" cy="17" r="7" fill="none" stroke="#e74c3c" strokeWidth="2.5"/><path d="M14 24 Q19 28 24 24" fill="none" stroke="#e74c3c" strokeWidth="2.5" strokeLinecap="round"/><line x1="19" y1="10" x2="19" y2="14" stroke="#e74c3c" strokeWidth="2"/></svg> },
  ]

  const relampagos = [
    { titulo: 'Traslado Camión', lugar: 'Santiago → Rancagua', precio: '$65.000', hora: 'Hoy, 14:00', licencia: 'A4', tiempo: '2h 15m restante' },
    { titulo: 'Reparto Ruta Corta', lugar: 'Puente Alto', precio: '$40.000', hora: 'Hoy, 16:00', licencia: 'A4 - A5', tiempo: '1h 40m restante' },
    { titulo: 'Traslado de Personal', lugar: 'Calama', precio: '$80.000', hora: 'Hoy, 18:00', licencia: 'A2 - A3', tiempo: '3h 25m restante' },
    { titulo: 'Entrega Express', lugar: 'Santiago Centro', precio: '$35.000', hora: 'Hoy, 13:30', licencia: 'A5', tiempo: '45m restante' },
    { titulo: 'Despacho Supermercado', lugar: 'Las Condes', precio: '$28.000', hora: 'Hoy, 15:00', licencia: 'A5', tiempo: '1h 10m restante' },
    { titulo: 'Traslado Maquinaria', lugar: 'Pudahuel → Quilicura', precio: '$95.000', hora: 'Hoy, 17:00', licencia: 'A2', tiempo: '2h 50m restante' },
  ]

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f4f7fa', fontFamily: "'Barlow', sans-serif" }}>

      {/* SIDEBAR */}
      <div style={{ width: '220px', minWidth: '220px', background: '#020D24', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, height: '100vh', overflowY: 'auto', zIndex: 50 }}>
        {/* Logo */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: '10px', background: '#020D24' }}>
          <img src="/NetDriver_Logo.png" alt="NetDriver" onClick={() => router.push('/')} style={{ height: '68px', width: '220px', objectFit: 'contain', cursor: 'pointer' }} />
        </div>
        {/* Perfil */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          {/* Avatar */}
          <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '12px' }}>
            <div style={{ position: 'relative', width: '72px', height: '72px' }}>
              <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'white', fontSize: '1.4rem', border: profile?.perfilCompleto ? '3px solid #22c55e' : '3px solid #2563eb' }}>
                {profile?.nombre?.[0]}{profile?.apellido?.[0]}
              </div>
              {profile?.perfilCompleto && (
                <div style={{ position: 'absolute', bottom: 0, right: 0, width: '20px', height: '20px', borderRadius: '50%', background: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: 'white', border: '2px solid #020D24' }}>✓</div>
              )}
            </div>
          </div>
          {/* Nombre */}
          <div style={{ marginBottom: '8px' }}>
            <div style={{ fontWeight: 700, color: 'white', fontSize: '0.95rem' }}>{profile?.nombre} {profile?.apellido}</div>
            <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', marginTop: '2px' }}>Conductor Profesional</div>
          </div>
          {/* Badges */}
          <div style={{ display: 'flex', justifyContent: 'flex-start', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
            <span style={{ background: 'rgba(39,174,96,0.15)', border: '1px solid rgba(39,174,96,0.4)', color: '#2ecc71', fontSize: '0.65rem', padding: '2px 8px', borderRadius: '20px' }}>✓ Perfil verificado</span>
            {profile?.perfilCompleto && (
              <span style={{ background: 'rgba(37,99,235,0.15)', border: '1px solid rgba(37,99,235,0.4)', color: '#60a5fa', fontSize: '0.65rem', padding: '2px 8px', borderRadius: '20px' }}>★ Perfil destacado</span>
            )}
          </div>
          {/* Estrellas */}
          <div onClick={() => router.push('/dashboard/conductor/resenas')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '6px', marginBottom: '12px', cursor: 'pointer' }}>
            <span style={{ color: '#f39c12', fontSize: '0.85rem' }}>★★★★★</span>
            <span style={{ color: 'white', fontSize: '0.85rem', fontWeight: 600 }}>4.8</span>
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem' }}>(128 reseñas)</span>
          </div>
          {/* Perfil incompleto */}
          {!profile?.perfilCompleto && (
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
              <button style={{ width: '100%', background: '#2563eb', border: 'none', color: 'white', borderRadius: '8px', padding: '8px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}>Completar perfil</button>
            </div>
          )}
          {/* Perfil completo */}
          {profile?.perfilCompleto && (
            <div>
              <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', marginBottom: '10px' }}>📅 Miembro desde 2026</div>
              <button style={{ width: '100%', background: '#2563eb', border: 'none', color: 'white', borderRadius: '8px', padding: '8px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}>⬇ Descargar CV</button>
            </div>
          )}
        </div>
        {/* Nav */}
        <nav style={{ flex: 1, padding: '10px 0' }}>
          {navItems.map(item => (
            <button key={item.id} onClick={() => setNavActivo(item.id)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 20px', background: navActivo === item.id ? 'rgba(37,99,235,0.2)' : 'transparent', borderLeft: navActivo === item.id ? '3px solid #2563eb' : '3px solid transparent', border: 'none', color: navActivo === item.id ? 'white' : 'rgba(255,255,255,0.55)', fontSize: '0.85rem', cursor: 'pointer', textAlign: 'left' }}>
              <span>{item.icono}</span>
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge && <span style={{ background: item.badgeColor, color: 'white', fontSize: '0.65rem', padding: '1px 7px', borderRadius: '10px' }}>{item.badge}</span>}
            </button>
          ))}
        </nav>
        {/* Premium */}
        <div style={{ margin: '12px', background: 'rgba(255,193,7,0.08)', border: '1px solid rgba(255,193,7,0.25)', borderRadius: '10px', padding: '14px' }}>
          <div style={{ color: '#f39c12', fontWeight: 700, fontSize: '0.9rem', marginBottom: '6px' }}>⚡ Hazte Premium</div>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.78rem', lineHeight: 1.5, marginBottom: '10px' }}>Aumenta tus oportunidades y destaca ante las empresas.</p>
          <button style={{ width: '100%', background: 'transparent', border: '1px solid #f39c12', color: '#f39c12', padding: '7px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>Ver planes</button>
        </div>
      </div>

      {/* MAIN */}
      <div style={{ marginLeft: '220px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Topbar */}
        <div style={{ background: 'white', borderBottom: '1px solid #e8eef5', padding: '0 24px', height: '60px', display: 'flex', alignItems: 'center', gap: '16px', position: 'sticky', top: 0, zIndex: 40 }}>
          <input placeholder="Buscar empleos, empresas o rutas..." style={{ display: 'none', flex: 1, maxWidth: '420px', background: '#f4f7fa', border: '1px solid #e8eef5', borderRadius: '8px', padding: '8px 14px', fontSize: '0.88rem', outline: 'none', color: '#1a3a5c' }} />
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '16px' }}>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '0.85rem' }}>{profile?.nombre?.[0]}{profile?.apellido?.[0]}</div>
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1a3a5c' }}>{profile?.nombre} {profile?.apellido}</div>
                <div style={{ fontSize: '0.75rem', color: '#8fa3b8' }}>Conductor Profesional</div>
              </div>
            </div>
            <button onClick={handleCerrarSesion} style={{ padding: '7px 16px', borderRadius: '6px', background: 'transparent', border: '1px solid #e8eef5', color: '#8fa3b8', fontSize: '0.8rem', cursor: 'pointer' }}>Salir</button>
          </div>
        </div>

        {/* Contenido */}
        <div style={{ flex: 1, padding: '28px 28px', display: 'flex', gap: '24px' }}>
          {/* Columna principal */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1a3a5c', marginBottom: '4px' }}>¡Hola, {profile?.nombre}! 👋</h1>
            <p style={{ color: '#8fa3b8', fontSize: '0.9rem', marginBottom: '24px' }}>Aquí tienes las mejores oportunidades para ti.</p>

            {/* Empleos destacados */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#1a3a5c' }}>Empleos destacados para ti</h2>
              <button style={{ background: 'transparent', border: 'none', color: '#2563eb', fontSize: '0.85rem', cursor: 'pointer' }}>Ver todos →</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' }}>
              {empleos.map((e, i) => (
                <div key={i} style={{ background: 'white', borderRadius: '12px', padding: '16px', border: '1px solid #e8eef5', cursor: 'pointer' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <div style={{ width: '38px', height: '38px', flexShrink: 0 }}>{e.logo}</div>
                    {e.destacado && <span style={{ background: '#e8f5e9', color: '#1b5e20', fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>Destacado</span>}
                  </div>
                  <div style={{ fontWeight: 700, color: '#1a3a5c', marginBottom: '2px' }}>{e.nombre}</div>
                  <div style={{ fontSize: '0.88rem', color: '#8fa3b8', marginBottom: '2px' }}>{e.compania}</div>
                  <div style={{ fontSize: '0.88rem', color: '#8fa3b8', marginBottom: '8px' }}>{e.lugar}</div>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '10px' }}>
                    {e.tags.map(t => <span key={t} style={{ fontSize: '0.75rem', color: '#8fa3b8', background: '#f4f7fa', padding: '2px 8px', borderRadius: '4px' }}>{t}</span>)}
                  </div>
                  <div style={{ fontWeight: 700, color: '#1a3a5c', marginBottom: '4px' }}>{e.salario}</div>
                  <div style={{ fontSize: '0.78rem', color: '#8fa3b8', marginBottom: '12px' }}>Publicado {e.tiempo}</div>
                  <button style={{ width: '100%', background: 'transparent', border: '1px solid #2563eb', color: '#2563eb', padding: '7px', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}>Postular</button>
                </div>
              ))}
            </div>

            {/* Pegas relámpago */}
            <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '12px', padding: '18px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#92400e' }}>⚡ Pega Relámpago</h2>
                <button style={{ background: 'transparent', border: 'none', color: '#2563eb', fontSize: '0.85rem', cursor: 'pointer' }}>Ver todas →</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                {relampagos.map((r, i) => (
                  <div key={i} style={{ background: 'white', border: '1px solid #fde68a', borderRadius: '10px', padding: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ background: '#fee2e2', color: '#991b1b', fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>Urgente</span>
                      <span style={{ fontSize: '0.75rem', color: '#92400e' }}>{r.tiempo}</span>
                    </div>
                    <div style={{ fontWeight: 700, color: '#1a3a5c', marginBottom: '2px' }}>{r.titulo}</div>
                    <div style={{ fontSize: '0.88rem', color: '#8fa3b8', marginBottom: '6px' }}>{r.lugar}</div>
                    <div style={{ fontWeight: 700, color: '#27ae60', fontSize: '1rem', marginBottom: '4px' }}>{r.precio}</div>
                    <div style={{ fontSize: '0.78rem', color: '#8fa3b8', marginBottom: '10px' }}>🕐 {r.hora} &nbsp; 📋 {r.licencia}</div>
                    <button style={{ width: '100%', background: '#27ae60', border: 'none', color: 'white', padding: '7px', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}>⚡ ¡Lo tomo!</button>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: '0.8rem', color: '#92400e', marginTop: '12px' }}>⚡ Las Pega Relámpago son trabajos de corta duración. ¡Gana dinero extra cuando quieras!</p>
            </div>



            {/* Postulaciones recientes */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#1a3a5c' }}>Mis postulaciones recientes</h2>
                <button style={{ background: 'transparent', border: 'none', color: '#2563eb', fontSize: '0.85rem', cursor: 'pointer' }}>Ver todas →</button>
              </div>
              <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e8eef5', overflow: 'hidden' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr', padding: '10px 16px', background: '#f4f7fa', borderBottom: '1px solid #e8eef5' }}>
                  {['Puesto', 'Empresa', 'Fecha', 'Estado'].map(h => (
                    <span key={h} style={{ fontSize: '0.72rem', fontWeight: 700, color: '#8fa3b8', textTransform: 'uppercase' }}>{h}</span>
                  ))}
                </div>
                {[
                  { puesto: 'Conductor A4', empresa: 'Minera Escondida', fecha: '12 May 2026', estado: 'En evaluación', color: '#2563eb', bg: '#e8f0fe' },
                  { puesto: 'Reparto Urbano', empresa: 'Logística Sur', fecha: '10 May 2026', estado: 'Entrevista', color: '#27ae60', bg: '#e8f5e9' },
                  { puesto: 'Conductor A5', empresa: 'Transporte Andes', fecha: '08 May 2026', estado: 'Descartado', color: '#e74c3c', bg: '#fee2e2' },
                ].map((p, i, arr) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr', padding: '12px 16px', borderBottom: i < arr.length - 1 ? '1px solid #f4f7fa' : 'none', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, color: '#1a3a5c', fontSize: '0.88rem' }}>{p.puesto}</span>
                    <span style={{ fontSize: '0.85rem', color: '#8fa3b8' }}>{p.empresa}</span>
                    <span style={{ fontSize: '0.82rem', color: '#8fa3b8' }}>{p.fecha}</span>
                    <span style={{ background: p.bg, color: p.color, fontSize: '0.75rem', fontWeight: 600, padding: '3px 10px', borderRadius: '10px', display: 'inline-block' }}>{p.estado}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>{/* Columna derecha */}
          <div style={{ width: '260px', minWidth: '260px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Ingresos */}
            <div style={{ background: 'white', borderRadius: '12px', padding: '18px', border: '1px solid #e8eef5' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <span style={{ fontWeight: 700, color: '#1a3a5c', fontSize: '0.95rem' }}>💰 Ingresos</span>
                <span style={{ fontSize: '0.78rem', color: '#8fa3b8' }}>Este mes</span>
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#27ae60', marginBottom: '4px' }}>$485.000</div>
              <div style={{ fontSize: '0.78rem', color: '#8fa3b8', marginBottom: '14px' }}>Total ganado a la fecha</div>
              <div style={{ borderTop: '1px solid #f4f7fa', paddingTop: '12px' }}>
                {[['Enero - Marzo', '$1.240.000'], ['Abril - Mayo', '$485.000']].map(([periodo, monto]) => (
                  <div key={periodo} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0' }}>
                    <span style={{ fontSize: '0.82rem', color: '#8fa3b8' }}>{periodo}</span>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1a3a5c' }}>{monto}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: '12px', background: '#f4f7fa', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.72rem', color: '#8fa3b8', marginBottom: '2px', textTransform: 'uppercase', fontWeight: 600 }}>Total acumulado 2026</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1a3a5c' }}>$1.725.000</div>
              </div>
            </div>
            {/* Postulaciones */}
            <div style={{ background: 'white', borderRadius: '12px', padding: '16px', border: '1px solid #e8eef5' }}>
              <div style={{ fontWeight: 700, color: '#1a3a5c', fontSize: '0.9rem', marginBottom: '12px' }}>Mis Postulaciones</div>
              {[['🕐 En evaluación', '5'], ['👥 Entrevista', '2'], ['✕ Descartadas', '1']].map(([label, count]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f4f7fa' }}>
                  <span style={{ fontSize: '0.88rem', color: '#8fa3b8' }}>{label}</span>
                  <span style={{ fontWeight: 700, color: '#1a3a5c', fontSize: '0.82rem' }}>{count}</span>
                </div>
              ))}
              <button style={{ width: '100%', background: 'transparent', border: 'none', color: '#2563eb', fontSize: '0.88rem', cursor: 'pointer', marginTop: '8px' }}>Ver todas →</button>
            </div>
            {/* Calificación */}
            <div onClick={() => router.push('/dashboard/conductor/resenas')} style={{ background: 'white', borderRadius: '12px', padding: '16px', border: '1px solid #e8eef5', cursor: 'pointer' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}><div style={{ fontWeight: 700, color: '#1a3a5c', fontSize: '0.9rem' }}>Mi Calificación</div><span style={{ fontSize: '0.75rem', color: '#2563eb' }}>Ver todas →</span></div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1a3a5c' }}>4.8</div>
              <div style={{ color: '#f39c12', fontSize: '1rem', margin: '4px 0' }}>★★★★★</div>
              <div style={{ fontSize: '0.78rem', color: '#8fa3b8', marginBottom: '10px' }}>128 calificaciones</div>
              {[['Puntualidad', 98], ['Conducción', 96], ['Responsabilidad', 94], ['Trato', 96]].map(([label, val]) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                  <span style={{ fontSize: '0.75rem', color: '#8fa3b8', width: '90px' }}>{label}</span>
                  <div style={{ flex: 1, height: '4px', background: '#f4f7fa', borderRadius: '2px' }}>
                    <div style={{ width: `${val}%`, height: '4px', background: '#2563eb', borderRadius: '2px' }} />
                  </div>
                </div>
              ))}
            </div>
            {/* Estadísticas */}
            <div style={{ background: 'white', borderRadius: '12px', padding: '16px', border: '1px solid #e8eef5' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontWeight: 700, color: '#1a3a5c', fontSize: '0.9rem' }}>Estadísticas</span>
                <span style={{ color: '#8fa3b8', fontSize: '0.78rem' }}>Este mes</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', textAlign: 'center', gap: '8px' }}>
                {[['12', 'Postulaciones'], ['3', 'Entrevistas'], ['1', 'Trabajos']].map(([num, label]) => (
                  <div key={label}>
                    <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1a3a5c' }}>{num}</div>
                    <div style={{ fontSize: '0.72rem', color: '#8fa3b8' }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
// redeploy Mon Jun  8 21:41:54 -04 2026
