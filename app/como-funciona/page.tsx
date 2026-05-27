'use client'
import { useState } from 'react'
import AuthModal from '../components/AuthModal'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function ComoFunciona() {
  const [tab, setTab] = useState<'conductor' | 'empresa'>('conductor')
  const [modalAbierto, setModalAbierto] = useState(false)
  const router = useRouter()

  const Card = ({ num, icon, title, desc, highlight }: { num: number, icon: string, title: string, desc: string, highlight?: string }) => (
    <div style={{ background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '14px', padding: '24px 18px 20px', position: 'relative', display: 'flex', flexDirection: 'column', gap: '8px', height: '100%' }}>
      <div style={{ position: 'absolute', top: '-14px', left: '16px', background: '#22c55e', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem', color: 'white' }}>{num}</div>
      <i className={`ti ${icon}`} style={{ position: 'absolute', top: '16px', right: '16px', fontSize: '3rem', color: '#6b8cba' }} aria-hidden="true"></i>
      <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'white', lineHeight: 1.3, marginTop: '32px' }}>{title}</div>
      <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.82rem', lineHeight: 1.6 }}>{desc}</div>
      {highlight && <div style={{ color: '#22c55e', fontSize: '0.82rem', fontWeight: 600, marginTop: '4px' }}>{highlight}</div>}
    </div>
  )

  return (
    <>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css" />
      <div style={{ background: '#020D24', minHeight: '100vh', color: 'white', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>

        {/* NAVBAR */}
        <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px 0 0', height: '85px', marginLeft: '-12px', borderBottom: '1px solid rgba(255,255,255,0.3)', position: 'sticky', top: 0, background: '#020D24', zIndex: 100 }}>
          <div onClick={() => router.push('/')} style={{ cursor: 'pointer', marginTop: '3px', marginLeft: '3px' }}>
            <Image src="/NetDriver_Logo.png" alt="NetDriver" width={300} height={75} style={{ objectFit: 'contain' }} />
          </div>
          <button onClick={() => router.push('/')} style={{ padding: '10px 24px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: 'white', cursor: 'pointer', fontSize: '0.9rem' }}>← Volver al inicio</button>
        </nav>

        <div style={{ position: 'relative', background: "url('/camion2_como_funciona.png') center center / cover no-repeat", padding: '80px 40px 60px' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(2,14,32,1) 0%, rgba(2,14,32,0) 30%, rgba(2,14,32,0) 70%, rgba(2,14,32,0.1) 100%), linear-gradient(to bottom, rgba(2,14,32,0) 60%, rgba(2,14,32,1) 100%), linear-gradient(to top, rgba(2,14,32,0) 85%, rgba(2,14,32,1) 100%)' }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '1100px', margin: '0 auto' }}>

          {/* TÍTULO */}
          <h1 style={{ textAlign: 'left', fontSize: '2.6rem', fontWeight: 900, marginBottom: '12px', lineHeight: 1.2 }}>
            ¿Cómo funciona <span style={{ color: '#22c55e' }}>NetDriver</span>?
          </h1>
          <p style={{ textAlign: 'left', color: 'rgba(255,255,255,0.55)', marginBottom: '48px', fontSize: '1.05rem' }}>
            Selecciona tu perfil para ver cómo funciona la plataforma
          </p>

          {/* TABS */}
          <div style={{ display: 'flex', justifyContent: 'flex-start', gap: '16px', marginBottom: '56px' }}>
            {(['conductor', 'empresa'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)} style={{ padding: '13px 44px', borderRadius: '10px', border: tab === t ? 'none' : '1px solid rgba(255,255,255,0.35)', background: tab === t ? '#22c55e' : 'transparent', color: tab === t ? 'white' : 'rgba(255,255,255,0.6)', fontWeight: 700, fontSize: '1.05rem', cursor: 'pointer' }}>
                {t === 'conductor' ? '🚛 Conductor' : '🏢 Empresa'}
              </button>
            ))}
          </div>

          {/* ====== CONDUCTOR ====== */}
          {tab === 'conductor' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px' }}>
                <i className="ti ti-user" style={{ fontSize: '1.6rem', color: '#22c55e' }} aria-hidden="true"></i>
                <div>
                  <div style={{ color: '#22c55e', fontWeight: 700, fontSize: '0.88rem', letterSpacing: '0.06em', marginBottom: '2px' }}>PARA CONDUCTORES</div>
                  <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.92rem' }}>Así de fácil es trabajar con NetDriver.</div>
                </div>
              </div>

              {/* FILA 1 */}
              <div style={{ position: 'relative' }}>
              <svg style={{ position: 'absolute', right: '-56px', top: '0', height: '100%', width: '56px', zIndex: 10 }} viewBox="0 0 56 400" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 60 L20 60 Q48 60 48 90 L48 310 Q48 340 20 340 L0 340" stroke="#22c55e" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke"/>
              </svg>
              <div style={{ display: 'flex', alignItems: 'stretch', gap: '8px', marginBottom: '8px', transform: 'translateY(-20px)' }}>
                <div style={{ flex: 1 }}><Card num={1} icon="ti-user-check" title="Regístrate gratis" desc="Crea tu cuenta en minutos con tus datos y documentos. Es rápido, fácil y 100% online." /></div>
                <div style={{ display: 'flex', alignItems: 'center', color: '#22c55e', fontSize: '1.5rem' }}>→</div>
                <div style={{ flex: 1 }}><Card num={2} icon="ti-file-description" title="Completa tu perfil" desc="Cuéntanos sobre tu camión, rutas preferidas y disponibilidad para recibir mejores ofertas." /></div>
                <div style={{ display: 'flex', alignItems: 'center', color: '#22c55e', fontSize: '1.5rem' }}>→</div>
                <div style={{ flex: 1 }}><Card num={3} icon="ti-bell-ringing" title="Recibe ofertas de carga" desc="Te notificamos cargas que se ajustan a tu ruta y preferencias." /></div>
              </div>

              

              {/* FILA 2 */}
              <div style={{ display: 'flex', alignItems: 'stretch', gap: '8px', marginBottom: '48px', transform: 'translateY(40px)' }}>
                <div style={{ flex: 1 }}><Card num={6} icon="ti-wallet" title="Recibe tu pago" desc="Una vez completado el viaje, la empresa libera el pago de forma segura a través de NetDriver." /></div>
                <div style={{ display: 'flex', alignItems: 'center', color: '#22c55e', fontSize: '1.5rem' }}>←</div>
                <div style={{ flex: 1 }}><Card num={5} icon="ti-truck-delivery" title="Realiza el viaje" desc="Transporta la carga de forma segura y en los tiempos acordados." /></div>
                <div style={{ display: 'flex', alignItems: 'center', color: '#22c55e', fontSize: '1.5rem' }}>←</div>
                <div style={{ flex: 1 }}><Card num={4} icon="ti-map-pin" title="Acepta y coordina" desc="Elige la carga que más te convenga y coordina los detalles directamente en la plataforma." /></div>
              </div>
            </div>

              {/* BANNER */}
              <div style={{ background: 'rgba(34,197,94,0.22)', border: '1px solid rgba(34,197,94,0.4)', borderRadius: '14px', padding: '28px 36px', display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '56px', marginTop: '80px' }}>
                <i className="ti ti-trophy" style={{ fontSize: '3rem', color: '#22c55e', flexShrink: 0 }} aria-hidden="true"></i>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1.15rem', marginBottom: '6px' }}>
                    <span style={{ color: '#22c55e' }}>Más viajes, mejores ingresos,</span> <span style={{ color: 'white' }}>menos vacío.</span>
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.92rem' }}>NetDriver trabaja contigo para que tu camión siempre esté en movimiento.</div>
                </div>
              </div>

              {/* POR QUÉ ELEGIR */}
              <h3 style={{ textAlign: 'center', fontSize: '1.5rem', fontWeight: 800, marginBottom: '32px' }}>¿Por qué elegir <span style={{ color: '#22c55e' }}>NetDriver</span>?</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '20px', marginBottom: '56px' }}>
                {[
                  {icon:'ti-shield-check',title:'Seguro y confiable',desc:'Verificamos empresas y cargas para tu tranquilidad.'},
                  {icon:'ti-briefcase',title:'Más oportunidades',desc:'Accede a cargas exclusivas y rutas de alto valor.'},
                  {icon:'ti-clock',title:'Ahorra tiempo',desc:'Todo en una sola app: ofertas, documentos y pagos.'},
                  {icon:'ti-headset',title:'Soporte real',desc:'Estamos contigo en cada viaje.'},
                  {icon:'ti-trending-up',title:'Crece con nosotros',desc:'Más viajes completados mejoran tu reputación y te dan acceso a mejores cargas.'},
                ].map(item => (
                  <div key={item.title} style={{ textAlign: 'center', background: 'rgba(255,255,255,0.18)', borderRadius: '12px', padding: '24px 16px', border: '1px solid rgba(255,255,255,0.3)' }}>
                    <i className={`ti ${item.icon}`} style={{ fontSize: '2.2rem', color: '#22c55e' }} aria-hidden="true"></i>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', marginBottom: '6px', marginTop: '10px' }}>{item.title}</div>
                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.78rem', lineHeight: 1.5 }}>{item.desc}</div>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '16px', padding: '36px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div style={{ background: 'rgba(34,197,94,0.2)', borderRadius: '50%', width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <i className="ti ti-truck-delivery" style={{ fontSize: '1.8rem', color: '#22c55e' }} aria-hidden="true"></i>
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '1.05rem', marginBottom: '6px' }}>Únete a miles de conductores que ya están moviendo a Chile con NetDriver.</div>
                    <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.88rem' }}>Regístrate gratis y comienza a recibir cargas hoy mismo.</div>
                  </div>
                </div>
                <button onClick={() => setModalAbierto(true)} style={{ padding: '14px 36px', borderRadius: '10px', border: 'none', background: '#22c55e', color: 'white', fontWeight: 700, fontSize: '1.05rem', cursor: 'pointer', whiteSpace: 'nowrap' }}>Sé parte ahora!</button>
              </div>
            </div>
          )}

          {/* ====== EMPRESA ====== */}
          {tab === 'empresa' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', alignItems: 'center', marginBottom: '56px' }}>
                <div>
                  <h2 style={{ fontSize: '2rem', fontWeight: 900, lineHeight: 1.2, marginBottom: '16px' }}>¿Cómo funciona<br /><span style={{ color: '#22c55e' }}>NetDriver</span> para<br />Empresas?</h2>
                  <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1rem', lineHeight: 1.6 }}>La plataforma todo en uno que impulsa tu operación: conductores, maquinarias y oportunidades, en un solo lugar.</p>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.18)', borderRadius: '16px', padding: '24px', border: '1px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ background: 'rgba(34,197,94,0.15)', borderRadius: '50%', width: '56px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <i className="ti ti-building" style={{ fontSize: '1.8rem', color: '#22c55e' }} aria-hidden="true"></i>
                  </div>
                  <div>
                    <div style={{ color: '#22c55e', fontWeight: 700, fontSize: '0.88rem', letterSpacing: '0.06em', marginBottom: '4px' }}>PARA EMPRESAS</div>
                    <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.92rem' }}>Publica tus cargas, encuentra conductores y maquinarias, y gestiona toda tu operación de principio a fin.</div>
                    <div style={{ display: 'flex', gap: '20px', marginTop: '12px' }}>
                      {[['ti-shield','Más control'],['ti-bolt','Más eficiencia'],['ti-clock','Menos tiempos'],['ti-trending-up','Mejores resultados']].map(([ic,lb]) => (
                        <div key={lb} style={{ textAlign: 'center' }}>
                          <i className={`ti ${ic}`} style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.6)' }} aria-hidden="true"></i>
                          <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.5)', marginTop: '2px' }}>{lb}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* FILA 1 — 5 pasos */}
              <div style={{ display: 'flex', alignItems: 'stretch', gap: '6px', marginBottom: '8px' }}>
                {[
                  {num:1,icon:'ti-building-plus',title:'Registra tu empresa',desc:'Crea tu cuenta empresarial en minutos. Valida tu información y comienza a operar en NetDriver.'},
                  {num:2,icon:'ti-circle-check',title:'Completa tu perfil y verifica',desc:'Agrega los datos de tu empresa, documentos y métodos de pago para mayor seguridad.'},
                  {num:3,icon:'ti-users-group',title:'Accede a la base de datos',desc:'Busca, filtra y contacta conductores verificados por ubicación, experiencia y vehículo.',highlight:'Ideal para tus procesos de contratación.'},
                  {num:4,icon:'ti-backhoe',title:'Arrienda o busca maquinarias',desc:'Publica tus maquinarias disponibles o encuentra la que necesitas cuando la necesitas.',highlight:'No más equipos detenidos.'},
                  {num:5,icon:'ti-briefcase',title:'Publica trabajos',desc:'Publica tus cargas o trabajos. Define origen, destino, tipo de carga, fecha y precio.'},
                ].map((paso, idx) => (
                  <div key={paso.num} style={{ display: 'flex', alignItems: 'stretch', flex: 1, gap: '6px' }}>
                    <div style={{ flex: 1 }}><Card num={paso.num} icon={paso.icon} title={paso.title} desc={paso.desc} highlight={paso.highlight} /></div>
                    {idx < 4 && <div style={{ display: 'flex', alignItems: 'center', color: '#22c55e', fontSize: '1.3rem', flexShrink: 0 }}>→</div>}
                  </div>
                ))}
              </div>

              {/* BASE DE DATOS */}
              <div style={{ display: 'flex', justifyContent: 'center', margin: '16px 0' }}>
                <div style={{ background: 'rgba(34,197,94,0.22)', border: '1px solid rgba(34,197,94,0.4)', borderRadius: '12px', padding: '16px 32px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <i className="ti ti-database" style={{ fontSize: '1.8rem', color: '#22c55e' }} aria-hidden="true"></i>
                  <div>
                    <div style={{ fontWeight: 700, color: '#22c55e', fontSize: '0.92rem' }}>Base de datos inteligente NetDriver</div>
                    <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.82rem' }}>Conectamos empresas, conductores y maquinarias en una sola plataforma segura y confiable.</div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', paddingRight: 'calc(20% - 10px)', color: '#22c55e', fontSize: '1.5rem', margin: '4px 0' }}>↓</div>

              {/* FILA 2 — 4 pasos invertidos */}
              <div style={{ display: 'flex', alignItems: 'stretch', gap: '6px', marginBottom: '48px' }}>
                {[
                  {num:9,icon:'ti-chart-bar',title:'Reportes y análisis',desc:'Accede a reportes de viajes, costos y rendimientos. Toma decisiones basadas en datos y haz crecer tu negocio.'},
                  {num:8,icon:'ti-credit-card',title:'Controla y procesa pagos',desc:'Paga de manera segura a través de NetDriver. Historial de pagos, documentos y facturación siempre disponibles.'},
                  {num:7,icon:'ti-map-2',title:'Monitorea tus operaciones',desc:'Sigue el estado de tus viajes en tiempo real, comunícate con los conductores y recibe notificaciones en cada etapa.'},
                  {num:6,icon:'ti-message-check',title:'Recibe propuestas y selecciona',desc:'Conductores interesados enviarán sus propuestas. Compara perfiles, experiencia, evaluaciones y elige la mejor opción.'},
                ].map((paso, idx) => (
                  <div key={paso.num} style={{ display: 'flex', alignItems: 'stretch', flex: 1, gap: '6px' }}>
                    <div style={{ flex: 1 }}><Card num={paso.num} icon={paso.icon} title={paso.title} desc={paso.desc} /></div>
                    {idx < 3 && <div style={{ display: 'flex', alignItems: 'center', color: '#22c55e', fontSize: '1.3rem', flexShrink: 0 }}>←</div>}
                  </div>
                ))}
              </div>

              {/* POR QUÉ ELEGIR */}
              <h3 style={{ textAlign: 'center', fontSize: '1.5rem', fontWeight: 800, marginBottom: '32px' }}>¿Por qué las empresas eligen <span style={{ color: '#22c55e' }}>NetDriver</span>?</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '20px', marginBottom: '56px' }}>
                {[
                  {icon:'ti-users-group',title:'Conductores verificados',desc:'Accede a miles de conductores verificados y mejora la calidad de tus contrataciones.'},
                  {icon:'ti-backhoe',title:'Maquinaria disponible',desc:'Arrienda o publica tus equipos y mantén tu operación siempre en movimiento.'},
                  {icon:'ti-bolt',title:'Publica al instante',desc:'Llega a más conductores y encuentra la mejor opción en menos tiempo.'},
                  {icon:'ti-shield-check',title:'Seguridad y confianza',desc:'Documentos verificados, pagos protegidos y soporte en cada paso.'},
                  {icon:'ti-trending-up',title:'Eficiencia y ahorro',desc:'Optimiza tus procesos, reduce tiempos muertos y aumenta tu rentabilidad.'},
                ].map(item => (
                  <div key={item.title} style={{ textAlign: 'center', background: 'rgba(255,255,255,0.18)', borderRadius: '12px', padding: '24px 16px', border: '1px solid rgba(255,255,255,0.3)' }}>
                    <i className={`ti ${item.icon}`} style={{ fontSize: '2.2rem', color: '#22c55e' }} aria-hidden="true"></i>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', marginBottom: '6px', marginTop: '10px' }}>{item.title}</div>
                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.78rem', lineHeight: 1.5 }}>{item.desc}</div>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '16px', padding: '36px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div style={{ background: 'rgba(34,197,94,0.2)', borderRadius: '50%', width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <i className="ti ti-building" style={{ fontSize: '1.8rem', color: '#22c55e' }} aria-hidden="true"></i>
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '1.05rem', marginBottom: '6px' }}>Únete a cientos de empresas que ya optimizan su logística con NetDriver.</div>
                    <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.88rem' }}>Crea tu cuenta gratis y publica tu primer trabajo hoy mismo.</div>
                  </div>
                </div>
                <button onClick={() => router.push('/')} style={{ padding: '14px 36px', borderRadius: '10px', border: 'none', background: '#22c55e', color: 'white', fontWeight: 700, fontSize: '1.05rem', cursor: 'pointer', whiteSpace: 'nowrap' }}>Soy Empresa →</button>
              </div>
            </div>
          )}

          {/* STATS */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '56px', flexWrap: 'wrap', marginTop: '72px', paddingTop: '48px', borderTop: '1px solid rgba(255,255,255,0.3)' }}>
            {[['+2.400','Conductores activos','ti-users'],['+380','Empresas conectadas','ti-building'],[' 15','Regiones cubiertas','ti-map-pin'],['+50.000','Viajes realizados','ti-truck-delivery'],['100%','Pagos protegidos','ti-shield-check']].map(([num,lbl,ic]) => (
              <div key={lbl} style={{ textAlign: 'center' }}>
                <i className={`ti ${ic}`} style={{ fontSize: '1.4rem', color: 'rgba(255,255,255,0.4)', marginBottom: '6px', display: 'block' }} aria-hidden="true"></i>
                <div style={{ fontSize: '1.7rem', fontWeight: 900, color: '#22c55e' }}>{num}</div>
                <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)', marginTop: '2px' }}>{lbl}</div>
              </div>
            ))}
          </div>

        </div>
        </div>
      </div>
      {modalAbierto && <AuthModal onClose={() => setModalAbierto(false)} />}
    </>
  )
}
