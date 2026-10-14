'use client'
import { ReactNode, useCallback, useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '../../supabase'
import { EmpresaContext, Contadores, esFaltaTabla } from './_lib/contexto'
import { CORREO_SOPORTE, RUTA, iniciales } from './_lib/datos'
import { C } from './_lib/ui'

const NAV = [
  { ruta: '', icono: '🏠', label: 'Inicio' },
  { ruta: '/publicar', icono: '📢', label: 'Publicar Empleo' },
  { ruta: '/empleos', icono: '💼', label: 'Mis Empleos', contador: 'empleosActivos' },
  { ruta: '/postulaciones', icono: '📋', label: 'Postulaciones', contador: 'postulacionesNuevas', color: '#e74c3c' },
  { ruta: '/guardados', icono: '🔖', label: 'Conductores Guardados', contador: 'guardados', color: '#2563eb' },
  { ruta: '/busqueda', icono: '🔍', label: 'Búsqueda de Conductores' },
  { ruta: '/relampago', icono: '⚡', label: 'Pega Relámpago' },
  { ruta: '/entrevistas', icono: '🤝', label: 'Entrevistas', contador: 'entrevistasProximas', color: '#e67e22' },
  { ruta: '/contrataciones', icono: '✅', label: 'Contrataciones' },
  { ruta: '/planes', icono: '💳', label: 'Planes y Facturación' },
  { ruta: '/reportes', icono: '📊', label: 'Reportes y Estadísticas' },
  { ruta: '/opiniones', icono: '⭐', label: 'Opiniones y Calificaciones' },
  { ruta: '/configuracion', icono: '⚙️', label: 'Configuración de Empresa' },
  { ruta: '/usuarios', icono: '👥', label: 'Usuarios y Permisos' },
] as const

const VACIO: Contadores = { postulacionesNuevas: 0, guardados: 0, entrevistasProximas: 0, empleosActivos: 0 }

export default function LayoutEmpresa({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [userId, setUserId] = useState('')
  const [perfil, setPerfil] = useState<any>(null)
  const [cargando, setCargando] = useState(true)
  const [contadores, setContadores] = useState<Contadores>(VACIO)
  const [faltaBaseDatos, setFaltaBaseDatos] = useState(false)
  const [menuMovil, setMenuMovil] = useState(false)
  const [busqueda, setBusqueda] = useState('')
  const [toast, setToast] = useState<{ texto: string; tipo: 'ok' | 'error' } | null>(null)

  const recargarPerfil = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/'); return }
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    if (data?.tipo !== 'empresa') { router.push('/dashboard'); return }
    setUserId(user.id)
    setPerfil(data)
  }, [router])

  const recargarContadores = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const ahora = new Date().toISOString()
    const [p, g, e, a] = await Promise.all([
      supabase.from('postulaciones').select('id', { count: 'exact', head: true }).eq('empresa_id', user.id).eq('estado', 'nueva'),
      supabase.from('conductores_guardados').select('conductor_id', { count: 'exact', head: true }).eq('empresa_id', user.id),
      supabase.from('entrevistas').select('id', { count: 'exact', head: true }).eq('empresa_id', user.id).eq('estado', 'programada').gte('fecha_hora', ahora),
      supabase.from('empleos').select('id', { count: 'exact', head: true }).eq('empresa_id', user.id).eq('estado', 'activo'),
    ])
    if ([p, g, e, a].some(r => esFaltaTabla(r.error))) { setFaltaBaseDatos(true); return }
    setFaltaBaseDatos(false)
    setContadores({ postulacionesNuevas: p.count || 0, guardados: g.count || 0, entrevistasProximas: e.count || 0, empleosActivos: a.count || 0 })
  }, [])

  useEffect(() => {
    (async () => {
      await recargarPerfil()
      await recargarContadores()
      setCargando(false)
    })()
  }, [recargarPerfil, recargarContadores])

  // Al cambiar de sección: cerrar menú móvil y refrescar contadores
  useEffect(() => { setMenuMovil(false); if (!cargando) recargarContadores() }, [pathname]) // eslint-disable-line react-hooks/exhaustive-deps

  const avisar = useCallback((texto: string, tipo: 'ok' | 'error' = 'ok') => {
    setToast({ texto, tipo })
    setTimeout(() => setToast(null), 3500)
  }, [])

  const cerrarSesion = async () => { await supabase.auth.signOut(); router.push('/') }

  const buscar = () => {
    const q = busqueda.trim()
    router.push(`${RUTA}/busqueda${q ? '?q=' + encodeURIComponent(q) : ''}`)
    // Si ya estamos en la búsqueda, avisar a la página para que aplique el texto
    if (pathname === `${RUTA}/busqueda`) window.dispatchEvent(new CustomEvent('nd-buscar', { detail: q }))
  }

  if (cargando || !perfil) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.bg }}>
      <p style={{ color: C.navy, fontFamily: 'sans-serif', fontSize: '1.1rem' }}>Cargando tu dashboard...</p>
    </div>
  )

  const activo = (ruta: string) => ruta === '' ? pathname === RUTA : pathname?.startsWith(RUTA + ruta)
  const nombreEmpresa = perfil.nombre_empresa || 'Mi Empresa'
  const esPro = perfil.plan === 'pro'

  return (
    <EmpresaContext.Provider value={{ userId, perfil, recargarPerfil, contadores, recargarContadores, faltaBaseDatos, avisar }}>
      <style>{`
        .nd-side { transform: translateX(0); transition: transform .2s; }
        .nd-main { margin-left: 230px; }
        .nd-hamb { display: none !important; }
        @media (max-width: 900px) {
          .nd-side { transform: translateX(-100%); }
          .nd-side.abierto { transform: translateX(0); }
          .nd-main { margin-left: 0; }
          .nd-hamb { display: inline-flex !important; }
          .nd-user-txt { display: none; }
        }
        .nd-nav:hover { background: rgba(255,255,255,0.04) !important; color: white !important; }
        .nd-grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
        .nd-grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
        .nd-cols { display: flex; gap: 24px; align-items: flex-start; }
        .nd-aside { width: 360px; min-width: 360px; display: flex; flex-direction: column; gap: 16px; }
        .nd-tabla { width: 100%; border-collapse: collapse; }
        .nd-scroll { overflow-x: auto; }
        @media (max-width: 1200px) { .nd-cols { flex-direction: column; } .nd-aside { width: 100%; min-width: 0; } }
        @media (max-width: 900px) { .nd-grid-4 { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 560px) { .nd-grid-4, .nd-grid-2 { grid-template-columns: 1fr; } }
      `}</style>

      <div style={{ display: 'flex', minHeight: '100vh', background: C.bg, fontFamily: 'sans-serif' }}>
        {menuMovil && <div onClick={() => setMenuMovil(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 45 }} />}

        <aside className={`nd-side ${menuMovil ? 'abierto' : ''}`} style={{ width: '230px', background: C.side, display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, height: '100vh', overflowY: 'auto', zIndex: 50 }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <img src="/NetDriver_Logo.png" alt="NetDriver" onClick={() => router.push('/')} style={{ height: '68px', width: '190px', objectFit: 'contain', cursor: 'pointer' }} />
          </div>

          <div onClick={() => router.push(`${RUTA}/configuracion`)} style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer' }} title="Editar datos de la empresa">
            <div style={{ width: '52px', height: '52px', borderRadius: '10px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px', overflow: 'hidden' }}>
              {perfil.logo_url
                ? <img src={perfil.logo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                : <span style={{ color: C.orange, fontWeight: 900, fontSize: '1rem', letterSpacing: '-1px' }}>{iniciales(nombreEmpresa)}</span>}
            </div>
            <div style={{ fontWeight: 700, color: 'white', fontSize: '0.95rem' }}>{nombreEmpresa}</div>
            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', margin: '2px 0 8px' }}>{perfil.rubro || 'Empresa de Transporte'}</div>
            <span style={{ background: esPro ? 'rgba(243,156,18,0.15)' : 'rgba(255,255,255,0.06)', border: `1px solid ${esPro ? 'rgba(243,156,18,0.4)' : 'rgba(255,255,255,0.15)'}`, color: esPro ? '#f39c12' : 'rgba(255,255,255,0.6)', fontSize: '0.7rem', padding: '2px 10px', borderRadius: '20px' }}>
              {esPro ? '👑 Plan Pro' : 'Plan Gratis'}
            </span>
          </div>

          <nav style={{ flex: 1, padding: '8px 0' }}>
            {NAV.map(item => {
              const on = activo(item.ruta)
              const n = 'contador' in item ? contadores[item.contador as keyof Contadores] : 0
              return (
                <button key={item.ruta} className="nd-nav" onClick={() => router.push(RUTA + item.ruta)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 20px', background: on ? 'rgba(37,99,235,0.2)' : 'transparent', border: 'none', borderLeft: `3px solid ${on ? C.blue : 'transparent'}`, color: on ? 'white' : 'rgba(255,255,255,0.55)', fontSize: '0.82rem', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }}>
                  <span>{item.icono}</span>
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {n > 0 && <span style={{ background: 'color' in item ? item.color : 'rgba(255,255,255,0.15)', color: 'white', fontSize: '0.62rem', padding: '1px 7px', borderRadius: '10px' }}>{n}</span>}
                </button>
              )
            })}
          </nav>

          <div style={{ margin: '12px', background: 'rgba(255,193,7,0.08)', border: '1px solid rgba(255,193,7,0.25)', borderRadius: '10px', padding: '14px' }}>
            <div style={{ color: '#f39c12', fontWeight: 700, fontSize: '0.88rem', marginBottom: '4px' }}>👑 Plan Empresarial Pro</div>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.76rem', lineHeight: 1.5, margin: '0 0 10px' }}>{esPro ? 'Tienes empleos ilimitados y filtros avanzados.' : 'Publica empleos ilimitados y accede a filtros avanzados.'}</p>
            <button onClick={() => router.push(`${RUTA}/planes`)} style={{ width: '100%', background: 'transparent', border: '1px solid #f39c12', color: '#f39c12', padding: '7px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>{esPro ? 'Ver mi plan' : 'Mejorar mi plan'}</button>
          </div>
          <div style={{ padding: '12px 20px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ fontSize: '0.76rem', color: 'rgba(255,255,255,0.3)', marginBottom: '8px' }}>Nuestro equipo está para apoyarte.</div>
            <a href={`mailto:${CORREO_SOPORTE}?subject=${encodeURIComponent('Soporte NetDriver - ' + nombreEmpresa)}`} style={{ display: 'block', textAlign: 'center', textDecoration: 'none', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', padding: '7px', borderRadius: '6px', fontSize: '0.76rem' }}>🎧 Contactar soporte</a>
          </div>
        </aside>

        <div className="nd-main" style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <header style={{ background: 'white', borderBottom: `1px solid ${C.border}`, padding: '0 24px', height: '60px', display: 'flex', alignItems: 'center', gap: '12px', position: 'sticky', top: 0, zIndex: 40 }}>
            <button className="nd-hamb" onClick={() => setMenuMovil(true)} aria-label="Abrir menú" style={{ background: 'none', border: `1px solid ${C.border}`, borderRadius: '8px', width: '36px', height: '36px', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '1.1rem' }}>☰</button>
            <form onSubmit={e => { e.preventDefault(); buscar() }} style={{ flex: 1, maxWidth: '440px', display: 'flex' }}>
              <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar conductores por nombre, licencia, comuna..." style={{ flex: 1, minWidth: 0, background: C.bg, border: `1px solid ${C.border}`, borderRadius: '8px 0 0 8px', padding: '8px 14px', fontSize: '0.88rem', outline: 'none', color: C.navy }} />
              <button type="submit" aria-label="Buscar" style={{ background: C.blue, color: 'white', border: 'none', borderRadius: '0 8px 8px 0', padding: '0 14px', cursor: 'pointer' }}>🔍</button>
            </form>
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '14px' }}>
              <button onClick={() => router.push(`${RUTA}/notificaciones`)} aria-label="Notificaciones" title="Notificaciones" style={{ position: 'relative', background: 'none', border: 'none', fontSize: '1.15rem', cursor: 'pointer' }}>
                🔔{(contadores.postulacionesNuevas + contadores.entrevistasProximas) > 0 && <span style={{ position: 'absolute', top: '-4px', right: '-6px', background: C.red, color: 'white', fontSize: '0.6rem', borderRadius: '10px', padding: '0 5px' }}>{contadores.postulacionesNuevas + contadores.entrevistasProximas}</span>}
              </button>
              <div onClick={() => router.push(`${RUTA}/configuracion`)} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} title="Mi cuenta">
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: C.blue, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '0.9rem' }}>{iniciales(perfil.nombre, perfil.apellido)}</div>
                <div className="nd-user-txt">
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: C.navy }}>{perfil.nombre} {perfil.apellido}</div>
                  <div style={{ fontSize: '0.75rem', color: C.muted }}>Administrador</div>
                </div>
              </div>
              <button onClick={cerrarSesion} style={{ padding: '7px 16px', borderRadius: '6px', background: 'transparent', border: `1px solid ${C.border}`, color: C.muted, fontSize: '0.8rem', cursor: 'pointer' }}>Salir</button>
            </div>
          </header>

          <main style={{ flex: 1, padding: '28px', minWidth: 0 }}>
            {faltaBaseDatos && (
              <div style={{ background: '#fff8e1', border: '1px solid #f3d27a', color: '#92400e', borderRadius: '10px', padding: '14px 16px', marginBottom: '20px', fontSize: '0.88rem' }}>
                <strong>Falta un paso en la base de datos.</strong> Ejecuta el archivo <code>supabase/dashboard-empresa.sql</code> en Supabase → SQL Editor para activar empleos, postulaciones y entrevistas.
              </div>
            )}
            {children}
          </main>
        </div>
      </div>

      {toast && (
        <div style={{ position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)', background: toast.tipo === 'ok' ? '#1b5e20' : '#b91c1c', color: 'white', padding: '12px 20px', borderRadius: '10px', fontSize: '0.88rem', zIndex: 300, boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}>{toast.texto}</div>
      )}
    </EmpresaContext.Provider>
  )
}
