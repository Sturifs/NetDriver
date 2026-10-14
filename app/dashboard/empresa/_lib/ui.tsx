'use client'
import { CSSProperties, ReactNode, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { colorMatch, estadoPostulacion, ESTADOS_EMPLEO, iniciales } from './datos'

export const C = {
  navy: '#1a3a5c', muted: '#8fa3b8', bg: '#f4f7fa', border: '#e8eef5', blue: '#2563eb',
  green: '#27ae60', orange: '#e67e22', purple: '#8e44ad', red: '#e74c3c', side: '#020D24',
}

export const inputStyle: CSSProperties = {
  width: '100%', background: C.bg, border: `1px solid ${C.border}`, borderRadius: '8px', padding: '9px 12px',
  fontSize: '0.88rem', outline: 'none', color: C.navy, boxSizing: 'border-box', fontFamily: 'inherit',
}

export function Card({ children, style, padding = '18px' }: { children: ReactNode; style?: CSSProperties; padding?: string }) {
  return <div style={{ background: 'white', borderRadius: '12px', border: `1px solid ${C.border}`, padding, ...style }}>{children}</div>
}

export function CardHeader({ titulo, accion, onAccion }: { titulo: ReactNode; accion?: string; onAccion?: () => void }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: `1px solid ${C.bg}` }}>
      <h2 style={{ fontSize: '1rem', fontWeight: 700, color: C.navy, margin: 0 }}>{titulo}</h2>
      {accion && <LinkBtn onClick={onAccion}>{accion}</LinkBtn>}
    </div>
  )
}

export function PageHeader({ titulo, sub, children }: { titulo: ReactNode; sub?: ReactNode; children?: ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: C.navy, margin: '0 0 4px' }}>{titulo}</h1>
        {sub && <p style={{ color: C.muted, fontSize: '0.9rem', margin: 0 }}>{sub}</p>}
      </div>
      {children && <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>{children}</div>}
    </div>
  )
}

