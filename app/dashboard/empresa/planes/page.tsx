'use client'
import { useRouter } from 'next/navigation'
import { useEmpresa } from '../_lib/contexto'
import { CORREO_SOPORTE, LIMITE_EMPLEOS_GRATIS, PLANES, pesos, RUTA } from '../_lib/datos'
import { Aviso, Btn, C, Card, PageHeader, Vacio } from '../_lib/ui'

export default function Planes() {
  const router = useRouter()
  const { perfil, contadores } = useEmpresa()
  const actual = perfil.plan === 'pro' ? 'pro' : 'gratis'

  const solicitar = (plan: string) => {
    const asunto = `Quiero contratar el plan ${plan} - ${perfil.nombre_empresa || ''}`
    const cuerpo = `Hola equipo NetDriver,\n\nQuiero contratar el plan ${plan}.\n\nEmpresa: ${perfil.nombre_empresa || ''}\nRUT: ${perfil.rut_empresa || ''}\nContacto: ${perfil.nombre || ''} ${perfil.apellido || ''}\nCorreo: ${perfil.email || ''}\nTeléfono: ${perfil.telefono || ''}\n\nGracias.`
    return `mailto:${CORREO_SOPORTE}?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(cuerpo)}`
  }

  return (
    <div>
      <PageHeader titulo="Planes y facturación" sub="Elige el plan que mejor se adapta a tu volumen de contratación." />
      <Aviso tipo="info">Estás en el plan <strong>{actual === 'pro' ? 'Empresarial Pro' : 'Gratis'}</strong>. Tienes {contadores.empleosActivos} empleo{contadores.empleosActivos === 1 ? '' : 's'} activo{contadores.empleosActivos === 1 ? '' : 's'}{actual === 'gratis' ? ` de ${LIMITE_EMPLEOS_GRATIS} incluido${LIMITE_EMPLEOS_GRATIS === 1 ? '' : 's'}` : ' (sin límite)'}.</Aviso>

      <div className="nd-grid-2" style={{ marginBottom: '24px', maxWidth: '900px' }}>
        {PLANES.map(p => {
          const esActual = p.id === actual
          return (
            <Card key={p.id} style={{ border: `2px solid ${p.destacado ? '#f39c12' : C.border}`, position: 'relative' }}>
              {p.destacado && <span style={{ position: 'absolute', top: '-12px', right: '16px', background: '#f39c12', color: 'white', fontSize: '0.72rem', fontWeight: 700, padding: '3px 10px', borderRadius: '10px' }}>RECOMENDADO</span>}
              <div style={{ fontWeight: 800, color: C.navy, fontSize: '1.1rem' }}>{p.destacado ? '👑 ' : ''}{p.nombre}</div>
              <div style={{ margin: '10px 0 14px' }}>
                <span style={{ fontSize: '2rem', fontWeight: 800, color: C.navy }}>{p.precio ? pesos(p.precio) : '$0'}</span>
                <span style={{ color: C.muted, fontSize: '0.85rem' }}> /mes{p.precio ? ' + IVA' : ''}</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 18px' }}>
                {p.items.map(i => <li key={i} style={{ fontSize: '0.88rem', color: C.navy, padding: '5px 0' }}>✓ {i}</li>)}
              </ul>
              {esActual
                ? <Btn variante="secundario" disabled style={{ width: '100%', justifyContent: 'center' }}>Tu plan actual</Btn>
                : p.precio
                  ? <Btn href={solicitar(p.nombre)} style={{ width: '100%', justifyContent: 'center', background: '#f39c12', border: '1px solid #f39c12' }}>Solicitar plan {p.nombre}</Btn>
                  : <Btn variante="secundario" href={solicitar(p.nombre)} style={{ width: '100%', justifyContent: 'center' }}>Cambiar a Gratis</Btn>}
            </Card>
          )
        })}
      </div>
      <div style={{ fontSize: '0.8rem', color: C.muted, marginBottom: '24px' }}>El pago en línea estará disponible pronto. Por ahora, al solicitar un plan te contactaremos para activarlo.</div>

      <Card padding="0" style={{ maxWidth: '900px' }}>
        <div style={{ padding: '16px 20px', borderBottom: `1px solid ${C.bg}`, fontWeight: 700, color: C.navy }}>Historial de facturación</div>
        <Vacio icono="🧾" titulo="Aún no tienes facturas" texto="Cuando contrates un plan pagado, tus facturas aparecerán aquí para descargarlas." accion="Ver mis empleos" onAccion={() => router.push(`${RUTA}/empleos`)} />
      </Card>
    </div>
  )
}
