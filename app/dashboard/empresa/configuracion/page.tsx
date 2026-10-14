'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../supabase'
import { useEmpresa } from '../_lib/contexto'
import { comunasDe, iniciales, regiones, RUTA } from '../_lib/datos'
import { Aviso, Btn, C, Campo, Card, inputStyle, PageHeader } from '../_lib/ui'

const RUBROS = ['Transporte de carga', 'Transporte de pasajeros', 'Minería', 'Logística y distribución', 'Construcción', 'Forestal', 'Agrícola', 'Servicios', 'Otro']

export default function Configuracion() {
  const router = useRouter()
  const { userId, perfil, recargarPerfil, avisar } = useEmpresa()
  const [f, setF] = useState({
    nombre_empresa: perfil.nombre_empresa || '', rut_empresa: perfil.rut_empresa || '', rubro: perfil.rubro || '',
    descripcion_empresa: perfil.descripcion_empresa || '', sitio_web: perfil.sitio_web || '', region: perfil.region || '',
    comuna: perfil.comuna || '', nombre: perfil.nombre || '', apellido: perfil.apellido || '', telefono: perfil.telefono || '', email: perfil.email || '',
  })
  const [guardando, setGuardando] = useState(false)
  const [subiendo, setSubiendo] = useState(false)
  const [clave, setClave] = useState({ nueva: '', repetir: '' })
  const [error, setError] = useState('')
  const set = (k: string, v: string) => setF(x => ({ ...x, [k]: v }))

  const guardar = async () => {
    setError('')
    if (!f.nombre_empresa.trim()) return setError('El nombre de la empresa es obligatorio.')
    setGuardando(true)
    const datos: any = { ...f }
    Object.keys(datos).forEach(k => { if (typeof datos[k] === 'string') datos[k] = datos[k].trim() || null })
    if (datos.sitio_web && !/^https?:\/\//.test(datos.sitio_web)) datos.sitio_web = 'https://' + datos.sitio_web
    const { error } = await supabase.from('profiles').update(datos).eq('id', userId)
    setGuardando(false)
    if (error) return setError('No se pudo guardar: ' + error.message)
    await recargarPerfil(); avisar('Datos de la empresa guardados')
  }

  const subirLogo = async (archivo?: File) => {
    if (!archivo) return
    if (!archivo.type.startsWith('image/')) return avisar('El logo debe ser una imagen (PNG o JPG)', 'error')
    if (archivo.size > 2 * 1024 * 1024) return avisar('El logo no puede pesar más de 2 MB', 'error')
    setSubiendo(true)
    const ext = archivo.name.split('.').pop()?.toLowerCase() || 'png'
    const path = `${userId}/logo_empresa.${ext}`
    const { error } = await supabase.storage.from('documentos').upload(path, archivo, { upsert: true })
    if (error) { setSubiendo(false); return avisar('No se pudo subir el logo: ' + error.message, 'error') }
    const { data } = supabase.storage.from('documentos').getPublicUrl(path)
    await supabase.from('profiles').update({ logo_url: `${data.publicUrl}?v=${Date.now()}` }).eq('id', userId)
    setSubiendo(false); await recargarPerfil(); avisar('Logo actualizado')
  }

  const cambiarClave = async () => {
    if (clave.nueva.length < 8) return avisar('La contraseña debe tener al menos 8 caracteres', 'error')
    if (clave.nueva !== clave.repetir) return avisar('Las contraseñas no coinciden', 'error')
    const { error } = await supabase.auth.updateUser({ password: clave.nueva })
    if (error) return avisar('No se pudo cambiar: ' + error.message, 'error')
    setClave({ nueva: '', repetir: '' }); avisar('Contraseña actualizada')
  }

  return (
    <div style={{ maxWidth: '860px' }}>
      <PageHeader titulo="Configuración de empresa" sub="Estos datos aparecen en tu perfil público y en tus avisos.">
        <Btn variante="secundario" onClick={() => router.push(`${RUTA}/perfil`)}>👁 Ver perfil público</Btn>
      </PageHeader>

      <Card style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ width: '84px', height: '84px', borderRadius: '12px', border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', background: 'white' }}>
            {perfil.logo_url ? <img src={perfil.logo_url} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <span style={{ color: C.orange, fontWeight: 900, fontSize: '1.4rem' }}>{iniciales(perfil.nombre_empresa)}</span>}
          </div>
          <div>
            <div style={{ fontWeight: 700, color: C.navy, marginBottom: '6px' }}>Logo de la empresa</div>
            <label style={{ display: 'inline-flex', background: C.blue, color: 'white', padding: '8px 14px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>
              {subiendo ? 'Subiendo...' : perfil.logo_url ? 'Cambiar logo' : 'Subir logo'}
              <input type="file" accept="image/png,image/jpeg,image/webp" onChange={e => subirLogo(e.target.files?.[0])} style={{ display: 'none' }} />
            </label>
            <div style={{ fontSize: '0.75rem', color: C.muted, marginTop: '6px' }}>PNG o JPG, máximo 2 MB.</div>
          </div>
        </div>
      </Card>

      <Card style={{ marginBottom: '16px' }}>
        <div style={{ fontWeight: 700, color: C.navy, marginBottom: '14px' }}>Datos de la empresa</div>
        <div className="nd-grid-2">
          <Campo label="Nombre de la empresa *"><input value={f.nombre_empresa} onChange={e => set('nombre_empresa', e.target.value)} style={inputStyle} /></Campo>
          <Campo label="RUT de la empresa"><input value={f.rut_empresa} onChange={e => set('rut_empresa', e.target.value)} style={inputStyle} placeholder="76.123.456-7" /></Campo>
          <Campo label="Rubro">
            <select value={f.rubro} onChange={e => set('rubro', e.target.value)} style={inputStyle}><option value="">Selecciona...</option>{RUBROS.map(r => <option key={r}>{r}</option>)}</select>
          </Campo>
          <Campo label="Sitio web"><input value={f.sitio_web} onChange={e => set('sitio_web', e.target.value)} style={inputStyle} placeholder="www.miempresa.cl" /></Campo>
          <Campo label="Región">
            <select value={f.region} onChange={e => { set('region', e.target.value); set('comuna', '') }} style={inputStyle}><option value="">Selecciona...</option>{regiones.map(r => <option key={r}>{r}</option>)}</select>
          </Campo>
          <Campo label="Comuna">
            <select value={f.comuna} onChange={e => set('comuna', e.target.value)} style={inputStyle} disabled={!f.region}><option value="">{f.region ? 'Selecciona...' : 'Primero elige región'}</option>{comunasDe(f.region).map(c => <option key={c}>{c}</option>)}</select>
          </Campo>
        </div>
        <Campo label="Descripción de la empresa" ayuda="Cuéntale a los conductores quiénes son, dónde operan y por qué trabajar con ustedes."><textarea rows={4} value={f.descripcion_empresa} onChange={e => set('descripcion_empresa', e.target.value)} style={{ ...inputStyle, resize: 'vertical' }} /></Campo>
      </Card>

      <Card style={{ marginBottom: '16px' }}>
        <div style={{ fontWeight: 700, color: C.navy, marginBottom: '14px' }}>Persona de contacto (administrador)</div>
        <div className="nd-grid-2">
          <Campo label="Nombre"><input value={f.nombre} onChange={e => set('nombre', e.target.value)} style={inputStyle} /></Campo>
          <Campo label="Apellido"><input value={f.apellido} onChange={e => set('apellido', e.target.value)} style={inputStyle} /></Campo>
          <Campo label="Teléfono"><input value={f.telefono} onChange={e => set('telefono', e.target.value)} style={inputStyle} placeholder="+56 9 1234 5678" /></Campo>
          <Campo label="Correo de contacto"><input type="email" value={f.email} onChange={e => set('email', e.target.value)} style={inputStyle} /></Campo>
        </div>
      </Card>

      {error && <Aviso tipo="error">{error}</Aviso>}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
        <Btn onClick={guardar} disabled={guardando}>{guardando ? 'Guardando...' : 'Guardar cambios'}</Btn>
      </div>

      <Card style={{ marginBottom: '40px' }}>
        <div style={{ fontWeight: 700, color: C.navy, marginBottom: '14px' }}>Cambiar contraseña</div>
        <div className="nd-grid-2">
          <Campo label="Nueva contraseña"><input type="password" value={clave.nueva} onChange={e => setClave(x => ({ ...x, nueva: e.target.value }))} style={inputStyle} autoComplete="new-password" /></Campo>
          <Campo label="Repetir contraseña"><input type="password" value={clave.repetir} onChange={e => setClave(x => ({ ...x, repetir: e.target.value }))} style={inputStyle} autoComplete="new-password" /></Campo>
        </div>
        <Btn variante="secundario" onClick={cambiarClave} disabled={!clave.nueva}>Actualizar contraseña</Btn>
      </Card>
    </div>
  )
}