type BtnProps = { children: ReactNode; onClick?: () => void; href?: string; variante?: 'primario' | 'secundario' | 'peligro' | 'verde'; disabled?: boolean; style?: CSSProperties; title?: string; type?: 'button' | 'submit' }
export function Btn({ children, onClick, href, variante = 'primario', disabled, style, title, type = 'button' }: BtnProps) {
  const v = {
    primario: { background: C.blue, color: 'white', border: `1px solid ${C.blue}` },
    secundario: { background: 'white', color: C.navy, border: `1px solid ${C.border}` },
    peligro: { background: 'white', color: C.red, border: `1px solid #f5c6c2` },
    verde: { background: '#22c55e', color: 'white', border: '1px solid #22c55e' },
  }[variante]
  const st: CSSProperties = {
    ...v, padding: '9px 16px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600,
    cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.6 : 1, display: 'inline-flex',
    alignItems: 'center', gap: '6px', whiteSpace: 'nowrap', fontFamily: 'inherit', textDecoration: 'none', ...style,
  }
  if (href && !disabled) return <a href={href} title={title} style={st} {...(href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{children}</a>
  return <button type={type} title={title} onClick={onClick} disabled={disabled} style={st}>{children}</button>
}

export function LinkBtn({ children, onClick, style }: { children: ReactNode; onClick?: () => void; style?: CSSProperties }) {
  return <button type="button" onClick={onClick} style={{ background: 'transparent', border: 'none', color: C.blue, fontSize: '0.85rem', cursor: 'pointer', padding: 0, fontFamily: 'inherit', ...style }}>{children}</button>
}

export function IconBtn({ children, onClick, title, href }: { children: ReactNode; onClick?: () => void; title: string; href?: string | null }) {
  const st: CSSProperties = { background: C.bg, border: `1px solid ${C.border}`, borderRadius: '8px', cursor: 'pointer', fontSize: '0.95rem', width: '34px', height: '34px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', color: C.navy }
  if (href) return <a href={href} target="_blank" rel="noopener noreferrer" title={title} aria-label={title} style={st}>{children}</a>
  return <button type="button" title={title} aria-label={title} onClick={onClick} style={st}>{children}</button>
}

export function Badge({ children, color, bg }: { children: ReactNode; color: string; bg: string }) {
  return <span style={{ background: bg, color, fontSize: '0.75rem', fontWeight: 600, padding: '3px 10px', borderRadius: '10px', whiteSpace: 'nowrap' }}>{children}</span>
}
export const BadgeEstadoPostulacion = ({ estado }: { estado: string }) => { const e = estadoPostulacion(estado); return <Badge color={e.color} bg={e.bg}>{e.label}</Badge> }
export const BadgeEstadoEmpleo = ({ estado }: { estado: string }) => { const e = ESTADOS_EMPLEO[estado] || ESTADOS_EMPLEO.activo; return <Badge color={e.color} bg={e.bg}>{e.label}</Badge> }
export const BadgeMatch = ({ match }: { match: number | null }) => match == null ? null : <Badge {...colorMatch(match)}>{match}% Match</Badge>

export function Avatar({ nombre, apellido, foto, size = 44, color = C.blue }: { nombre?: string; apellido?: string; foto?: string | null; size?: number; color?: string }) {
  if (foto) return <img src={foto} alt="" style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
  return <div style={{ width: size, height: size, borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: size * 0.34, flexShrink: 0 }}>{iniciales(nombre, apellido)}</div>
}

export function Vacio({ icono, titulo, texto, accion, onAccion }: { icono: string; titulo: string; texto?: string; accion?: string; onAccion?: () => void }) {
  return (
    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
      <div style={{ fontSize: '2.2rem', marginBottom: '10px' }}>{icono}</div>
      <div style={{ fontWeight: 700, color: C.navy, marginBottom: '6px' }}>{titulo}</div>
      {texto && <div style={{ color: C.muted, fontSize: '0.88rem', marginBottom: accion ? '16px' : 0, maxWidth: '420px', margin: '0 auto' }}>{texto}</div>}
      {accion && <div style={{ marginTop: '16px' }}><Btn onClick={onAccion}>{accion}</Btn></div>}
    </div>
  )
}

export function Cargando({ texto = 'Cargando...' }: { texto?: string }) {
  return <div style={{ padding: '40px', textAlign: 'center', color: C.muted, fontSize: '0.9rem' }}>{texto}</div>
}

export function Aviso({ tipo = 'info', children }: { tipo?: 'info' | 'error' | 'ok' | 'alerta'; children: ReactNode }) {
  const s = { info: ['#e8f0fe', C.navy], error: ['#fdecec', '#b91c1c'], ok: ['#e8f5e9', '#1b5e20'], alerta: ['#fff8e1', '#92400e'] }[tipo]
  return <div style={{ background: s[0], color: s[1], borderRadius: '8px', padding: '10px 14px', fontSize: '0.85rem', marginBottom: '16px' }}>{children}</div>
}

export function Campo({ label, children, ayuda }: { label: string; children: ReactNode; ayuda?: string }) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <label style={{ fontSize: '0.72rem', fontWeight: 700, color: C.muted, textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>{label}</label>
      {children}
      {ayuda && <div style={{ fontSize: '0.75rem', color: C.muted, marginTop: '4px' }}>{ayuda}</div>}
    </div>
  )
}

export function Chips({ opciones, valor, onChange, multiple = false }: { opciones: string[]; valor: string | string[]; onChange: (v: any) => void; multiple?: boolean }) {
  const sel = (o: string) => multiple ? (valor as string[]).includes(o) : valor === o
  const toggle = (o: string) => {
    if (multiple) { const v = valor as string[]; onChange(v.includes(o) ? v.filter(x => x !== o) : [...v, o]) }
    else onChange(valor === o ? '' : o)
  }
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
      {opciones.map(o => (
        <button key={o} type="button" onClick={() => toggle(o)} style={{ background: sel(o) ? C.blue : C.bg, color: sel(o) ? 'white' : C.navy, border: `1px solid ${sel(o) ? C.blue : C.border}`, borderRadius: '6px', padding: '5px 11px', fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'inherit' }}>{o}</button>
      ))}
    </div>
  )
}

export function Tabs({ tabs, activo, onChange }: { tabs: { id: string; label: string; n?: number }[]; activo: string; onChange: (id: string) => void }) {
  return (
    <div style={{ display: 'flex', gap: '4px', borderBottom: `1px solid ${C.border}`, marginBottom: '16px', overflowX: 'auto' }}>
      {tabs.map(t => (
        <button key={t.id} type="button" onClick={() => onChange(t.id)} style={{ background: 'transparent', border: 'none', borderBottom: `2px solid ${activo === t.id ? C.blue : 'transparent'}`, color: activo === t.id ? C.blue : C.muted, fontWeight: 600, fontSize: '0.85rem', padding: '10px 14px', cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'inherit' }}>
          {t.label}{t.n != null && <span style={{ marginLeft: '6px', background: activo === t.id ? '#e8f0fe' : C.bg, borderRadius: '10px', padding: '1px 7px', fontSize: '0.72rem' }}>{t.n}</span>}
        </button>
      ))}
    </div>
  )
}

export function Modal({ abierto, onCerrar, titulo, children, ancho = 520 }: { abierto: boolean; onCerrar: () => void; titulo: string; children: ReactNode; ancho?: number }) {
  useEffect(() => {
    if (!abierto) return
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') onCerrar() }
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [abierto, onCerrar])
  if (!abierto) return null
  return (
    <div onClick={onCerrar} style={{ position: 'fixed', inset: 0, background: 'rgba(2,13,36,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '16px' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: '14px', width: '100%', maxWidth: ancho, maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: `1px solid ${C.border}` }}>
          <h3 style={{ margin: 0, fontSize: '1rem', color: C.navy }}>{titulo}</h3>
          <button type="button" onClick={onCerrar} aria-label="Cerrar" style={{ background: 'none', border: 'none', fontSize: '1.4rem', color: C.muted, cursor: 'pointer' }}>×</button>
        </div>
        <div style={{ padding: '20px' }}>{children}</div>
      </div>
    </div>
  )
}

// Menú desplegable de acciones (⋯)
export function Menu({ abierto, onCerrar, opciones }: { abierto: boolean; onCerrar: () => void; opciones: { label: string; onClick: () => void; peligro?: boolean }[] }) {
  if (!abierto) return null
  return (
    <>
      <div onClick={onCerrar} style={{ position: 'fixed', inset: 0, zIndex: 90 }} />
      <div style={{ position: 'absolute', right: 0, top: '38px', background: 'white', border: `1px solid ${C.border}`, borderRadius: '10px', boxShadow: '0 8px 24px rgba(2,13,36,0.12)', zIndex: 100, minWidth: '180px', overflow: 'hidden' }}>
        {opciones.map(o => (
          <button key={o.label} type="button" onClick={() => { onCerrar(); o.onClick() }} style={{ display: 'block', width: '100%', textAlign: 'left', background: 'white', border: 'none', padding: '10px 14px', fontSize: '0.85rem', color: o.peligro ? C.red : C.navy, cursor: 'pointer', fontFamily: 'inherit' }}>{o.label}</button>
        ))}
      </div>
    </>
  )
}

export function Volver({ a, texto = '← Volver' }: { a?: string; texto?: string }) {
  const router = useRouter()
  return <LinkBtn onClick={() => a ? router.push(a) : router.back()} style={{ marginBottom: '14px', display: 'inline-block' }}>{texto}</LinkBtn>
}

export function Metrica({ icono, label, valor, sub, color, bg, onClick }: { icono: string; label: string; valor: ReactNode; sub?: string; color: string; bg: string; onClick?: () => void }) {
  return (
    <div onClick={onClick} role={onClick ? 'button' : undefined} style={{ background: 'white', borderRadius: '12px', padding: '18px', border: `1px solid ${C.border}`, cursor: onClick ? 'pointer' : 'default' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>{icono}</div>
        <span style={{ fontSize: '0.82rem', color: C.muted }}>{label}</span>
      </div>
      <div style={{ fontSize: '2rem', fontWeight: 800, color, marginBottom: '4px' }}>{valor}</div>
      {sub && <div style={{ fontSize: '0.75rem', color: C.muted }}>{sub}</div>}
    </div>
  )
}

export function Estrellas({ valor, size = '1rem' }: { valor: number; size?: string }) {
  const llenas = Math.round(valor)
  return <span style={{ color: '#f39c12', fontSize: size, letterSpacing: '1px' }}>{'★'.repeat(llenas)}<span style={{ color: '#dfe6ee' }}>{'★'.repeat(5 - llenas)}</span></span>
}
