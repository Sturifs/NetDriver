'use client'
import { useState } from 'react'
import Image from 'next/image'
import { supabase } from '../supabase'

export default function AuthModal({ onClose, tipoInicial = 'conductor' }: { onClose: () => void, tipoInicial?: 'conductor' | 'empresa' }) {
  const [activeTab, setActiveTab] = useState<string>('registro')
  const [activePlan, setActivePlan] = useState<'conductor' | 'empresa'>(tipoInicial)
  const [nombre, setNombre] = useState('')
  const [apellido, setApellido] = useState('')
  const [nombreEmpresa, setNombreEmpresa] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [loading, setLoading] = useState(false)
  

  const handleLogin = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setMensaje('Error: ' + error.message)
    else { setMensaje('✅ Sesión iniciada'); onClose() }
    setLoading(false)
  }
  const handleResetPassword = async () => {
    if (!email) { setMensaje('Error: Ingresa tu email para recuperar tu contraseña'); return }
    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: typeof window !== 'undefined' ? window.location.origin + '/restablecer-password' : undefined,
    })
    if (error) setMensaje('Error: ' + error.message)
    else setMensaje('✅ Te enviamos un correo para restablecer tu contraseña')
    setLoading(false)
  }

  const handleRegistro = async () => {
    setLoading(true)
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) setMensaje('Error: ' + error.message)
    else {
      await supabase.from('profiles').insert({
        id: data.user?.id, tipo: activePlan, nombre, apellido,
        email, nombre_empresa: activePlan === 'empresa' ? nombreEmpresa : null
      })
      setMensaje('✅ ¡Cuenta creada! Ya puedes iniciar sesión.')
      setActiveTab('login')
    }
    setLoading(false)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, padding: '20px' }}>
      <div style={{ background: '#020e20', border: '1px solid rgba(34,197,94,0.25)', borderRadius: '20px', padding: '36px', width: '100%', maxWidth: '420px', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
        <div style={{ marginBottom: '22px' }}>
          <Image src="/NetDriver_Logo.png" alt="NetDriver" width={160} height={60} style={{ objectFit: 'contain' }} />
        </div>
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '4px', marginBottom: '20px' }}>
          {['login', 'registro'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{ flex: 1, padding: '9px', borderRadius: '8px', border: activeTab === tab ? 'none' : '1px solid rgba(255,255,255,0.35)', cursor: 'pointer', fontWeight: 600, fontSize: '0.88rem', background: activeTab === tab ? '#22c55e' : 'transparent', color: activeTab === tab ? 'white' : 'rgba(255,255,255,0.5)' }}>
              {tab === 'login' ? 'Iniciar Sesión' : 'Registrarse'}
            </button>
          ))}
        </div>
        {activeTab === 'registro' && (
          <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '4px' }}>
            {(['conductor','empresa'] as const).map(plan => (
              <button key={plan} onClick={() => setActivePlan(plan)} style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', background: activePlan === plan ? 'rgba(34,197,94,0.3)' : 'transparent', color: activePlan === plan ? 'white' : 'rgba(255,255,255,0.5)' }}>
                {plan === 'conductor' ? '🚛 Conductor' : '🏢 Empresa'}
              </button>
            ))}
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {activeTab === 'registro' && activePlan === 'empresa' && (
            <input value={nombreEmpresa} onChange={e => setNombreEmpresa(e.target.value)} placeholder="Nombre de la empresa" style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'white', fontSize: '0.9rem', outline: 'none' }} />
          )}
          {activeTab === 'registro' && activePlan !== 'empresa' && (
            <>
              <input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Nombre" style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'white', fontSize: '0.9rem', outline: 'none' }} />
              <input value={apellido} onChange={e => setApellido(e.target.value)} placeholder="Apellido" style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'white', fontSize: '0.9rem', outline: 'none' }} />
            </>
          )}
          <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" type="email" style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'white', fontSize: '0.9rem', outline: 'none' }} />
          <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Contraseña" type="password" style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'white', fontSize: '0.9rem', outline: 'none' }} />
          {activeTab === 'login' && (
            <button onClick={handleResetPassword} type="button" style={{ background: 'transparent', border: 'none', color: '#22c55e', fontSize: '0.8rem', cursor: 'pointer', textAlign: 'right', padding: 0 }}>¿Olvidaste tu contraseña?</button>
          )}
        </div>
        {mensaje && <div style={{ fontSize: '0.85rem', color: mensaje.includes('Error') ? '#f87171' : '#22c55e', textAlign: 'center', marginTop: '8px' }}>{mensaje}</div>}
        <button onClick={activeTab === 'login' ? handleLogin : handleRegistro} disabled={loading} style={{ padding: '13px', borderRadius: '10px', border: 'none', marginTop: '16px', background: '#22c55e', color: 'white', fontSize: '0.95rem', fontWeight: 700, cursor: loading ? 'wait' : 'pointer', width: '100%' }}>
          {loading ? 'Procesando...' : activeTab === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
        </button>
      </div>
    </div>
  )
}
