'use client'
import { useRouter } from 'next/navigation'

const resenas = [
  { ini: 'MA', nombre: 'Martín Alvarezz', color: '#7c3aed', fecha: '12 de mayo, 2024', stars: 5, texto: 'Excelente conductor. Muy puntual y cuidadoso con la carga. 100% recomendado.', util: 12 },
  { ini: 'LG', nombre: 'Laura Gómez', color: '#6d28d9', fecha: '8 de mayo, 2024', stars: 5, texto: 'Muy buen servicio, comunicación clara durante todo el viaje. Volvería a trabajar con él sin dudas.', util: 8 },
  { ini: 'JP', nombre: 'Juan Pérez', color: '#2563eb', fecha: '3 de mayo, 2024', stars: 5, texto: 'Profesional y responsable. Entregó la carga en tiempo y forma. Todo perfecto.', util: 5 },
  { ini: 'CR', nombre: 'Carlos Rodríguez', color: '#d97706', fecha: '28 de abril, 2024', stars: 4, texto: 'Buen servicio en general, aunque hubo una pequeña demora en la entrega.', util: 2 },
  { ini: 'FS', nombre: 'Fernanda Salazar', color: '#059669', fecha: '21 de abril, 2024', stars: 5, texto: 'Muy atento y respetuoso. Se nota la experiencia en la ruta. Altamente recomendado.', util: 4 },
  { ini: 'DR', nombre: 'Diego Ramírez', color: '#dc2626', fecha: '15 de abril, 2024', stars: 3, texto: 'Cumplió con la entrega, pero la comunicación podría mejorar. Gracias.', util: 1 },
]

export default function ResenasPage() {
  const router = useRouter()
  return (
    <div style={{ background: '#020D1A', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <div style={{ background: '#0a1628', padding: '14px 24px', display: 'flex', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', position: 'sticky', top: 0, zIndex: 10 }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', color: '#3b82f6', fontSize: '14px', cursor: 'pointer' }}>
          ← Volver al perfil
        </button>
      </div>
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '28px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px', flexWrap: 'wrap' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '20px', color: 'white', flexShrink: 0 }}>FS</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'white' }}>Franco Sturione</div>
            <div style={{ fontSize: '0.85rem', color: '#8fa3b8' }}>Conductor Profesional</div>
            <div style={{ marginTop: '6px', display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '20px', padding: '3px 10px', fontSize: '0.75rem', color: '#22c55e' }}>
              ✓ Perfil verificado
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.8rem', fontWeight: 800, color: 'white', lineHeight: 1 }}>4.8</div>
              <div style={{ color: '#f39c12', fontSize: '1.1rem' }}>★★★★★</div>
              <div style={{ fontSize: '0.78rem', color: '#8fa3b8', marginTop: '4px' }}>(128 reseñas)</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', minWidth: '180px' }}>
              {([[5,102],[4,18],[3,6],[2,1],[1,1]] as [number,number][]).map(([s,c]) => (
                <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem' }}>
                  <span style={{ color: '#8fa3b8', width: '60px' }}>{s} estrellas</span>
                  <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px' }}>
                    <div style={{ width: `${Math.round(c/102*100)}%`, height: '6px', background: '#f39c12', borderRadius: '3px' }} />
                  </div>
                  <span style={{ color: '#8fa3b8', width: '24px', textAlign: 'right' }}>{c}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <select style={{ background: '#0a1628', border: '1px solid rgba(255,255,255,0.15)', color: 'white', borderRadius: '8px', padding: '8px 12px', fontSize: '0.85rem' }}>
            <option>Todas las reseñas</option>
            <option>5 estrellas</option>
            <option>4 estrellas</option>
            <option>3 estrellas</option>
          </select>
          <select style={{ background: '#0a1628', border: '1px solid rgba(255,255,255,0.15)', color: 'white', borderRadius: '8px', padding: '8px 12px', fontSize: '0.85rem' }}>
            <option>Más recientes</option>
            <option>Mejor puntuación</option>
          </select>
        </div>
        <div>
          {resenas.map((r, idx) => (
            <div key={idx} style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '16px 0', display: 'flex', gap: '14px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: r.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, color: 'white', flexShrink: 0 }}>{r.ini}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <div>
                    <span style={{ fontWeight: 600, color: 'white', fontSize: '0.9rem' }}>{r.nombre}</span>
                    <span style={{ color: '#8fa3b8', fontSize: '0.78rem', marginLeft: '10px' }}>{r.fecha}</span>
                  </div>
                </div>
                <div style={{ color: '#f39c12', fontSize: '0.9rem', marginBottom: '6px' }}>{'★'.repeat(r.stars)}{'☆'.repeat(5 - r.stars)}</div>
                <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.85rem', lineHeight: 1.5, marginBottom: '8px' }}>{r.texto}</div>
                <button style={{ background: 'none', border: 'none', color: '#8fa3b8', fontSize: '0.78rem', cursor: 'pointer' }}>
                  👍 Útil ({r.util})
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
