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
    { id: 'publicar', icono: '📢', label: 'Publicar Empleo' },
    { id: 'empleos', icono: '💼', label: 'Mis Empleos' },
    { id: 'postulaciones', icono: '📋', label: 'Postulaciones', badge: '23', badgeColor: '#e74c3c' },
    { id: 'guardados', icono: '🔖', label: 'Conductores Guardados', badge: '12', badgeColor: '#2563eb' },
    { id: 'busqueda', icono: '🔍', label: 'Búsqueda de Conductores', badge: 'Nuevo', badgeColor: '#8e44ad' },
    { id: 'relampago', icono: '⚡', label: 'Pega Relámpago' },
    { id: 'entrevistas', icono: '🤝', label: 'Entrevistas', badge: '8', badgeColor: '#e74c3c' },
    { id: 'contrataciones', icono: '✅', label: 'Contrataciones' },
    { id: 'planes', icono: '💳', label: 'Planes y Facturación' },
    { id: 'reportes', icono: '📊', label: 'Reportes y Estadísticas' },
    { id: 'opiniones', icono: '⭐', label: 'Opiniones y Calificaciones' },
    { id: 'configuracion', icono: '⚙️', label: 'Configuración de Empresa' },
    { id: 'usuarios', icono: '👥', label: 'Usuarios y Permisos' },
  ]

  const empleosActivos = [
    { puesto: 'Conductor A4 - Minería', tipo: 'Transporte de carga', lugar: 'Calama, II Región', postulaciones: 15, vencimiento: '20 May 2026', estado: 'Activo' },
    { puesto: 'Conductor A5 - Ruta Norte', tipo: 'Transporte de carga', lugar: 'Antofagasta, II Región', postulaciones: 11, vencimiento: '18 May 2026', estado: 'Activo' },
    { puesto: 'Conductor Profesional - Buses', tipo: 'Transporte de pasajeros', lugar: 'Copiapó, III Región', postulaciones: 8, vencimiento: '25 May 2026', estado: 'Activo' },
    { puesto: 'Conductor A4 - Faena', tipo: 'Transporte de personal', lugar: 'Salamanca, IV Región', postulaciones: 6, vencimiento: '12 May 2026', estado: 'Activo' },
  ]

  const postulacionesRecientes = [
    { nombre: 'José Martínez', licencia: 'Conductor A4', exp: '12 años exp.', lugar: 'Calama', match: 100, tiempo: 'Hace 2 horas', verificado: true },
    { nombre: 'Luis Andaur', licencia: 'Conductor A5', exp: '8 años exp.', lugar: 'Antofagasta', match: 92, tiempo: 'Hace 5 horas', verificado: true },
    { nombre: 'Diego Araya', licencia: 'Conductor Profesional', exp: '10 años exp.', lugar: 'Copiapó', match: 88, tiempo: 'Hace 1 día', verificado: true },
  ]

  const alertas = [
    { icono: '🤝', texto: 'Tienes 8 entrevistas pendientes', sub: 'No olvides responder a los conductores.', tiempo: 'Hace 1 hora', color: '#e8f0fe' },
    { icono: '⏰', texto: 'Tu empleo "Conductor A4 - Minería" está por vencer', sub: 'Vence en 2 días.', tiempo: 'Hace 3 horas', color: '#fff8e1' },
    { icono: '✅', texto: 'Nuevo conductor verificado en tu zona', sub: 'Revisa perfiles que podrían interesarte.', tiempo: 'Hace 5 horas', color: '#e8f5e9' },
  ]

  const accesosRapidos = [
    { icono: '🔍', titulo: 'Búsqueda avanzada de conductores', sub: 'Encuentra el perfil ideal', badge: null },
    { icono: '📄', titulo: 'Plantillas de empleo', sub: 'Ahorra tiempo publicando', badge: null },
    { icono: '🗃️', titulo: 'Base de datos de conductores', sub: 'Accede a conductores verificados', badge: 'Nuevo' },
    { icono: '📈', titulo: 'Reportes de contratación', sub: 'Analiza tu rendimiento', badge: null },
  ]

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f4f7fa', fontFamily: 'sans-serif' }}>
      <div style={{ width: '230px', minWidth: '230px', background: '#020D24', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, height: '100vh', overflowY: 'auto', zIndex: 50 }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: '10px', background: '#020D24' }}>
          <img src="/NetDriver_Logo.png" alt="NetDriver" onClick={() => router.push('/')} style={{ height: '68px', width: '220px', objectFit: 'contain', cursor: 'pointer' }} />
        </div>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '10px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px', flexShrink: 0 }}>
            <span style={{ color: '#e67e22', fontWeight: 900, fontSize: '1rem', letterSpacing: '-1px' }}>NTS</span>
          </div>
          <div style={{ fontWeight: 700, color: 'white', fontSize: '0.95rem' }}>{profile?.nombre_empresa || 'Mi Empresa'}</div>
          <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', margin: '2px 0 8px' }}>Empresa de Transporte</div>
          <span style={{ background: 'rgba(39,174,96,0.15)', border: '1px solid rgba(39,174,96,0.4)', color: '#2ecc71', fontSize: '0.7rem', padding: '2px 10px', borderRadius: '20px' }}>✓ Empresa verificada</span>
        </div>
        <nav style={{ flex: 1, padding: '8px 0' }}>
          {navItems.map(item => (
            <button key={item.id} onClick={() => setNavActivo(item.id)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 20px', background: navActivo === item.id ? 'rgba(37,99,235,0.2)' : 'transparent', borderLeft: navActivo === item.id ? '3px solid #2563eb' : '3px solid transparent', border: 'none', color: navActivo === item.id ? 'white' : 'rgba(255,255,255,0.55)', fontSize: '0.82rem', cursor: 'pointer', textAlign: 'left' }}>
              <span>{item.icono}</span>
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge && <span style={{ background: item.badgeColor, color: 'white', fontSize: '0.62rem', padding: '1px 7px', borderRadius: '10px' }}>{item.badge}</span>}
            </button>
          ))}
        </nav>
        <div style={{ margin: '12px', background: 'rgba(255,193,7,0.08)', border: '1px solid rgba(255,193,7,0.25)', borderRadius: '10px', padding: '14px' }}>
          <div style={{ color: '#f39c12', fontWeight: 700, fontSize: '0.88rem', marginBottom: '4px' }}>👑 Plan Empresarial Pro</div>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.76rem', lineHeight: 1.5, marginBottom: '10px' }}>Publica empleos ilimitados y accede a filtros avanzados.</p>
          <button style={{ width: '100%', background: 'transparent', border: '1px solid #f39c12', color: '#f39c12', padding: '7px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}>Ver mi plan</button>
        </div>
        <div style={{ padding: '12px 20px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: '0.76rem', color: 'rgba(255,255,255,0.3)', marginBottom: '8px' }}>Nuestro equipo está para apoyarte.</div>
          <button style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', padding: '7px', borderRadius: '6px', fontSize: '0.76rem', cursor: 'pointer' }}>🎧 Contactar soporte</button>
        </div>
      </div>

      <div style={{ marginLeft: '230px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ background: 'white', borderBottom: '1px solid #e8eef5', padding: '0 24px', height: '60px', display: 'flex', alignItems: 'center', gap: '16px', position: 'sticky', top: 0, zIndex: 40 }}>
          <input placeholder="Buscar conductores por cargo, licencia, experiencia..." style={{ flex: 1, maxWidth: '440px', background: '#f4f7fa', border: '1px solid #e8eef5', borderRadius: '8px', padding: '8px 14px', fontSize: '0.88rem', outline: 'none', color: '#1a3a5c' }} />
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '0.9rem' }}>
                {profile?.nombre?.[0]}{profile?.apellido?.[0]}
              </div>
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1a3a5c' }}>{profile?.nombre} {profile?.apellido}</div>
                <div style={{ fontSize: '0.75rem', color: '#8fa3b8' }}>Administrador</div>
              </div>
            </div>
            <button onClick={handleCerrarSesion} style={{ padding: '7px 16px', borderRadius: '6px', background: 'transparent', border: '1px solid #e8eef5', color: '#8fa3b8', fontSize: '0.8rem', cursor: 'pointer' }}>Salir</button>
          </div>
        </div>

        <div style={{ flex: 1, padding: '28px', display: 'flex', gap: '24px' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
              <div>
                <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1a3a5c', marginBottom: '4px' }}>¡Bienvenido, {profile?.nombre}! 👋</h1>
                <p style={{ color: '#8fa3b8', fontSize: '0.9rem' }}>Gestiona tus procesos de contratación y encuentra a los mejores conductores.</p>
              </div>
              <button style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f4f7fa', border: '1px solid #e8eef5', color: '#1a3a5c', padding: '9px 18px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>👤 Ir a búsqueda avanzada</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
              {[
                { icono: '💼', label: 'Empleos activos', valor: '14', cambio: '+2 desde la semana pasada', color: '#2563eb', bg: '#e8f0fe' },
                { icono: '📋', label: 'Postulaciones nuevas', valor: '23', cambio: '+8 desde la semana pasada', color: '#27ae60', bg: '#e8f5e9' },
                { icono: '🤝', label: 'Entrevistas pendientes', valor: '8', cambio: '+2 desde la semana pasada', color: '#e67e22', bg: '#fef3e2' },
                { icono: '✅', label: 'Contrataciones este mes', valor: '5', cambio: '+1 desde el mes pasado', color: '#8e44ad', bg: '#f3e8fd' },
              ].map(m => (
                <div key={m.label} style={{ background: 'white', borderRadius: '12px', padding: '18px', border: '1px solid #e8eef5' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: m.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>{m.icono}</div>
                    <span style={{ fontSize: '0.82rem', color: '#8fa3b8' }}>{m.label}</span>
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: m.color, marginBottom: '4px' }}>{m.valor}</div>
                  <div style={{ fontSize: '0.75rem', color: '#8fa3b8' }}>{m.cambio}</div>
                </div>
              ))}
            </div>

            <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e8eef5', marginBottom: '24px', overflow: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #f4f7fa' }}>
                <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#1a3a5c' }}>Mis empleos activos</h2>
                <button style={{ background: 'transparent', border: 'none', color: '#2563eb', fontSize: '0.85rem', cursor: 'pointer' }}>Ver todos</button>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f4f7fa' }}>
                    {['Puesto', 'Ubicación', 'Postulaciones', 'Vencimiento', 'Estado', 'Acciones'].map(h => (
                      <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '0.72rem', fontWeight: 700, color: '#8fa3b8', textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {empleosActivos.map((e, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f4f7fa' }}>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: 600, color: '#1a3a5c', fontSize: '0.88rem' }}>{e.puesto}</div>
                        <div style={{ fontSize: '0.78rem', color: '#8fa3b8' }}>{e.tipo}</div>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '0.85rem', color: '#8fa3b8' }}>📍 {e.lugar}</td>
                      <td style={{ padding: '12px 16px', fontSize: '0.88rem', fontWeight: 700, color: '#2563eb' }}>{e.postulaciones}</td>
                      <td style={{ padding: '12px 16px', fontSize: '0.82rem', color: e.vencimiento === '12 May 2026' ? '#e74c3c' : '#8fa3b8', fontWeight: e.vencimiento === '12 May 2026' ? 700 : 400 }}>{e.vencimiento}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ background: '#e8f5e9', color: '#1b5e20', fontSize: '0.75rem', fontWeight: 600, padding: '3px 10px', borderRadius: '10px' }}>{e.estado}</span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem' }}>👁</button>
                          <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem' }}>✏️</button>
                          <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem' }}>⋯</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ padding: '14px 20px' }}>
                <button style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', border: '1px dashed #e8eef5', color: '#2563eb', padding: '10px 20px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', width: '100%', justifyContent: 'center' }}>+ Publicar nuevo empleo</button>
              </div>
            </div>

            <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e8eef5', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #f4f7fa' }}>
                <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#1a3a5c' }}>Postulaciones recientes</h2>
                <button style={{ background: 'transparent', border: 'none', color: '#2563eb', fontSize: '0.85rem', cursor: 'pointer' }}>Ver todas</button>
              </div>
              {postulacionesRecientes.map((p, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '14px 20px', borderBottom: i < postulacionesRecientes.length - 1 ? '1px solid #f4f7fa' : 'none' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: ['#2563eb', '#27ae60', '#e67e22'][i], display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '0.9rem', flexShrink: 0 }}>
                    {p.nombre.split(' ').map((n: string) => n[0]).join('')}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                      <span style={{ fontWeight: 700, color: '#1a3a5c', fontSize: '0.92rem' }}>{p.nombre}</span>
                      {p.verificado && <span style={{ color: '#2563eb', fontSize: '0.85rem' }}>✓</span>}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#8fa3b8' }}>{p.licencia} · {p.exp} · {p.lugar}</div>
                  </div>
                  <span style={{ background: p.match === 100 ? '#e8f5e9' : p.match >= 90 ? '#e8f0fe' : '#fff8e1', color: p.match === 100 ? '#1b5e20' : p.match >= 90 ? '#1a3a5c' : '#92400e', fontSize: '0.78rem', fontWeight: 700, padding: '3px 10px', borderRadius: '10px' }}>{p.match}% Match</span>
                  <span style={{ fontSize: '0.78rem', color: '#8fa3b8' }}>{p.tiempo}</span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem' }}>👁</button>
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem' }}>💬</button>
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem' }}>⭐</button>
                  </div>
                </div>
              ))}
              <div style={{ padding: '12px 20px', textAlign: 'center' }}>
                <button style={{ background: 'transparent', border: 'none', color: '#2563eb', fontSize: '0.85rem', cursor: 'pointer' }}>Ver todas las postulaciones</button>
              </div>
            </div>

            <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e8eef5', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#1a3a5c' }}>Opiniones de conductores</h2>
                <button style={{ background: 'transparent', border: 'none', color: '#2563eb', fontSize: '0.85rem', cursor: 'pointer' }}>Ver todas</button>
              </div>
              <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
                <div style={{ textAlign: 'center', minWidth: '80px' }}>
                  <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#1a3a5c' }}>4.7</div>
                  <div style={{ color: '#f39c12', fontSize: '1.1rem' }}>★★★★½</div>
                  <div style={{ fontSize: '0.75rem', color: '#8fa3b8', marginTop: '4px' }}>128 opiniones</div>
                </div>
                <div style={{ flex: 1 }}>
                  {[['5 estrellas', 78], ['4 estrellas', 16], ['3 estrellas', 4], ['2 estrellas', 1], ['1 estrella', 1]].map(([label, pct]) => (
                    <div key={label as string} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                      <span style={{ fontSize: '0.78rem', color: '#8fa3b8', width: '70px' }}>{label}</span>
                      <div style={{ flex: 1, height: '6px', background: '#f4f7fa', borderRadius: '3px' }}>
                        <div style={{ width: `${pct}%`, height: '6px', background: '#2563eb', borderRadius: '3px' }} />
                      </div>
                      <span style={{ fontSize: '0.78rem', color: '#8fa3b8', width: '30px' }}>{pct}%</span>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', flex: 1 }}>
                  {[
                    { nombre: 'Pedro González', rating: '★★★★★', texto: 'Excelente empresa, buenas condiciones y cumplen con lo que ofrecen.', tiempo: 'Hace 3 días' },
                    { nombre: 'Verónica Soto', rating: '★★★★★', texto: 'Muy buena experiencia trabajando con Transportes Del Norte.', tiempo: 'Hace 1 semana' },
                  ].map((op, i) => (
                    <div key={i} style={{ background: '#f4f7fa', borderRadius: '10px', padding: '14px' }}>
                      <div style={{ fontWeight: 700, color: '#1a3a5c', fontSize: '0.88rem', marginBottom: '2px' }}>{op.nombre}</div>
                      <div style={{ color: '#f39c12', fontSize: '0.85rem', marginBottom: '6px' }}>{op.rating}</div>
                      <div style={{ fontSize: '0.8rem', color: '#8fa3b8', lineHeight: 1.5, marginBottom: '6px' }}>{op.texto}</div>
                      <div style={{ fontSize: '0.75rem', color: '#8fa3b8' }}>{op.tiempo}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div style={{ width: '380px', minWidth: '380px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ background: 'white', borderRadius: '12px', padding: '18px', border: '1px solid #e8eef5' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <span style={{ fontWeight: 700, color: '#1a3a5c', fontSize: '0.95rem' }}>Perfil de la empresa</span>
                <span style={{ color: '#2563eb', fontSize: '0.8rem', cursor: 'pointer' }}>Ver perfil público</span>
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: 'white', border: '1px solid #e8eef5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ color: '#e67e22', fontWeight: 900, fontSize: '0.95rem', letterSpacing: '-1px' }}>NTS</span>
              </div>
                <div>
                  <div style={{ fontWeight: 700, color: '#1a3a5c', fontSize: '0.92rem' }}>{profile?.nombre_empresa || profile?.nombre}</div>
                  <span style={{ background: 'rgba(39,174,96,0.1)', color: '#27ae60', fontSize: '0.7rem', padding: '1px 8px', borderRadius: '10px' }}>✓ Empresa verificada</span>
                  <div style={{ color: '#f39c12', fontSize: '0.85rem', marginTop: '4px' }}>★★★★½ <span style={{ color: '#8fa3b8', fontSize: '0.78rem' }}>(128 opiniones)</span></div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>
                <span style={{ fontSize: '0.78rem', color: '#8fa3b8' }}>🚚 Transporte y Logística</span>
                <span style={{ fontSize: '0.78rem', color: '#8fa3b8' }}>📍 Antofagasta, II Región</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', textAlign: 'center', background: '#f4f7fa', borderRadius: '8px', padding: '12px', marginBottom: '12px' }}>
                {[['Feb 2023', 'Miembro desde'], ['47', 'Empleos publicados'], ['32', 'Contrataciones']].map(([val, label]) => (
                  <div key={label}>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1a3a5c' }}>{val}</div>
                    <div style={{ fontSize: '0.7rem', color: '#8fa3b8', marginTop: '2px' }}>{label}</div>
                  </div>
                ))}
              </div>
              <button style={{ width: '100%', background: 'transparent', border: '1px solid #e8eef5', color: '#1a3a5c', padding: '8px', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}>✏️ Editar perfil de empresa</button>
            </div>

            <div style={{ background: 'white', borderRadius: '12px', padding: '18px', border: '1px solid #e8eef5' }}>
              <div style={{ fontWeight: 700, color: '#1a3a5c', fontSize: '0.95rem', marginBottom: '14px' }}>Accesos rápidos</div>
              {accesosRapidos.map((a, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: i < accesosRapidos.length - 1 ? '1px solid #f4f7fa' : 'none', cursor: 'pointer' }}>
                  <span style={{ fontSize: '1.2rem' }}>{a.icono}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1a3a5c' }}>{a.titulo}</span>
                      {a.badge && <span style={{ background: '#8e44ad', color: 'white', fontSize: '0.62rem', padding: '1px 6px', borderRadius: '8px' }}>{a.badge}</span>}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#8fa3b8' }}>{a.sub}</div>
                  </div>
                  <span style={{ color: '#8fa3b8', fontSize: '1rem' }}>›</span>
                </div>
              ))}
            </div>

            <div style={{ background: 'white', borderRadius: '12px', padding: '18px', border: '1px solid #e8eef5' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <span style={{ fontWeight: 700, color: '#1a3a5c', fontSize: '0.95rem' }}>Estadísticas de contratación</span>
                <span style={{ fontSize: '0.78rem', color: '#8fa3b8' }}>Este mes ▾</span>
              </div>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <svg viewBox="0 0 180 100" style={{ width: '100%' }}>
                    <line x1="30" y1="5" x2="30" y2="85" stroke="#e8eef5" strokeWidth="1"/>
                    <line x1="30" y1="85" x2="178" y2="85" stroke="#e8eef5" strokeWidth="1"/>
                    {[20,15,10,5,0].map((v, i) => (
                      <text key={v} x="25" y={10 + i*19} fontSize="7" fill="#8fa3b8" textAnchor="end">{v}</text>
                    ))}
                    <defs>
                      <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2563eb" stopOpacity="0.15"/>
                        <stop offset="100%" stopColor="#2563eb" stopOpacity="0"/>
                      </linearGradient>
                    </defs>
                    <polygon points="32,80 52,70 72,72 92,60 112,57 132,40 152,45 172,38 172,85 32,85" fill="url(#areaGrad)"/>
                    <polyline points="32,80 52,70 72,72 92,60 112,57 132,40 152,45 172,38" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    {[[32,80],[52,70],[72,72],[92,60],[112,57],[132,40],[152,45],[172,38]].map(([x,y],i) => (
                      <circle key={i} cx={x} cy={y} r="3" fill="white" stroke="#2563eb" strokeWidth="2"/>
                    ))}
                    {['1 May','5 May','10 May','15 May','20 May','25 May','31 May'].map((d,i) => (
                      <text key={d} x={32+i*24} y="95" fontSize="6" fill="#8fa3b8" textAnchor="middle">{d}</text>
                    ))}
                  </svg>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minWidth: '120px' }}>
                  {[['Postulaciones', '87'], ['Entrevistas', '18'], ['Contrataciones', '5'], ['Tasa de conversión', '5.7%']].map(([label, val]) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                      <span style={{ fontSize: '0.8rem', color: '#8fa3b8' }}>{label}</span>
                      <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1a3a5c' }}>{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ background: 'white', borderRadius: '12px', padding: '18px', border: '1px solid #e8eef5' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <span style={{ fontWeight: 700, color: '#1a3a5c', fontSize: '0.95rem' }}>Alertas y notificaciones</span>
                <span style={{ color: '#2563eb', fontSize: '0.8rem', cursor: 'pointer' }}>Ver todas</span>
              </div>
              {alertas.map((a, i) => (
                <div key={i} style={{ background: a.color, borderRadius: '8px', padding: '10px 12px', marginBottom: '10px' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1a3a5c', marginBottom: '4px' }}>{a.icono} {a.texto}</div>
                  <div style={{ fontSize: '0.78rem', color: '#8fa3b8', marginBottom: '4px' }}>{a.sub}</div>
                  <div style={{ fontSize: '0.72rem', color: '#8fa3b8' }}>{a.tiempo}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
