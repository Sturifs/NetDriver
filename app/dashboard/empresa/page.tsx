'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../supabase'

export default function DashboardEmpresa() {
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [navActivo, setNavActivo] = useState('inicio')

  useEffect(() => {
    const cargar = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/'); return }
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (data?.tipo !== 'empresa') { router.push('/'); return }
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
    { id: 'conductores', icono: '🔍', label: 'Buscar conductores' },
    { id: 'ofertas', icono: '📢', label: 'Mis ofertas', badge: '3', badgeColor: '#2563eb' },
    { id: 'postulaciones', icono: '📋', label: 'Postulaciones', badge: '8', badgeColor: '#e74c3c' },
    { id: 'relampago', icono: '⚡', label: 'Pega relámpago' },
    { id: 'empresa', icono: '🏢', label: 'Mi empresa' },
    { id: 'mensajes', icono: '💬', label: 'Mensajes', badge: '4', badgeColor: '#e74c3c' },
    { id: 'notificaciones', icono: '🔔', label: 'Notificaciones', badge: '2', badgeColor: '#e74c3c' },
    { id: 'facturacion', icono: '💳', label: 'Facturación' },
  ]

  const conductores = [
    { iniciales: 'MP', nombre: 'Mario Pérez', licencia: 'A4 - A5', region: 'Santiago, RM', exp: '8 años', rating: '4.9', disponible: true, color: '#2563eb' },
    { iniciales: 'CG', nombre: 'Carlos González', licencia: 'A3 - A4', region: 'Antofagasta, II', exp: '5 años', rating: '4.7', disponible: true, color: '#27ae60' },
    { iniciales: 'RV', nombre: 'Roberto Vargas', licencia: 'A5', region: 'Valparaíso, V', exp: '12 años', rating: '4.8', disponible: false, color: '#e67e22' },
    { iniciales: 'JM', nombre: 'Juan Morales', licencia: 'A2 - A3', region: 'Concepción, VIII', exp: '3 años', rating: '4.6', disponible: true, color: '#8e44ad' },
  ]

  const postulaciones = [
    { cargo: 'Conductor A4 - Minería', conductor: 'Mario Pérez', fecha: '12 May 2026', estado: 'En evaluación', estadoColor: '#2563eb', estadoBg: '#e8f0fe' },
    { cargo: 'Reparto urbano', conductor: 'Luis Soto', fecha: '11 May 2026', estado: 'Entrevista', estadoColor: '#27ae60', estadoBg: '#e8f5e9' },
    { cargo: 'Conductor A4 - Minería', conductor: 'Pedro Rojas', fecha: '10 May 2026', estado: 'Descartado', estadoColor: '#e74c3c', estadoBg: '#fee2e2' },
  ]

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f4f7fa', fontFamily: "'Barlow', sans-serif" }}>

      {/* SIDEBAR */}
      <div style={{ width: '220px', minWidth: '220px', background: '#0f2540', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, height: '100vh', overflowY: 'auto', zIndex: 50 }}>
        <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <span style={{ fontSize: '1.3rem', fontWeight: 800, color: 'white' }}>🚛 NetDriver</span>
        </div>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#27ae60', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'white', fontSize: '1.1rem', marginBottom: '10px' }}>🏢</div>
          <div style={{ fontWeight: 700, color: 'white', fontSize: '0.95rem' }}>{profile?.nombre}</div>
          <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', margin: '2px 0 8px' }}>Empresa de Transporte</div>
          <span style={{ background: 'rgba(39,174,96,0.15)', border: '1px solid rgba(39,174,96,0.4)', color: '#2ecc71', fontSize: '0.7rem', padding: '2px 10px', borderRadius: '20px' }}>✓ Empresa verificada</span>
        </div>
        <nav style={{ flex: 1, padding: '10px 0' }}>
          {navItems.map(item => (
            <button key={item.id} onClick={() => setNavActivo(item.id)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 20px', background: navActivo === item.id ? 'rgba(39,174,96,0.2)' : 'transparent', borderLeft: navActivo === item.id ? '3px solid #27ae60' : '3px solid transparent', border: 'none', color: navActivo === item.id ? 'white' : 'rgba(255,255,255,0.55)', fontSize: '0.85rem', cursor: 'pointer', textAlign: 'left' }}>
              <span>{item.icono}</span>
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge && <span style={{ background: item.badgeColor, color: 'white', fontSize: '0.65rem', padding: '1px 7px', borderRadius: '10px' }}>{item.badge}</span>}
            </button>
          ))}
        </nav>
        <div style={{ margin: '12px', background: 'rgba(39,174,96,0.08)', border: '1px solid rgba(39,174,96,0.25)', borderRadius: '10px', padding: '14px' }}>
          <div style={{ color: '#27ae60', fontWeight: 700, fontSize: '0.9rem', marginBottom: '6px' }}>⭐ Plan Pro</div>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.78rem', lineHeight: 1.5, marginBottom: '10px' }}>Publica ofertas ilimitadas y accede a conductores verificados.</p>
          <button style={{ width: '100%', background: 'transparent', border: '1px solid #27ae60', color: '#27ae60', padding: '7px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>Ver planes</button>
        </div>
      </div>

      {/* MAIN */}
      <div style={{ marginLeft: '220px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Topbar */}
        <div style={{ background: 'white', borderBottom: '1px solid #e8eef5', padding: '0 24px', height: '60px', display: 'flex', alignItems: 'center', gap: '16px', position: 'sticky', top: 0, zIndex: 40 }}>
          <input placeholder="Buscar conductores, licencias o regiones..." style={{ flex: 1, maxWidth: '420px', background: '#f4f7fa', border: '1px solid #e8eef5', borderRadius: '8px', padding: '8px 14px', fontSize: '0.88rem', outline: 'none', color: '#1a3a5c' }} />
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ position: 'relative', cursor: 'pointer', fontSize: '1.2rem' }}>🔔<span style={{ position: 'absolute', top: '-4px', right: '-4px', background: '#e74c3c', color: 'white', fontSize: '0.6rem', width: '14px', height: '14px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>2</span></span>
            <span style={{ fontSize: '1.2rem', cursor: 'pointer' }}>💬</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: '#27ae60', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1rem' }}>🏢</div>
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1a3a5c' }}>{profile?.nombre}</div>
                <div style={{ fontSize: '0.75rem', color: '#8fa3b8' }}>Empresa de Transporte</div>
              </div>
            </div>
            <button onClick={handleCerrarSesion} style={{ padding: '7px 16px', borderRadius: '6px', background: 'transparent', border: '1px solid #e8eef5', color: '#8fa3b8', fontSize: '0.8rem', cursor: 'pointer' }}>Salir</button>
          </div>
        </div>

        <div style={{ flex: 1, padding: '28px' }}>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1a3a5c', marginBottom: '4px' }}>¡Hola, {profile?.nombre}! 👋</h1>
          <p style={{ color: '#8fa3b8', fontSize: '0.9rem', marginBottom: '24px' }}>Aquí tienes el resumen de tu actividad en NetDriver.</p>

          {/* Métricas */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
            {[
              { icono: '📢', label: 'Ofertas activas', valor: '3', color: '#2563eb', bg: '#e8f0fe' },
              { icono: '📋', label: 'Postulaciones', valor: '24', color: '#27ae60', bg: '#e8f5e9' },
              { icono: '👥', label: 'Conductores vistos', valor: '87', color: '#e67e22', bg: '#fef3e2' },
              { icono: '✅', label: 'Contrataciones', valor: '5', color: '#8e44ad', bg: '#f3e8fd' },
            ].map(m => (
              <div key={m.label} style={{ background: 'white', borderRadius: '12px', padding: '18px', border: '1px solid #e8eef5' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: m.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', marginBottom: '12px' }}>{m.icono}</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: m.color, marginBottom: '4px' }}>{m.valor}</div>
                <div style={{ fontSize: '0.82rem', color: '#8fa3b8' }}>{m.label}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '24px' }}>
            {/* Conductores disponibles */}
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#1a3a5c' }}>Conductores disponibles</h2>
                <button style={{ background: '#27ae60', color: 'white', border: 'none', borderRadius: '6px', padding: '7px 16px', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}>+ Publicar oferta</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '28px' }}>
                {conductores.map((c, i) => (
                  <div key={i} style={{ background: 'white', borderRadius: '12px', padding: '16px', border: '1px solid #e8eef5', display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: c.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '0.9rem', flexShrink: 0 }}>{c.iniciales}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                        <span style={{ fontWeight: 700, color: '#1a3a5c', fontSize: '0.92rem' }}>{c.nombre}</span>
                        <span style={{ background: c.disponible ? '#e8f5e9' : '#fee2e2', color: c.disponible ? '#1b5e20' : '#991b1b', fontSize: '0.68rem', fontWeight: 600, padding: '1px 8px', borderRadius: '10px' }}>{c.disponible ? 'Disponible' : 'No disponible'}</span>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#8fa3b8' }}>Licencia {c.licencia} · {c.region} · {c.exp} exp.</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ color: '#f39c12', fontSize: '0.85rem' }}>★ {c.rating}</div>
                      <button style={{ marginTop: '6px', background: 'transparent', border: '1px solid #2563eb', color: '#2563eb', borderRadius: '6px', padding: '5px 12px', fontSize: '0.78rem', cursor: 'pointer' }}>Ver perfil</button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Postulaciones recientes */}
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#1a3a5c', marginBottom: '14px' }}>Postulaciones recientes</h2>
              <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e8eef5', overflow: 'hidden' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr', padding: '10px 16px', background: '#f4f7fa', borderBottom: '1px solid #e8eef5' }}>
                  {['Puesto', 'Conductor', 'Fecha', 'Estado'].map(h => (
                    <span key={h} style={{ fontSize: '0.72rem', fontWeight: 700, color: '#8fa3b8', textTransform: 'uppercase' }}>{h}</span>
                  ))}
                </div>
                {postulaciones.map((p, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr', padding: '12px 16px', borderBottom: i < postulaciones.length - 1 ? '1px solid #f4f7fa' : 'none', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, color: '#1a3a5c', fontSize: '0.85rem' }}>{p.cargo}</span>
                    <span style={{ fontSize: '0.85rem', color: '#8fa3b8' }}>{p.conductor}</span>
                    <span style={{ fontSize: '0.82rem', color: '#8fa3b8' }}>{p.fecha}</span>
                    <span style={{ background: p.estadoBg, color: p.estadoColor, fontSize: '0.75rem', fontWeight: 600, padding: '3px 10px', borderRadius: '10px', display: 'inline-block' }}>{p.estado}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Panel derecho */}
            <div style={{ width: '200px', minWidth: '200px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ background: 'white', borderRadius: '12px', padding: '16px', border: '1px solid #e8eef5' }}>
                <div style={{ fontWeight: 700, color: '#1a3a5c', fontSize: '0.9rem', marginBottom: '12px' }}>📢 Mis ofertas activas</div>
                {['Conductor A4 - Minería', 'Reparto urbano RM', 'Conductor largo alcance'].map((oferta, i) => (
                  <div key={i} style={{ padding: '8px 0', borderBottom: '1px solid #f4f7fa', fontSize: '0.82rem', color: '#1a3a5c' }}>
                    {oferta}
                    <div style={{ fontSize: '0.75rem', color: '#8fa3b8', marginTop: '2px' }}>{[8, 3, 13][i]} postulantes</div>
                  </div>
                ))}
                <button style={{ width: '100%', background: '#27ae60', color: 'white', border: 'none', borderRadius: '6px', padding: '8px', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', marginTop: '12px' }}>+ Nueva oferta</button>
              </div>
              <div style={{ background: 'white', borderRadius: '12px', padding: '16px', border: '1px solid #e8eef5' }}>
                <div style={{ fontWeight: 700, color: '#1a3a5c', fontSize: '0.9rem', marginBottom: '12px' }}>📊 Estadísticas</div>
                {[['Visitas al perfil', '142'], ['Conductores contactados', '18'], ['Tasa de respuesta', '94%']].map(([label, val]) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f4f7fa' }}>
                    <span style={{ fontSize: '0.78rem', color: '#8fa3b8' }}>{label}</span>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1a3a5c' }}>{val}</span>
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
