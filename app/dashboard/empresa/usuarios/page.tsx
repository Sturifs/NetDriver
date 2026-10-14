'use client'
import { useRouter } from 'next/navigation'
import { useEmpresa } from '../_lib/contexto'
import { CORREO_SOPORTE, RUTA } from '../_lib/datos'
import { Avatar, Badge, Btn, C, Card, PageHeader } from '../_lib/ui'

export default function Usuarios() {
  const router = useRouter()
  const { perfil } = useEmpresa()
  return (
    <div style={{ maxWidth: '860px' }}>
      <PageHeader titulo="Usuarios y permisos" sub="Quiénes pueden administrar la cuenta de tu empresa en NetDriver.">
        <Btn disabled title="Disponible próximamente">+ Invitar usuario</Btn>
      </PageHeader>
      <Card padding="0" style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 20px' }}>
          <Avatar nombre={perfil.nombre} apellido={perfil.apellido} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, color: C.navy }}>{perfil.nombre} {perfil.apellido} <span style={{ color: C.muted, fontWeight: 400, fontSize: '0.8rem' }}>(tú)</span></div>
            <div style={{ fontSize: '0.8rem', color: C.muted }}>{perfil.email}</div>
          </div>
          <Badge color={C.blue} bg="#e8f0fe">Administrador</Badge>
          <Btn variante="secundario" onClick={() => router.push(`${RUTA}/configuracion`)} style={{ padding: '6px 12px' }}>Editar</Btn>
        </div>
      </Card>
      <Card style={{ background: '#f8fafc' }}>
        <div style={{ fontWeight: 700, color: C.navy, marginBottom: '6px' }}>👥 Próximamente: equipo de hasta 3 usuarios</div>
        <p style={{ fontSize: '0.88rem', color: C.muted, lineHeight: 1.6, margin: '0 0 12px' }}>Con el plan Empresarial Pro podrás invitar hasta 3 usuarios por empresa (por ejemplo, jefe de operaciones y encargado de RR.HH.) para que gestionen empleos y postulaciones con su propia cuenta.</p>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <Btn variante="secundario" onClick={() => router.push(`${RUTA}/planes`)}>Ver planes</Btn>
          <Btn variante="secundario" href={`mailto:${CORREO_SOPORTE}?subject=${encodeURIComponent('Usuarios adicionales - ' + (perfil.nombre_empresa || ''))}`}>Avísame cuando esté listo</Btn>
        </div>
      </Card>
    </div>
  )
}
