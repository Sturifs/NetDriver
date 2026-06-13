'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../supabase'

export default function RestablecerPassword() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [loading, setLoading] = useState(false)
  const [sesionValida, setSesionValida] = useState(false)
  const [verificando, setVerificando] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSesionValida(!!data.session)
      setVerificando(false)
    })
  }, [])

  const handleSubmit = async () => {
    if (password.length < 6) {
      setMensaje('Error: La contraseña debe tener al menos 6 caracteres')
      return
    }
    if (password !== confirmPassword) {
      setMensaje('Error: Las contraseñas no coinciden')
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setMensaje('Error: ' + error.message)
    } else {
      setMensaje('✅ Contraseña actualizada correctamente')
      setTimeout(() => router.push('/'), 2000)
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#020D1A', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '32px', maxWidth: '420px', width: '100%' }}>
        <h1 style={{ color: 'white', fontSize: '1.3rem', fontWeight: 700, marginBottom: '8px' }}>Restablecer contraseña</h1>

        {verificando ? (
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>Verificando...</p>
        ) : !sesionValida ? (
          <p style={{ color: '#f87171', fontSize: '0.9rem' }}>El enlace no es válido o ha expirado. Solicita uno nuevo desde la pantalla de inicio de sesión.</p>
        ) : (
          <>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', marginBottom: '20px' }}>Ingresa tu nueva contraseña.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Nueva contraseña" type="password" style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'white', fontSize: '0.9rem', outline: 'none' }} />
              <input value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirmar contraseña" type="password" style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'white', fontSize: '0.9rem', outline: 'none' }} />
            </div>
            {mensaje && <div style={{ fontSize: '0.85rem', color: mensaje.includes('Error') ? '#f87171' : '#22c55e', textAlign: 'center', marginTop: '12px' }}>{mensaje}</div>}
            <button onClick={handleSubmit} disabled={loading} style={{ padding: '13px', borderRadius: '10px', border: 'none', marginTop: '16px', background: '#22c55e', color: 'white', fontSize: '0.95rem', fontWeight: 700, cursor: loading ? 'wait' : 'pointer', width: '100%' }}>
              {loading ? 'Procesando...' : 'Actualizar contraseña'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
