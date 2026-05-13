'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../supabase'

export default function Dashboard() {
  const router = useRouter()

  useEffect(() => {
    const redirigir = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/')
        return
      }
      const { data: profile } = await supabase
        .from('profiles')
        .select('tipo')
        .eq('id', user.id)
        .single()

      if (profile?.tipo === 'empresa') {
        router.push('/dashboard/empresa')
      } else {
        router.push('/dashboard/conductor')
      }
    }
    redirigir()
  }, [router])

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a1f35' }}>
      <p style={{ color: 'white', fontFamily: 'sans-serif', fontSize: '1.2rem' }}>Cargando tu dashboard...</p>
    </div>
  )
}
