'use client'
import { useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../../supabase'
import { regiones, regionesComunas } from './regiones'

export default function CompletarPerfil() {
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [pasoActivo, setPasoActivo] = useState(1)
  const [regionSel, setRegionSel] = useState('')
  const [comunaSel, setComunaSel] = useState('')
  const [dispFueraRegion, setDispFueraRegion] = useState('')
  const [nombreCompleto, setNombreCompleto] = useState('')
  const [rut, setRut] = useState('')
  const [fechaNacimiento, setFechaNacimiento] = useState('')
  const [telefono, setTelefono] = useState('')
  const [emailContacto, setEmailContacto] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [licenciasSel, setLicenciasSel] = useState<string[]>([])
  const [fechaVencimientoLicencia, setFechaVencimientoLicencia] = useState('')
  const [archivoLicencia, setArchivoLicencia] = useState<File | null>(null)
  const [fechasVencimiento, setFechasVencimiento] = useState<Record<string, string>>({})
  const [archivosLicencia, setArchivosLicencia] = useState<Record<string, File | null>>({})
  // Paso 3 - Experiencia
  const [anosExp, setAnosExp] = useState('')
  const [areasExp, setAreasExp] = useState<string[]>([])
  const [otraArea, setOtraArea] = useState('')
  const [tiposTrabajoExp, setTiposTrabajoExp] = useState<string[]>([])
  const [otroTrabajo, setOtroTrabajo] = useState('')
  const [turnosExp, setTurnosExp] = useState<string[]>([])
  const [otroTurno, setOtroTurno] = useState('')
  const [disponibilidadExp, setDisponibilidadExp] = useState<string[]>([])
  const [movilidadPropia, setMovilidadPropia] = useState('')
  // Paso 4 - Equipos
  const [equiposSel, setEquiposSel] = useState<string[]>([])
  const [otrosCamion, setOtrosCamion] = useState('')
  const [otrosMaquinaria, setOtrosMaquinaria] = useState('')
  const [otrosIzaje, setOtrosIzaje] = useState('')
  const [otrosEspeciales, setOtrosEspeciales] = useState('')
  // Paso 5 - Documentación
  const [docHojaVida, setDocHojaVida] = useState<File | null>(null)
  const [docHojaVidaUrl, setDocHojaVidaUrl] = useState('')
  const [fechaHojaVida, setFechaHojaVida] = useState('')
  const [noTengoHojaVida, setNoTengoHojaVida] = useState(false)
  const [docAntecedentes, setDocAntecedentes] = useState<File | null>(null)
  const [docAntecedentesUrl, setDocAntecedentesUrl] = useState('')
  const [fechaAntecedentes, setFechaAntecedentes] = useState('')
  const [noTengoAntecedentes, setNoTengoAntecedentes] = useState(false)
  const [docCedulaFrontal, setDocCedulaFrontal] = useState<File | null>(null)
  const [docCedulaFrontalUrl, setDocCedulaFrontalUrl] = useState('')
  const [docCedulaReverso, setDocCedulaReverso] = useState<File | null>(null)
  const [docCedulaReversoUrl, setDocCedulaReversoUrl] = useState('')
  const [noTengoCedula, setNoTengoCedula] = useState(false)
  const [docsCursos, setDocsCursos] = useState<File[]>([])
  const [docsCursosUrls, setDocsCursosUrls] = useState<string[]>([])
  const [estadoPreocupacional, setEstadoPreocupacional] = useState('')
  const [docPreocupacional, setDocPreocupacional] = useState<File | null>(null)
  const [docPreocupacionalUrl, setDocPreocupacionalUrl] = useState('')
  const [noTengoPreocupacional, setNoTengoPreocupacional] = useState(false)
  const [docsExperiencia, setDocsExperiencia] = useState<File[]>([])
  const [docsExperienciaUrls, setDocsExperienciaUrls] = useState<string[]>([])
  const [noTengoExpDoc, setNoTengoExpDoc] = useState(false)
  const [docsFiniquitos, setDocsFiniquitos] = useState<File[]>([])
  const [docsFiniquitosUrls, setDocsFiniquitosUrls] = useState<string[]>([])
  const [noTengoFiniquitos, setNoTengoFiniquitos] = useState(false)
  const [docResidencia, setDocResidencia] = useState<File | null>(null)
  const [docResidenciaUrl, setDocResidenciaUrl] = useState('')
  const [noTengoResidencia, setNoTengoResidencia] = useState(false)
  const [docsOtros, setDocsOtros] = useState<File[]>([])
  const [docsOtrosUrls, setDocsOtrosUrls] = useState<string[]>([])
  const [noTengoOtros, setNoTengoOtros] = useState(false)
  // Paso 6 - Foto y CV
  const [fotoPerfil, setFotoPerfil] = useState<File | null>(null)
  const [fotoPerfilUrl, setFotoPerfilUrl] = useState('')
  const [fotoPreview, setFotoPreview] = useState('')

  const handleFotoChange = (file: File | null) => {
    if (!file) return
    setFotoPerfil(file)
    const reader = new FileReader()
    reader.onload = e => setFotoPreview(e.target?.result as string)
    reader.readAsDataURL(file)
  }
  const [equiposDetalle, setEquiposDetalle] = useState<Record<string, {anos: string, dominio: string, marca: string, modelo: string}>>({})

  const toggleEquipo = (id: string) => {
    setEquiposSel(prev => {
      if (prev.includes(id)) {
        const next = prev.filter(e => e !== id)
        setEquiposDetalle(d => { const nd = {...d}; delete nd[id]; return nd })
        return next
      }
      setEquiposDetalle(d => ({ ...d, [id]: { anos: '', dominio: '', marca: '', modelo: '' } }))
      return [...prev, id]
    })
  }

  const updateDetalle = (equipo: string, campo: string, valor: string) => {
    setEquiposDetalle(prev => ({ ...prev, [equipo]: { ...prev[equipo], [campo]: valor } }))
  }

  const licenciasDisponibles = [
    { id: 'A1', nombre: 'Clase A1', desc: 'Motocicletas' },
    { id: 'A2', nombre: 'Clase A2', desc: 'Vehículos particulares' },
    { id: 'A3', nombre: 'Clase A3', desc: 'Transporte de pasajeros' },
    { id: 'A4', nombre: 'Clase A4', desc: 'Transporte de carga' },
    { id: 'A5', nombre: 'Clase A5', desc: 'Transporte de carga pesada' },
    { id: 'D', nombre: 'Clase D', desc: 'Transporte de pasajeros' },
    { id: 'E', nombre: 'Clase E', desc: 'Vehículos articulados o con remolque' },
    { id: 'F', nombre: 'Clase F', desc: 'Vehículos especiales o maquinaria' },
  ]

  const toggleLicencia = (id: string) => {
    setLicenciasSel(prev => prev.includes(id) ? prev.filter(l => l !== id) : [...prev, id])
  }

  const licenciaPrincipal = licenciasSel.filter(l => l !== 'otros')[licenciasSel.filter(l => l !== 'otros').length - 1] || ''

  const handleGuardarPaso2 = async (salir: boolean, avanzar?: number) => {
    setGuardando(true)
    setMensaje('')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setGuardando(false); return }

    const documentosUrls: Record<string, string> = {}
    for (const [licId, archivo] of Object.entries(archivosLicencia)) {
      if (archivo) {
        const ext = archivo.name.split('.').pop()
        const path = `${user.id}/licencia_${licId}.${ext}`
        const { error: uploadError } = await supabase.storage.from('documentos').upload(path, archivo, { upsert: true })
        if (!uploadError) {
          const { data: urlData } = supabase.storage.from('documentos').getPublicUrl(path)
          documentosUrls[licId] = urlData.publicUrl
        }
      }
    }

    const { error } = await supabase.from('profiles').update({
      licencias: licenciasSel,
      licencias_vencimientos: fechasVencimiento,
      ...(Object.keys(documentosUrls).length ? { licencias_documentos: documentosUrls } : {}),
    }).eq('id', user.id)

    if (error) {
      setMensaje('Error al guardar: ' + error.message)
    } else {
      setMensaje('✅ Progreso guardado')
      if (salir) router.push('/dashboard/conductor')
      else if (avanzar) setPasoActivo(avanzar)
    }
    setGuardando(false)
  }

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push('/'); return }
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(data)
      if (data) {
        setNombreCompleto(`${data.nombre || ''} ${data.apellido || ''}`.trim())
        setRut(data.rut || '')
        setFechaNacimiento(data.fecha_nacimiento || '')
        setTelefono(data.telefono || '')
        setEmailContacto(data.email || '')
        setRegionSel(data.region || '')
        setComunaSel(data.comuna || '')
        setDispFueraRegion(data.disponibilidad_fuera_region || '')
        setLicenciasSel(data.licencias || [])
        setFechasVencimiento(data.licencias_vencimientos || {})
        setAnosExp(data.anos_experiencia || '')
        setAreasExp(data.areas_experiencia || [])
        setOtraArea(data.otra_area || '')
        setTiposTrabajoExp(data.tipos_trabajo || [])
        setOtroTrabajo(data.otro_trabajo || '')
        setTurnosExp(data.turnos_experiencia || [])
        setOtroTurno(data.otro_turno || '')
        setDisponibilidadExp(data.disponibilidad_trabajo || [])
        setMovilidadPropia(data.movilidad_propia || '')
        setEquiposSel(data.equipos_sel || [])
        setEquiposDetalle(data.equipos_detalle || {})
        setOtrosCamion(data.otros_camion || '')
        setOtrosMaquinaria(data.otros_maquinaria || '')
        setOtrosIzaje(data.otros_izaje || '')
        setOtrosEspeciales(data.otros_especiales || '')
        setDocHojaVidaUrl(data.doc_hoja_vida_url || '')
        setFechaHojaVida(data.fecha_hoja_vida || '')
        setNoTengoHojaVida(data.no_tengo_hoja_vida || false)
        setDocAntecedentesUrl(data.doc_antecedentes_url || '')
        setFechaAntecedentes(data.fecha_antecedentes || '')
        setNoTengoAntecedentes(data.no_tengo_antecedentes || false)
        setDocCedulaFrontalUrl(data.doc_cedula_frontal_url || '')
        setDocCedulaReversoUrl(data.doc_cedula_reverso_url || '')
        setNoTengoCedula(data.no_tengo_cedula || false)
        setDocsCursosUrls(data.docs_cursos_urls || [])
        setEstadoPreocupacional(data.estado_preocupacional || '')
        setDocPreocupacionalUrl(data.doc_preocupacional_url || '')
        setNoTengoPreocupacional(data.no_tengo_preocupacional || false)
        setDocsExperienciaUrls(data.docs_experiencia_urls || [])
        setNoTengoExpDoc(data.no_tengo_exp_doc || false)
        setDocsFiniquitosUrls(data.docs_finiquitos_urls || [])
        setNoTengoFiniquitos(data.no_tengo_finiquitos || false)
        setDocResidenciaUrl(data.doc_residencia_url || '')
        setNoTengoResidencia(data.no_tengo_residencia || false)
        setDocsOtrosUrls(data.docs_otros_urls || [])
        setNoTengoOtros(data.no_tengo_otros || false)
        setFotoPerfilUrl(data.foto_perfil_url || '')
        if (data.foto_perfil_url) setFotoPreview(data.foto_perfil_url)
      }
    })
  }, [])

  const subirArchivo = async (file: File, path: string): Promise<string> => {
    const { error } = await supabase.storage.from('documentos').upload(path, file, { upsert: true })
    if (error) return ''
    const { data } = supabase.storage.from('documentos').getPublicUrl(path)
    return data.publicUrl
  }

  const subirArchivos = async (files: File[], userId: string, prefijo: string): Promise<string[]> => {
    const urls: string[] = []
    for (let i = 0; i < files.length; i++) {
      const ext = files[i].name.split('.').pop()
      const url = await subirArchivo(files[i], `${userId}/${prefijo}_${i}.${ext}`)
      if (url) urls.push(url)
    }
    return urls
  }

  const cvRef = useRef<HTMLDivElement>(null)

  const descargarCV = async () => {
    if (!cvRef.current) return
    const html2canvas = (await import('html2canvas')).default
    const jsPDF = (await import('jspdf')).default
    const canvas = await html2canvas(cvRef.current, { scale: 2, useCORS: true })
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
    pdf.save(`CV_${nombreCompleto.replace(/ /g, '_') || 'NetDriver'}.pdf`)
  }

  const handleGuardarPaso6 = async (salir: boolean) => {
    setGuardando(true)
    setMensaje('')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setGuardando(false); return }

    let fotoUrl = fotoPerfilUrl
    if (fotoPerfil) {
      const ext = fotoPerfil.name.split('.').pop()
      fotoUrl = await subirArchivo(fotoPerfil, `${user.id}/foto_perfil.${ext}`)
    }

    const { error } = await supabase.from('profiles').update({
      foto_perfil_url: fotoUrl,
      perfil_completo: true,
    }).eq('id', user.id)

    if (error) {
      setMensaje('Error al guardar: ' + error.message)
    } else {
      setMensaje('✅ Perfil completado')
      if (salir) router.push('/dashboard/conductor')
    }
    setGuardando(false)
  }

  const handleGuardarPaso5 = async (salir: boolean, avanzar?: number) => {
    setGuardando(true)
    setMensaje('')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setGuardando(false); return }

    let hojaVidaUrl = docHojaVidaUrl
    if (docHojaVida) hojaVidaUrl = await subirArchivo(docHojaVida, `${user.id}/hoja_vida.${docHojaVida.name.split('.').pop()}`)

    let antecedentesUrl = docAntecedentesUrl
    if (docAntecedentes) antecedentesUrl = await subirArchivo(docAntecedentes, `${user.id}/antecedentes.${docAntecedentes.name.split('.').pop()}`)

    let cedulaFrontalUrl = docCedulaFrontalUrl
    if (docCedulaFrontal) cedulaFrontalUrl = await subirArchivo(docCedulaFrontal, `${user.id}/cedula_frontal.${docCedulaFrontal.name.split('.').pop()}`)

    let cedulaReversoUrl = docCedulaReversoUrl
    if (docCedulaReverso) cedulaReversoUrl = await subirArchivo(docCedulaReverso, `${user.id}/cedula_reverso.${docCedulaReverso.name.split('.').pop()}`)

    let cursosUrls = docsCursosUrls
    if (docsCursos.length > 0) cursosUrls = await subirArchivos(docsCursos, user.id, 'curso')

    let preocupacionalUrl = docPreocupacionalUrl
    if (docPreocupacional) preocupacionalUrl = await subirArchivo(docPreocupacional, `${user.id}/preocupacional.${docPreocupacional.name.split('.').pop()}`)

    let experienciaUrls = docsExperienciaUrls
    if (docsExperiencia.length > 0) experienciaUrls = await subirArchivos(docsExperiencia, user.id, 'experiencia')

    let finiquitosUrls = docsFiniquitosUrls
    if (docsFiniquitos.length > 0) finiquitosUrls = await subirArchivos(docsFiniquitos, user.id, 'finiquito')

    let residenciaUrl = docResidenciaUrl
    if (docResidencia) residenciaUrl = await subirArchivo(docResidencia, `${user.id}/residencia.${docResidencia.name.split('.').pop()}`)

    let otrosUrls = docsOtrosUrls
    if (docsOtros.length > 0) otrosUrls = await subirArchivos(docsOtros, user.id, 'otro')

    const { error } = await supabase.from('profiles').update({
      doc_hoja_vida_url: hojaVidaUrl, fecha_hoja_vida: fechaHojaVida || null, no_tengo_hoja_vida: noTengoHojaVida,
      doc_antecedentes_url: antecedentesUrl, fecha_antecedentes: fechaAntecedentes || null, no_tengo_antecedentes: noTengoAntecedentes,
      doc_cedula_frontal_url: cedulaFrontalUrl, doc_cedula_reverso_url: cedulaReversoUrl, no_tengo_cedula: noTengoCedula,
      docs_cursos_urls: cursosUrls,
      estado_preocupacional: estadoPreocupacional, doc_preocupacional_url: preocupacionalUrl, no_tengo_preocupacional: noTengoPreocupacional,
      docs_experiencia_urls: experienciaUrls, no_tengo_exp_doc: noTengoExpDoc,
      docs_finiquitos_urls: finiquitosUrls, no_tengo_finiquitos: noTengoFiniquitos,
      doc_residencia_url: residenciaUrl, no_tengo_residencia: noTengoResidencia,
      docs_otros_urls: otrosUrls, no_tengo_otros: noTengoOtros,
    }).eq('id', user.id)

    if (error) {
      setMensaje('Error al guardar: ' + error.message)
    } else {
      setMensaje('✅ Progreso guardado')
      if (salir) router.push('/dashboard/conductor')
      else if (avanzar) setPasoActivo(avanzar)
    }
    setGuardando(false)
  }

  const handleGuardarPaso4 = async (salir: boolean, avanzar?: number) => {
    setGuardando(true)
    setMensaje('')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setGuardando(false); return }
    const { error } = await supabase.from('profiles').update({
      equipos_sel: equiposSel,
      equipos_detalle: equiposDetalle,
      otros_camion: otrosCamion,
      otros_maquinaria: otrosMaquinaria,
      otros_izaje: otrosIzaje,
      otros_especiales: otrosEspeciales,
    }).eq('id', user.id)
    if (error) {
      setMensaje('Error al guardar: ' + error.message)
    } else {
      setMensaje('✅ Progreso guardado')
      if (salir) router.push('/dashboard/conductor')
      else if (avanzar) setPasoActivo(avanzar)
    }
    setGuardando(false)
  }

  const handleGuardarPaso3 = async (salir: boolean, avanzar?: number) => {
    setGuardando(true)
    setMensaje('')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setGuardando(false); return }
    const { error } = await supabase.from('profiles').update({
      anos_experiencia: anosExp,
      areas_experiencia: areasExp,
      otra_area: otraArea,
      tipos_trabajo: tiposTrabajoExp,
      otro_trabajo: otroTrabajo,
      turnos_experiencia: turnosExp,
      otro_turno: otroTurno,
      disponibilidad_trabajo: disponibilidadExp,
      movilidad_propia: movilidadPropia,
    }).eq('id', user.id)
    if (error) {
      setMensaje('Error al guardar: ' + error.message)
    } else {
      setMensaje('✅ Progreso guardado')
      if (salir) router.push('/dashboard/conductor')
      else if (avanzar) setPasoActivo(avanzar)
    }
    setGuardando(false)
  }

  const handleGuardar = async (salir: boolean, avanzar?: number) => {
    setGuardando(true)
    setMensaje('')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setGuardando(false); return }

    const partesNombre = nombreCompleto.trim().split(' ')
    const nombre = partesNombre[0] || ''
    const apellido = partesNombre.slice(1).join(' ') || ''

    const { error } = await supabase.from('profiles').update({
      nombre, apellido,
      rut,
      fecha_nacimiento: fechaNacimiento || null,
      telefono,
      email: emailContacto,
      region: regionSel,
      comuna: comunaSel,
      disponibilidad_fuera_region: dispFueraRegion,
    }).eq('id', user.id)

    if (error) {
      setMensaje('Error al guardar: ' + error.message)
    } else {
      setMensaje('✅ Progreso guardado')
      if (salir) router.push('/dashboard/conductor')
      else if (avanzar) setPasoActivo(avanzar)
    }
    setGuardando(false)
  }

  const pasos = [
    { num: 1, label: 'Información\nPersonal' },
    { num: 2, label: 'Licencias' },
    { num: 3, label: 'Experiencia' },
    { num: 4, label: 'Equipos' },
    { num: 5, label: 'Documentación' },
    { num: 6, label: 'Foto y CV' },
  ]

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f4f7fa', fontFamily: "'Barlow', sans-serif" }}>
      {/* SIDEBAR */}
      <div style={{ width: '220px', minWidth: '220px', background: '#020D24', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, height: '100vh', overflowY: 'auto', zIndex: 50 }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: '10px', background: '#020D24' }}>
          <img src="/NetDriver_Logo.png" alt="NetDriver" onClick={() => router.push('/')} style={{ height: '68px', width: '220px', objectFit: 'contain', cursor: 'pointer' }} />
        </div>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '12px' }}>
            <div style={{ position: 'relative', width: '72px', height: '72px' }}>
              <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'white', fontSize: '1.4rem', border: '3px solid #2563eb' }}>
                {profile?.nombre?.[0]}{profile?.apellido?.[0]}
              </div>
            </div>
          </div>
          <div style={{ marginBottom: '8px' }}>
            <div style={{ fontWeight: 700, color: 'white', fontSize: '0.95rem' }}>{profile?.nombre} {profile?.apellido}</div>
            <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', marginTop: '2px' }}>Conductor Profesional</div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-start', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
            <span style={{ background: 'rgba(39,174,96,0.15)', border: '1px solid rgba(39,174,96,0.4)', color: '#2ecc71', fontSize: '0.65rem', padding: '2px 8px', borderRadius: '20px' }}>✓ Perfil verificado</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '6px', marginBottom: '12px' }}>
            <span style={{ color: '#f39c12', fontSize: '0.85rem' }}>★★★★★</span>
            <span style={{ color: 'white', fontSize: '0.85rem', fontWeight: 600 }}>4.8</span>
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem' }}>(128 reseñas)</span>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
              <div style={{ position: 'relative', width: '48px', height: '48px', flexShrink: 0 }}>
                <svg width="48" height="48" viewBox="0 0 48 48">
                  <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="4"/>
                  <circle cx="24" cy="24" r="20" fill="none" stroke="#22c55e" strokeWidth="4" strokeDasharray="125.6" strokeDashoffset="18.8" strokeLinecap="round" transform="rotate(-90 24 24)"/>
                </svg>
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', fontSize: '0.65rem', fontWeight: 700, color: 'white' }}>85%</div>
              </div>
              <div>
                <div style={{ fontWeight: 700, color: 'white', fontSize: '0.8rem' }}>Perfil incompleto</div>
                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.3 }}>Completa tu perfil para tener más oportunidades.</div>
              </div>
            </div>
            <button onClick={() => router.push('/dashboard/conductor/completar-perfil')} style={{ width: '100%', background: '#2563eb', border: 'none', color: 'white', borderRadius: '8px', padding: '8px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}>Completar perfil</button>
          </div>
        </div>

        {/* Beneficios */}
        <div style={{ margin: '16px 20px 0', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '16px' }}>
          <div style={{ color: 'white', fontWeight: 700, fontSize: '0.85rem', marginBottom: '12px' }}>Al completar tu perfil obtendrás:</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#22c55e', fontSize: '0.9rem' }}><i className="ti ti-file-text" style={{ fontSize: '1rem' }}></i></span>
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.78rem' }}>CV profesional descargable</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#22c55e', fontSize: '0.9rem' }}><i className="ti ti-eye" style={{ fontSize: '1rem' }}></i></span>
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.78rem' }}>Más visibilidad para empresas</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#22c55e', fontSize: '0.9rem' }}><i className="ti ti-star" style={{ fontSize: '1rem' }}></i></span>
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.78rem' }}>Postulaciones prioritarias</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#22c55e', fontSize: '0.9rem' }}><i className="ti ti-circle-check" style={{ fontSize: '1rem' }}></i></span>
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.78rem' }}>Sello NetDriver Verificado</span>
            </div>
          </div>
        </div>

        {/* Ayuda */}
        <div style={{ margin: '12px 20px 16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '14px', display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' }}>
          <span style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.6 15.36 3.49 16.86L2.05 22L7.3 20.62C8.74 21.41 10.37 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2ZM12.04 20.16C10.56 20.16 9.11 19.76 7.85 19L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.22 15 3.79 13.47 3.79 11.91C3.79 7.37 7.5 3.66 12.05 3.66C14.25 3.66 16.31 4.51 17.85 6.06C19.39 7.61 20.29 9.66 20.29 11.92C20.29 16.46 16.58 20.16 12.04 20.16ZM16.56 13.99C16.31 13.87 15.09 13.27 14.87 13.19C14.65 13.1 14.49 13.06 14.32 13.31C14.16 13.55 13.69 14.13 13.55 14.29C13.41 14.45 13.26 14.46 13.02 14.34C12.79 14.22 11.99 13.94 11.27 13.29C10.71 12.78 10.34 12.16 10.21 11.91C10.07 11.66 10.19 11.53 10.32 11.41C10.43 11.3 10.57 11.13 10.7 10.98C10.83 10.83 10.88 10.72 10.97 10.55C11.06 10.38 11.01 10.27 10.95 10.15C10.88 10.04 10.32 8.75 10.13 8.27C9.94 7.79 9.74 7.84 9.59 7.84C9.44 7.83 9.27 7.83 9.1 7.83C8.93 7.83 8.65 7.9 8.4 8.17C8.15 8.43 7.41 9.13 7.41 10.42C7.41 11.71 8.42 12.96 8.55 13.13C8.69 13.3 10.32 15.93 12.9 16.91C15.48 17.89 15.48 17.56 15.96 17.51C16.43 17.46 17.51 16.84 17.74 16.18C17.96 15.52 17.96 14.95 17.88 14.83C17.79 14.71 17.6 14.65 17.36 14.53L16.56 13.99Z"/></svg>
          </span>
          <div>
            <div style={{ color: 'white', fontWeight: 700, fontSize: '0.8rem' }}>¿Necesitas ayuda?</div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.72rem', marginTop: '2px' }}>Escríbenos por WhatsApp</div>
          </div>
        </div>

        <nav style={{ flex: 1, padding: '10px 0' }}></nav>
      </div>

      {/* MAIN */}
      <div style={{ marginLeft: '220px', flex: 1, padding: '28px' }}>
        <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #e8eef5', overflow: 'hidden' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '24px 28px', borderBottom: '1px solid #e8eef5' }}>
            <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#e8f0fe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>📝</div>
              <div>
                <h1 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1a3a5c', margin: 0 }}>Completa tu perfil</h1>
                <p style={{ color: '#8fa3b8', fontSize: '0.85rem', margin: '2px 0 0' }}>Sigue estos pasos y obtén tu CV profesional</p>
              </div>
            </div>
            <button onClick={() => pasoActivo === 1 ? handleGuardar(true) : pasoActivo === 2 ? handleGuardarPaso2(true) : pasoActivo === 3 ? handleGuardarPaso3(true) : pasoActivo === 4 ? handleGuardarPaso4(true) : pasoActivo === 5 ? handleGuardarPaso5(true) : handleGuardarPaso6(true)} disabled={guardando} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'transparent', border: '1px solid #e8eef5', color: '#1a3a5c', padding: '8px 14px', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 600, cursor: guardando ? 'wait' : 'pointer' }}>📄 {guardando ? 'Guardando...' : 'Guardar y salir'}</button>
          </div>

          {/* Stepper */}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '28px 40px', borderBottom: '1px solid #e8eef5' }}>
            {pasos.map((p, i) => (
              <div key={p.num} style={{ display: 'flex', alignItems: 'center', flex: i < pasos.length - 1 ? 1 : 'none' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: pasoActivo >= p.num ? '#2563eb' : '#e8eef5', color: pasoActivo >= p.num ? 'white' : '#8fa3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.95rem' }}>{pasoActivo > p.num ? '✓' : p.num}</div>
                  <div style={{ fontSize: '0.78rem', color: pasoActivo >= p.num ? '#2563eb' : '#8fa3b8', fontWeight: pasoActivo >= p.num ? 700 : 500, textAlign: 'center', whiteSpace: 'pre-line', lineHeight: 1.3 }}>{p.label}</div>
                </div>
                {i < pasos.length - 1 && <div style={{ flex: 1, height: '2px', background: pasoActivo > p.num ? '#2563eb' : '#e8eef5', margin: '0 8px', marginTop: '-20px' }} />}
              </div>
            ))}
          </div>

          {/* Contenido del paso */}
          <div style={{ padding: '28px 40px' }}>
            {pasoActivo === 1 && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                  <div>
                    <div style={{ color: '#2563eb', fontWeight: 700, fontSize: '0.85rem', marginBottom: '4px' }}>Paso 1 de 6</div>
                    <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1a3a5c', margin: 0 }}>Información personal</h2>
                    <p style={{ color: '#8fa3b8', fontSize: '0.88rem', margin: '4px 0 0' }}>Cuéntanos tus datos básicos</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#f4f7fa', border: '1px solid #e8eef5', borderRadius: '10px', padding: '10px 16px' }}>
                    <span style={{ color: '#22c55e', fontSize: '1.1rem' }}>🛡️</span>
                    <div>
                      <div style={{ fontWeight: 700, color: '#1a3a5c', fontSize: '0.82rem' }}>Tu información está segura</div>
                      <div style={{ color: '#8fa3b8', fontSize: '0.75rem' }}>Encriptamos tus datos</div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#1a3a5c', display: 'block', marginBottom: '6px' }}>Nombre completo</label>
                    <input value={nombreCompleto} onChange={e => setNombreCompleto(e.target.value)} placeholder="Ingresa tu nombre completo" style={{ width: '100%', background: '#f4f7fa', border: '1px solid #e8eef5', borderRadius: '8px', padding: '11px 14px', fontSize: '0.88rem', outline: 'none', color: '#1a3a5c', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#1a3a5c', display: 'block', marginBottom: '6px' }}>RUT</label>
                    <input value={rut} onChange={e => setRut(e.target.value)} placeholder="12.345.678-9" style={{ width: '100%', background: '#f4f7fa', border: '1px solid #e8eef5', borderRadius: '8px', padding: '11px 14px', fontSize: '0.88rem', outline: 'none', color: '#1a3a5c', boxSizing: 'border-box' }} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#1a3a5c', display: 'block', marginBottom: '6px' }}>Fecha de nacimiento</label>
                    <input type="date" value={fechaNacimiento} onChange={e => setFechaNacimiento(e.target.value)} style={{ width: '100%', background: '#f4f7fa', border: '1px solid #e8eef5', borderRadius: '8px', padding: '11px 14px', fontSize: '0.88rem', outline: 'none', color: '#1a3a5c', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#1a3a5c', display: 'block', marginBottom: '6px' }}>Teléfono</label>
                    <input value={telefono} onChange={e => setTelefono(e.target.value)} placeholder="+56 9 1234 5678" style={{ width: '100%', background: '#f4f7fa', border: '1px solid #e8eef5', borderRadius: '8px', padding: '11px 14px', fontSize: '0.88rem', outline: 'none', color: '#1a3a5c', boxSizing: 'border-box' }} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#1a3a5c', display: 'block', marginBottom: '6px' }}>Correo electrónico</label>
                    <input value={emailContacto} onChange={e => setEmailContacto(e.target.value)} placeholder="correo@ejemplo.com" style={{ width: '100%', background: '#f4f7fa', border: '1px solid #e8eef5', borderRadius: '8px', padding: '11px 14px', fontSize: '0.88rem', outline: 'none', color: '#1a3a5c', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#1a3a5c', display: 'block', marginBottom: '6px' }}>Región</label>
                    <select value={regionSel} onChange={e => { setRegionSel(e.target.value); setComunaSel('') }} style={{ width: '100%', background: '#f4f7fa', border: '1px solid #e8eef5', borderRadius: '8px', padding: '11px 14px', fontSize: '0.88rem', outline: 'none', color: '#1a3a5c' }}>
                      <option value="">Selecciona tu región</option>
                      {regiones.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#1a3a5c', display: 'block', marginBottom: '6px' }}>Comuna</label>
                    <select value={comunaSel} onChange={e => setComunaSel(e.target.value)} disabled={!regionSel} style={{ width: '100%', background: regionSel ? '#f4f7fa' : '#eef1f5', border: '1px solid #e8eef5', borderRadius: '8px', padding: '11px 14px', fontSize: '0.88rem', outline: 'none', color: regionSel ? '#1a3a5c' : '#8fa3b8', cursor: regionSel ? 'pointer' : 'not-allowed' }}>
                      <option value="">{regionSel ? 'Selecciona tu comuna' : 'Primero selecciona una región'}</option>
                      {regionSel && regionesComunas[regionSel]?.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#1a3a5c', display: 'block', marginBottom: '6px' }}>Disponibilidad para trabajar fuera de su región</label>
                    <select value={dispFueraRegion} onChange={e => setDispFueraRegion(e.target.value)} style={{ width: '100%', background: '#f4f7fa', border: '1px solid #e8eef5', borderRadius: '8px', padding: '11px 14px', fontSize: '0.88rem', outline: 'none', color: '#1a3a5c' }}>
                      <option value="">Selecciona una opción</option>
                      <option value="si">Sí</option>
                      <option value="no">No</option>
                    </select>
                  </div>
                </div>

                <div style={{ background: '#f4f7fa', border: '1px solid #e8eef5', borderRadius: '10px', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
                  <span style={{ color: '#2563eb' }}>ℹ️</span>
                  <span style={{ color: '#8fa3b8', fontSize: '0.85rem' }}>Esta información será utilizada para crear tu perfil y generar tu CV profesional.</span>
                </div>

                {mensaje && <div style={{ fontSize: '0.85rem', color: mensaje.includes('Error') ? '#e74c3c' : '#22c55e', marginBottom: '16px', textAlign: 'right' }}>{mensaje}</div>}

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <button onClick={() => router.push('/dashboard/conductor')} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#2563eb', border: 'none', color: 'white', padding: '12px 28px', borderRadius: '8px', fontSize: '0.92rem', fontWeight: 700, cursor: 'pointer' }}>← Volver atrás</button>
                  <button onClick={() => handleGuardar(false, 2)} disabled={guardando} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#2563eb', border: 'none', color: 'white', padding: '12px 28px', borderRadius: '8px', fontSize: '0.92rem', fontWeight: 700, cursor: guardando ? 'wait' : 'pointer' }}>{guardando ? 'Guardando...' : 'Continuar →'}</button>
                </div>
              </>
            )}
            {pasoActivo === 2 && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                  <div>
                    <div style={{ color: '#2563eb', fontWeight: 700, fontSize: '0.85rem', marginBottom: '4px' }}>Paso 2 de 6</div>
                    <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1a3a5c', margin: 0 }}>Licencias</h2>
                    <p style={{ color: '#8fa3b8', fontSize: '0.88rem', margin: '4px 0 0' }}>Selecciona todas las licencias que posees</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#f4f7fa', border: '1px solid #e8eef5', borderRadius: '10px', padding: '10px 16px' }}>
                    <span style={{ color: '#22c55e', fontSize: '1.1rem' }}>🛡️</span>
                    <div>
                      <div style={{ fontWeight: 700, color: '#1a3a5c', fontSize: '0.82rem' }}>Tus licencias están seguras</div>
                      <div style={{ color: '#8fa3b8', fontSize: '0.75rem' }}>Solo las empresas verificadas podrán verlas.</div>
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1a3a5c', marginBottom: '14px' }}>Selecciona tus licencias</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                    {licenciasDisponibles.map(lic => (
                      <div key={lic.id} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div onClick={() => toggleLicencia(lic.id)} style={{ position: 'relative', background: licenciasSel.includes(lic.id) ? '#eaf1fe' : '#fff', border: licenciasSel.includes(lic.id) ? '2px solid #2563eb' : '1px solid #e8eef5', borderRadius: '10px', padding: '20px 12px', textAlign: 'center', cursor: 'pointer' }}>
                          <input type="checkbox" checked={licenciasSel.includes(lic.id)} onChange={() => {}} onClick={e => e.stopPropagation()} style={{ position: 'absolute', top: '10px', left: '10px', width: '16px', height: '16px', accentColor: '#2563eb', pointerEvents: 'none' }} />
                          <div style={{ width: '46px', height: '46px', borderRadius: '10px', background: '#eef1f5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
                            <i className="ti ti-id-badge-2" style={{ fontSize: '1.4rem', color: '#8fa3b8' }}></i>
                          </div>
                          <div style={{ fontWeight: 700, color: '#1a3a5c', fontSize: '0.92rem', marginBottom: '2px' }}>{lic.nombre}</div>
                          <div style={{ color: '#8fa3b8', fontSize: '0.78rem' }}>{lic.desc}</div>
                        </div>
                        {licenciasSel.includes(lic.id) && (
                          <>
                            <div>
                              <label style={{ fontSize: '0.7rem', fontWeight: 600, color: '#1a3a5c', display: 'block', marginBottom: '4px' }}>Vencimiento</label>
                              <input type="date" value={fechasVencimiento[lic.id] || ''} onChange={e => setFechasVencimiento(prev => ({ ...prev, [lic.id]: e.target.value }))} style={{ width: '100%', background: '#f4f7fa', border: '1px solid #e8eef5', borderRadius: '6px', padding: '6px 8px', fontSize: '0.72rem', outline: 'none', color: '#1a3a5c', boxSizing: 'border-box' }} />
                            </div>
                            <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px', border: '1.5px dashed #e8eef5', borderRadius: '6px', padding: '12px 4px', cursor: 'pointer', textAlign: 'center', background: '#fafbfc' }}>
                              <i className="ti ti-cloud-upload" style={{ fontSize: '1.4rem', color: '#8fa3b8' }}></i>
                              <span style={{ color: '#2563eb', fontWeight: 600, fontSize: '0.8rem', wordBreak: 'break-all', maxWidth: '100%' }}>{archivosLicencia[lic.id] ? archivosLicencia[lic.id]!.name : 'Subir documento'}</span>
                              <input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={e => setArchivosLicencia(prev => ({ ...prev, [lic.id]: e.target.files?.[0] || null }))} style={{ display: 'none' }} />
                            </label>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>


                {mensaje && <div style={{ fontSize: '0.85rem', color: mensaje.includes('Error') ? '#e74c3c' : '#22c55e', marginBottom: '16px', textAlign: 'right' }}>{mensaje}</div>}

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <button onClick={() => setPasoActivo(1)} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#2563eb', border: 'none', color: 'white', padding: '12px 28px', borderRadius: '8px', fontSize: '0.92rem', fontWeight: 700, cursor: 'pointer' }}>← Volver atrás</button>
                  <button onClick={() => handleGuardarPaso2(false, 3)} disabled={guardando} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#2563eb', border: 'none', color: 'white', padding: '12px 28px', borderRadius: '8px', fontSize: '0.92rem', fontWeight: 700, cursor: guardando ? 'wait' : 'pointer' }}>{guardando ? 'Guardando...' : 'Continuar →'}</button>
                </div>
              </>
            )}

            {pasoActivo === 3 && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                  <div>
                    <div style={{ color: '#2563eb', fontWeight: 700, fontSize: '0.85rem', marginBottom: '4px' }}>Paso 3 de 6</div>
                    <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1a3a5c', margin: 0 }}>Experiencia</h2>
                    <p style={{ color: '#8fa3b8', fontSize: '0.88rem', margin: '4px 0 0' }}>Cuéntanos sobre tu experiencia como conductor</p>
                  </div>
                  <div style={{ background: '#f4f7fa', border: '1px solid #e8eef5', borderRadius: '10px', padding: '10px 16px', display: 'flex', gap: '8px', alignItems: 'flex-start', minWidth: '200px' }}>
                    <span style={{ color: '#f59e0b', fontSize: '1rem' }}>☆</span>
                    <div>
                      <div style={{ fontWeight: 700, color: '#1a3a5c', fontSize: '0.82rem', marginBottom: '2px' }}>Consejo</div>
                      <div style={{ color: '#8fa3b8', fontSize: '0.75rem', lineHeight: 1.4 }}>Selecciona todas las opciones que apliquen a tu experiencia.</div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px', marginBottom: '24px' }}>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#eef1f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <i className="ti ti-steering-wheel" style={{ fontSize: '1.1rem', color: '#2563eb' }}></i>
                      </div>
                      <span style={{ fontWeight: 700, color: '#1a3a5c', fontSize: '0.85rem' }}>1. Años de experiencia como conductor</span>
                    </div>
                    {['Menos de 1 año', '1 a 3 años', '3 a 5 años', '5 a 10 años', 'Más de 10 años'].map(op => (
                      <div key={op} onClick={() => setAnosExp(op)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', borderRadius: '8px', marginBottom: '6px', background: anosExp === op ? '#eaf1fe' : '#fff', border: anosExp === op ? '1.5px solid #2563eb' : '1px solid #e8eef5', cursor: 'pointer' }}>
                        <input type="radio" checked={anosExp === op} onChange={() => setAnosExp(op)} style={{ accentColor: '#2563eb', pointerEvents: 'none' }} />
                        <span style={{ fontSize: '0.83rem', color: '#1a3a5c' }}>{op}</span>
                        {anosExp === op && <span style={{ marginLeft: 'auto', fontSize: '0.9rem' }}>🎖️</span>}
                      </div>
                    ))}
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#eef1f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <i className="ti ti-truck" style={{ fontSize: '1.1rem', color: '#22c55e' }}></i>
                      </div>
                      <span style={{ fontWeight: 700, color: '#1a3a5c', fontSize: '0.85rem' }}>2. ¿En qué áreas has trabajado?</span>
                    </div>
                    {['Minería', 'Transporte de carga', 'Transporte de pasajeros', 'Construcción', 'Forestal', 'Agrícola', 'Logística / Otros'].map(op => (
                      <div key={op} onClick={() => setAreasExp(prev => prev.includes(op) ? prev.filter(x => x !== op) : [...prev, op])} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', borderRadius: '8px', marginBottom: '6px', background: areasExp.includes(op) ? '#f0fdf4' : '#fff', border: areasExp.includes(op) ? '1.5px solid #22c55e' : '1px solid #e8eef5', cursor: 'pointer' }}>
                        <input type="checkbox" checked={areasExp.includes(op)} onChange={() => {}} style={{ accentColor: '#22c55e', pointerEvents: 'none' }} />
                        <span style={{ fontSize: '0.83rem', color: '#1a3a5c' }}>{op}</span>
                      </div>
                    ))}
                    <div onClick={() => setAreasExp(prev => prev.includes('Otros') ? prev.filter(x => x !== 'Otros') : [...prev, 'Otros'])} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 10px', borderRadius: '8px', border: '1px dashed #e8eef5', cursor: 'pointer', marginBottom: '6px', color: '#22c55e', fontSize: '0.83rem', fontWeight: 600 }}>
                      <span>+</span><span>Otros</span>
                    </div>
                    {areasExp.includes('Otros') && <input value={otraArea} onChange={e => setOtraArea(e.target.value)} placeholder="Especifica el área" style={{ width: '100%', background: '#f4f7fa', border: '1px solid #e8eef5', borderRadius: '6px', padding: '7px 10px', fontSize: '0.8rem', outline: 'none', color: '#1a3a5c', boxSizing: 'border-box' }} />}
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#eef1f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <i className="ti ti-briefcase" style={{ fontSize: '1.1rem', color: '#7c3aed' }}></i>
                      </div>
                      <span style={{ fontWeight: 700, color: '#1a3a5c', fontSize: '0.85rem' }}>3. Tipo de trabajo que has realizado</span>
                    </div>
                    {['Conducción (Camiones)', 'Operación de maquinaria', 'Carga y descarga', 'Mantenimiento básico', 'Apoyo en faena'].map(op => (
                      <div key={op} onClick={() => setTiposTrabajoExp(prev => prev.includes(op) ? prev.filter(x => x !== op) : [...prev, op])} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', borderRadius: '8px', marginBottom: '6px', background: tiposTrabajoExp.includes(op) ? '#f5f3ff' : '#fff', border: tiposTrabajoExp.includes(op) ? '1.5px solid #7c3aed' : '1px solid #e8eef5', cursor: 'pointer' }}>
                        <input type="checkbox" checked={tiposTrabajoExp.includes(op)} onChange={() => {}} style={{ accentColor: '#7c3aed', pointerEvents: 'none' }} />
                        <span style={{ fontSize: '0.83rem', color: '#1a3a5c' }}>{op}</span>
                      </div>
                    ))}
                    <div onClick={() => setTiposTrabajoExp(prev => prev.includes('Otros') ? prev.filter(x => x !== 'Otros') : [...prev, 'Otros'])} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 10px', borderRadius: '8px', border: '1px dashed #e8eef5', cursor: 'pointer', marginBottom: '6px', color: '#7c3aed', fontSize: '0.83rem', fontWeight: 600 }}>
                      <span>+</span><span>Otros</span>
                    </div>
                    {tiposTrabajoExp.includes('Otros') && <input value={otroTrabajo} onChange={e => setOtroTrabajo(e.target.value)} placeholder="Especifica el trabajo" style={{ width: '100%', background: '#f4f7fa', border: '1px solid #e8eef5', borderRadius: '6px', padding: '7px 10px', fontSize: '0.8rem', outline: 'none', color: '#1a3a5c', boxSizing: 'border-box' }} />}
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <i className="ti ti-clock" style={{ fontSize: '1.1rem', color: '#f59e0b' }}></i>
                      </div>
                      <span style={{ fontWeight: 700, color: '#1a3a5c', fontSize: '0.85rem' }}>4. Turnos en los que tienes experiencia</span>
                    </div>
                    {['4x3', '7x7', '10x10', '14x14', '20x10', 'Sistema libre / Otros'].map(op => (
                      <div key={op} onClick={() => setTurnosExp(prev => prev.includes(op) ? prev.filter(x => x !== op) : [...prev, op])} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', borderRadius: '8px', marginBottom: '6px', background: turnosExp.includes(op) ? '#fff7ed' : '#fff', border: turnosExp.includes(op) ? '1.5px solid #f59e0b' : '1px solid #e8eef5', cursor: 'pointer' }}>
                        <input type="checkbox" checked={turnosExp.includes(op)} onChange={() => {}} style={{ accentColor: '#f59e0b', pointerEvents: 'none' }} />
                        <span style={{ fontSize: '0.83rem', color: '#1a3a5c' }}>{op}</span>
                      </div>
                    ))}
                    <div onClick={() => setTurnosExp(prev => prev.includes('Otros') ? prev.filter(x => x !== 'Otros') : [...prev, 'Otros'])} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 10px', borderRadius: '8px', border: '1px dashed #fde68a', cursor: 'pointer', marginBottom: '6px', color: '#f59e0b', fontSize: '0.83rem', fontWeight: 600 }}>
                      <span>+</span><span>Otros</span>
                    </div>
                    {turnosExp.includes('Otros') && <input value={otroTurno} onChange={e => setOtroTurno(e.target.value)} placeholder="Especifica el turno" style={{ width: '100%', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '6px', padding: '7px 10px', fontSize: '0.8rem', outline: 'none', color: '#1a3a5c', boxSizing: 'border-box' }} />}
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#eef1f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <i className="ti ti-calendar" style={{ fontSize: '1.1rem', color: '#2563eb' }}></i>
                      </div>
                      <span style={{ fontWeight: 700, color: '#1a3a5c', fontSize: '0.85rem' }}>5. Disponibilidad para trabajar</span>
                    </div>
                    {['Inmediata', 'En 1 semana', 'En 2 semanas', 'En 1 mes o más', 'Actualmente trabajando'].map(op => (
                      <div key={op} onClick={() => setDisponibilidadExp(prev => prev.includes(op) ? prev.filter(x => x !== op) : [...prev, op])} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', borderRadius: '8px', marginBottom: '6px', background: disponibilidadExp.includes(op) ? '#eaf1fe' : '#fff', border: disponibilidadExp.includes(op) ? '1.5px solid #2563eb' : '1px solid #e8eef5', cursor: 'pointer' }}>
                        <input type="checkbox" checked={disponibilidadExp.includes(op)} onChange={() => {}} style={{ accentColor: '#2563eb', pointerEvents: 'none' }} />
                        <span style={{ fontSize: '0.83rem', color: '#1a3a5c' }}>{op}</span>
                      </div>
                    ))}
                    <div style={{ marginTop: '12px' }}>
                      <div style={{ fontWeight: 700, color: '#1a3a5c', fontSize: '0.85rem', marginBottom: '8px' }}>¿Dispones de movilidad propia?</div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <div onClick={() => setMovilidadPropia('si')} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '8px', background: movilidadPropia === 'si' ? '#eaf1fe' : '#fff', border: movilidadPropia === 'si' ? '1.5px solid #2563eb' : '1px solid #e8eef5', cursor: 'pointer', fontSize: '0.83rem', color: '#1a3a5c', fontWeight: 600 }}>
                          <input type="checkbox" checked={movilidadPropia === 'si'} onChange={() => {}} style={{ accentColor: '#2563eb', pointerEvents: 'none' }} />Sí
                        </div>
                        <div onClick={() => setMovilidadPropia('no')} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '8px', background: movilidadPropia === 'no' ? '#eaf1fe' : '#fff', border: movilidadPropia === 'no' ? '1.5px solid #2563eb' : '1px solid #e8eef5', cursor: 'pointer', fontSize: '0.83rem', color: '#1a3a5c', fontWeight: 600 }}>
                          <input type="checkbox" checked={movilidadPropia === 'no'} onChange={() => {}} style={{ accentColor: '#2563eb', pointerEvents: 'none' }} />No
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {mensaje && <div style={{ fontSize: '0.85rem', color: mensaje.includes('Error') ? '#e74c3c' : '#22c55e', marginBottom: '16px', textAlign: 'right' }}>{mensaje}</div>}

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <button onClick={() => setPasoActivo(2)} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#2563eb', border: 'none', color: 'white', padding: '12px 28px', borderRadius: '8px', fontSize: '0.92rem', fontWeight: 700, cursor: 'pointer' }}>← Volver atrás</button>
                  <button onClick={() => handleGuardarPaso3(false, 4)} disabled={guardando} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#2563eb', border: 'none', color: 'white', padding: '12px 28px', borderRadius: '8px', fontSize: '0.92rem', fontWeight: 700, cursor: guardando ? 'wait' : 'pointer' }}>{guardando ? 'Guardando...' : 'Continuar →'}</button>
                </div>
              </>
            )}

            {pasoActivo === 4 && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                  <div>
                    <div style={{ color: '#2563eb', fontWeight: 700, fontSize: '0.85rem', marginBottom: '4px' }}>Paso 4 de 6</div>
                    <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1a3a5c', margin: 0 }}>Equipos</h2>
                    <p style={{ color: '#8fa3b8', fontSize: '0.88rem', margin: '4px 0 0' }}>Selecciona los equipos que sabes operar y completa tu experiencia.</p>
                  </div>
                  <div style={{ background: '#f4f7fa', border: '1px solid #e8eef5', borderRadius: '10px', padding: '10px 16px', display: 'flex', gap: '8px', alignItems: 'flex-start', minWidth: '200px' }}>
                    <span style={{ color: '#f59e0b', fontSize: '1rem' }}>💡</span>
                    <div>
                      <div style={{ fontWeight: 700, color: '#22c55e', fontSize: '0.82rem', marginBottom: '2px' }}>Consejo</div>
                      <div style={{ color: '#8fa3b8', fontSize: '0.75rem', lineHeight: 1.4 }}>Esta información ayuda a las empresas a encontrar las oportunidades ideales para ti.</div>
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1a3a5c', marginBottom: '14px' }}>1. Selecciona los equipos que sabes operar</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>

                    {/* Camiones */}
                    <div style={{ background: '#fff', border: '1px solid #e8eef5', borderRadius: '10px', padding: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                        <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: '#eaf1fe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <i className="ti ti-truck" style={{ fontSize: '1rem', color: '#2563eb' }}></i>
                        </div>
                        <span style={{ fontWeight: 700, color: '#1a3a5c', fontSize: '0.88rem' }}>1. Camiones</span>
                      </div>
                      {['Camión Tolva','Camión Pluma','Camión Aljibe','Camión Mixer','Camión Articulado','Rampla','Batea','Lowboy','Cama Baja'].map(eq => (
                        <div key={eq} onClick={() => toggleEquipo(eq)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 8px', borderRadius: '6px', marginBottom: '4px', background: equiposSel.includes(eq) ? '#eaf1fe' : '#fafbfc', border: equiposSel.includes(eq) ? '1.5px solid #2563eb' : '1px solid #e8eef5', cursor: 'pointer' }}>
                          <input type="checkbox" checked={equiposSel.includes(eq)} onChange={() => {}} style={{ accentColor: '#2563eb', pointerEvents: 'none' }} />
                          <span style={{ fontSize: '0.82rem', color: '#1a3a5c' }}>{eq}</span>
                        </div>
                      ))}
                      <div onClick={() => toggleEquipo('Otros-Camion')} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 8px', borderRadius: '6px', marginBottom: '6px', background: equiposSel.includes('Otros-Camion') ? '#eaf1fe' : '#fafbfc', border: equiposSel.includes('Otros-Camion') ? '1.5px solid #2563eb' : '1px dashed #e8eef5', cursor: 'pointer' }}>
                        <input type="checkbox" checked={equiposSel.includes('Otros-Camion')} onChange={() => {}} style={{ accentColor: '#2563eb', pointerEvents: 'none' }} />
                        <span style={{ fontSize: '0.82rem', color: '#2563eb', fontWeight: 600 }}>Otros</span>
                      </div>
                      {equiposSel.includes('Otros-Camion') && (
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <input value={otrosCamion} onChange={e => setOtrosCamion(e.target.value)} placeholder="Especifica el equipo" style={{ flex: 1, background: '#f4f7fa', border: '1px solid #e8eef5', borderRadius: '6px', padding: '6px 8px', fontSize: '0.78rem', outline: 'none', color: '#1a3a5c' }} />
                          <button onClick={() => { if (otrosCamion.trim()) { toggleEquipo(otrosCamion.trim()); setOtrosCamion('') } }} style={{ background: '#2563eb', border: 'none', color: 'white', borderRadius: '6px', padding: '6px 10px', fontSize: '0.78rem', cursor: 'pointer', fontWeight: 600 }}>Agregar</button>
                        </div>
                      )}
                    </div>

                    {/* Maquinaria pesada */}
                    <div style={{ background: '#fff', border: '1px solid #e8eef5', borderRadius: '10px', padding: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                        <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <i className="ti ti-bulldozer" style={{ fontSize: '1rem', color: '#22c55e' }}></i>
                        </div>
                        <span style={{ fontWeight: 700, color: '#1a3a5c', fontSize: '0.88rem' }}>2. Maquinaria pesada</span>
                      </div>
                      {['Excavadora','Retroexcavadora','Bulldozer','Motoniveladora','Cargador Frontal','Rodillo Compactador','Mini cargador'].map(eq => (
                        <div key={eq} onClick={() => toggleEquipo(eq)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 8px', borderRadius: '6px', marginBottom: '4px', background: equiposSel.includes(eq) ? '#f0fdf4' : '#fafbfc', border: equiposSel.includes(eq) ? '1.5px solid #22c55e' : '1px solid #e8eef5', cursor: 'pointer' }}>
                          <input type="checkbox" checked={equiposSel.includes(eq)} onChange={() => {}} style={{ accentColor: '#22c55e', pointerEvents: 'none' }} />
                          <span style={{ fontSize: '0.82rem', color: '#1a3a5c' }}>{eq}</span>
                        </div>
                      ))}
                      <div onClick={() => toggleEquipo('Otros-Maquinaria')} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 8px', borderRadius: '6px', marginBottom: '6px', background: equiposSel.includes('Otros-Maquinaria') ? '#f0fdf4' : '#fafbfc', border: equiposSel.includes('Otros-Maquinaria') ? '1.5px solid #22c55e' : '1px dashed #e8eef5', cursor: 'pointer' }}>
                        <input type="checkbox" checked={equiposSel.includes('Otros-Maquinaria')} onChange={() => {}} style={{ accentColor: '#22c55e', pointerEvents: 'none' }} />
                        <span style={{ fontSize: '0.82rem', color: '#22c55e', fontWeight: 600 }}>Otros</span>
                      </div>
                      {equiposSel.includes('Otros-Maquinaria') && (
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <input value={otrosMaquinaria} onChange={e => setOtrosMaquinaria(e.target.value)} placeholder="Especifica el equipo" style={{ flex: 1, background: '#f4f7fa', border: '1px solid #e8eef5', borderRadius: '6px', padding: '6px 8px', fontSize: '0.78rem', outline: 'none', color: '#1a3a5c' }} />
                          <button onClick={() => { if (otrosMaquinaria.trim()) { toggleEquipo(otrosMaquinaria.trim()); setOtrosMaquinaria('') } }} style={{ background: '#22c55e', border: 'none', color: 'white', borderRadius: '6px', padding: '6px 10px', fontSize: '0.78rem', cursor: 'pointer', fontWeight: 600 }}>Agregar</button>
                        </div>
                      )}
                    </div>

                    {/* Izaje / Levante */}
                    <div style={{ background: '#fff', border: '1px solid #e8eef5', borderRadius: '10px', padding: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                        <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <i className="ti ti-crane" style={{ fontSize: '1rem', color: '#f59e0b' }}></i>
                        </div>
                        <span style={{ fontWeight: 700, color: '#1a3a5c', fontSize: '0.88rem' }}>3. Izaje / Levante</span>
                      </div>
                      {['Grúa Horquilla','Grúa Móvil','Grúa Pluma','Manlift','Apilador'].map(eq => (
                        <div key={eq} onClick={() => toggleEquipo(eq)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 8px', borderRadius: '6px', marginBottom: '4px', background: equiposSel.includes(eq) ? '#fff7ed' : '#fafbfc', border: equiposSel.includes(eq) ? '1.5px solid #f59e0b' : '1px solid #e8eef5', cursor: 'pointer' }}>
                          <input type="checkbox" checked={equiposSel.includes(eq)} onChange={() => {}} style={{ accentColor: '#f59e0b', pointerEvents: 'none' }} />
                          <span style={{ fontSize: '0.82rem', color: '#1a3a5c' }}>{eq}</span>
                        </div>
                      ))}
                      <div onClick={() => toggleEquipo('Otros-Izaje')} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 8px', borderRadius: '6px', marginBottom: '6px', background: equiposSel.includes('Otros-Izaje') ? '#fff7ed' : '#fafbfc', border: equiposSel.includes('Otros-Izaje') ? '1.5px solid #f59e0b' : '1px dashed #e8eef5', cursor: 'pointer' }}>
                        <input type="checkbox" checked={equiposSel.includes('Otros-Izaje')} onChange={() => {}} style={{ accentColor: '#f59e0b', pointerEvents: 'none' }} />
                        <span style={{ fontSize: '0.82rem', color: '#f59e0b', fontWeight: 600 }}>Otros</span>
                      </div>
                      {equiposSel.includes('Otros-Izaje') && (
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <input value={otrosIzaje} onChange={e => setOtrosIzaje(e.target.value)} placeholder="Especifica el equipo" style={{ flex: 1, background: '#f4f7fa', border: '1px solid #e8eef5', borderRadius: '6px', padding: '6px 8px', fontSize: '0.78rem', outline: 'none', color: '#1a3a5c' }} />
                          <button onClick={() => { if (otrosIzaje.trim()) { toggleEquipo(otrosIzaje.trim()); setOtrosIzaje('') } }} style={{ background: '#f59e0b', border: 'none', color: 'white', borderRadius: '6px', padding: '6px 10px', fontSize: '0.78rem', cursor: 'pointer', fontWeight: 600 }}>Agregar</button>
                        </div>
                      )}
                    </div>

                    {/* Equipos especiales */}
                    <div style={{ background: '#fff', border: '1px solid #e8eef5', borderRadius: '10px', padding: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                        <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <i className="ti ti-settings" style={{ fontSize: '1rem', color: '#7c3aed' }}></i>
                        </div>
                        <span style={{ fontWeight: 700, color: '#1a3a5c', fontSize: '0.88rem' }}>4. Equipos especiales</span>
                      </div>
                      {['Camión Combustible','Camión Ácido','Camión Explosivos','Ambulancia Industrial','Camión Lubricador'].map(eq => (
                        <div key={eq} onClick={() => toggleEquipo(eq)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 8px', borderRadius: '6px', marginBottom: '4px', background: equiposSel.includes(eq) ? '#f5f3ff' : '#fafbfc', border: equiposSel.includes(eq) ? '1.5px solid #7c3aed' : '1px solid #e8eef5', cursor: 'pointer' }}>
                          <input type="checkbox" checked={equiposSel.includes(eq)} onChange={() => {}} style={{ accentColor: '#7c3aed', pointerEvents: 'none' }} />
                          <span style={{ fontSize: '0.82rem', color: '#1a3a5c' }}>{eq}</span>
                        </div>
                      ))}
                      <div onClick={() => toggleEquipo('Otros-Especiales')} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 8px', borderRadius: '6px', marginBottom: '6px', background: equiposSel.includes('Otros-Especiales') ? '#f5f3ff' : '#fafbfc', border: equiposSel.includes('Otros-Especiales') ? '1.5px solid #7c3aed' : '1px dashed #e8eef5', cursor: 'pointer' }}>
                        <input type="checkbox" checked={equiposSel.includes('Otros-Especiales')} onChange={() => {}} style={{ accentColor: '#7c3aed', pointerEvents: 'none' }} />
                        <span style={{ fontSize: '0.82rem', color: '#7c3aed', fontWeight: 600 }}>Otros</span>
                      </div>
                      {equiposSel.includes('Otros-Especiales') && (
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <input value={otrosEspeciales} onChange={e => setOtrosEspeciales(e.target.value)} placeholder="Especifica el equipo" style={{ flex: 1, background: '#f4f7fa', border: '1px solid #e8eef5', borderRadius: '6px', padding: '6px 8px', fontSize: '0.78rem', outline: 'none', color: '#1a3a5c' }} />
                          <button onClick={() => { if (otrosEspeciales.trim()) { toggleEquipo(otrosEspeciales.trim()); setOtrosEspeciales('') } }} style={{ background: '#7c3aed', border: 'none', color: 'white', borderRadius: '6px', padding: '6px 10px', fontSize: '0.78rem', cursor: 'pointer', fontWeight: 600 }}>Agregar</button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Sección 2: Tabla de detalles */}
                {equiposSel.filter(e => !['Otros-Camion','Otros-Maquinaria','Otros-Izaje','Otros-Especiales'].includes(e)).length > 0 && (
                  <div style={{ marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1a3a5c', marginBottom: '14px' }}>
                      2. Completa la experiencia de tus equipos seleccionados
                    </h3>
                    <div style={{ background: '#fff', border: '1px solid #e8eef5', borderRadius: '10px', overflow: 'hidden' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr 1fr 160px 140px 40px', gap: '0', background: '#f4f7fa', padding: '10px 16px', fontSize: '0.78rem', fontWeight: 700, color: '#8fa3b8' }}>
                        <div>Equipo</div>
                        <div>Años de experiencia</div>
                        <div>Nivel de dominio</div>
                        <div>Marca (opcional)</div>
                        <div>Modelo (opcional)</div>
                        <div></div>
                      </div>
                      {equiposSel.filter(e => !['Otros-Camion','Otros-Maquinaria','Otros-Izaje','Otros-Especiales'].includes(e)).map(eq => (
                        <div key={eq} style={{ display: 'grid', gridTemplateColumns: '180px 1fr 1fr 160px 140px 40px', gap: '0', padding: '10px 16px', borderTop: '1px solid #e8eef5', alignItems: 'center' }}>
                          <div style={{ fontSize: '0.83rem', fontWeight: 600, color: '#1a3a5c' }}>{eq}</div>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            {['<1','1-3','3-5','+5'].map(a => (
                              <button key={a} onClick={() => updateDetalle(eq, 'anos', a)} style={{ padding: '4px 8px', borderRadius: '6px', border: 'none', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', background: equiposDetalle[eq]?.anos === a ? '#2563eb' : '#f4f7fa', color: equiposDetalle[eq]?.anos === a ? 'white' : '#8fa3b8' }}>{a}</button>
                            ))}
                          </div>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            {['Básico','Intermedio','Avanzado','Experto'].map(d => (
                              <button key={d} onClick={() => updateDetalle(eq, 'dominio', d)} style={{ padding: '4px 6px', borderRadius: '6px', border: 'none', fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer', background: equiposDetalle[eq]?.dominio === d ? '#2563eb' : '#f4f7fa', color: equiposDetalle[eq]?.dominio === d ? 'white' : '#8fa3b8' }}>{d}</button>
                            ))}
                          </div>
                          <div>
                            <input value={equiposDetalle[eq]?.marca || ''} onChange={e => updateDetalle(eq, 'marca', e.target.value)} placeholder="Ej: Volvo" style={{ width: '100%', background: '#f4f7fa', border: '1px solid #e8eef5', borderRadius: '6px', padding: '5px 8px', fontSize: '0.78rem', outline: 'none', color: '#1a3a5c', boxSizing: 'border-box' }} />
                          </div>
                          <div>
                            <input value={equiposDetalle[eq]?.modelo || ''} onChange={e => updateDetalle(eq, 'modelo', e.target.value)} placeholder="Ej: FMX 440" style={{ width: '100%', background: '#f4f7fa', border: '1px solid #e8eef5', borderRadius: '6px', padding: '5px 8px', fontSize: '0.78rem', outline: 'none', color: '#1a3a5c', boxSizing: 'border-box' }} />
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <button onClick={() => toggleEquipo(eq)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#e74c3c', fontSize: '1rem' }}>🗑️</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {mensaje && <div style={{ fontSize: '0.85rem', color: mensaje.includes('Error') ? '#e74c3c' : '#22c55e', marginBottom: '16px', textAlign: 'right' }}>{mensaje}</div>}

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <button onClick={() => setPasoActivo(3)} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#2563eb', border: 'none', color: 'white', padding: '12px 28px', borderRadius: '8px', fontSize: '0.92rem', fontWeight: 700, cursor: 'pointer' }}>← Volver atrás</button>
                  <button onClick={() => handleGuardarPaso4(false, 5)} disabled={guardando} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#2563eb', border: 'none', color: 'white', padding: '12px 28px', borderRadius: '8px', fontSize: '0.92rem', fontWeight: 700, cursor: guardando ? 'wait' : 'pointer' }}>{guardando ? 'Guardando...' : 'Continuar →'}</button>
                </div>
              </>
            )}

            {pasoActivo === 5 && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                  <div>
                    <div style={{ color: '#2563eb', fontWeight: 700, fontSize: '0.85rem', marginBottom: '4px' }}>Paso 5 de 6</div>
                    <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1a3a5c', margin: 0 }}>Documentación</h2>
                    <p style={{ color: '#8fa3b8', fontSize: '0.88rem', margin: '4px 0 0' }}>Sube los documentos que respaldan tu información.</p>
                  </div>
                  <div style={{ background: '#f4f7fa', border: '1px solid #e8eef5', borderRadius: '10px', padding: '10px 16px', display: 'flex', gap: '8px', alignItems: 'flex-start', minWidth: '200px' }}>
                    <span style={{ color: '#f59e0b', fontSize: '1rem' }}>💡</span>
                    <div>
                      <div style={{ fontWeight: 700, color: '#22c55e', fontSize: '0.82rem', marginBottom: '2px' }}>Consejo</div>
                      <div style={{ color: '#8fa3b8', fontSize: '0.75rem', lineHeight: 1.4 }}>Entre más documentos cargues, más verificado y confiable será tu perfil.</div>
                    </div>
                  </div>
                </div>

                {/* Documentos obligatorios */}
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span style={{ fontSize: '1rem' }}>🔒</span>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1a3a5c', margin: 0 }}>Documentos obligatorios</h3>
                  </div>
                  <p style={{ color: '#8fa3b8', fontSize: '0.82rem', marginBottom: '14px' }}>Estos documentos son obligatorios para completar tu perfil.</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>

                    {/* Hoja de vida */}
                    <div style={{ background: '#fff', border: '1px solid #e8eef5', borderRadius: '10px', padding: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <i className="ti ti-file-text" style={{ fontSize: '1.2rem', color: '#2563eb' }}></i>
                          <span style={{ fontWeight: 700, color: '#1a3a5c', fontSize: '0.88rem' }}>Hoja de vida del conductor</span>
                        </div>
                        <span style={{ background: '#fee2e2', color: '#991b1b', fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px' }}>Obligatorio</span>
                      </div>
                      <p style={{ color: '#8fa3b8', fontSize: '0.78rem', marginBottom: '10px' }}>Tu currículum actualizado.</p>
                      {(docHojaVida || docHojaVidaUrl) ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px', padding: '6px 10px', marginBottom: '8px' }}>
                          <span style={{ color: '#22c55e' }}>✅</span>
                          <span style={{ fontSize: '0.78rem', color: '#1a3a5c', flex: 1 }}>{docHojaVida ? docHojaVida.name : 'Archivo cargado'}</span>
                          <button onClick={() => { setDocHojaVida(null); setDocHojaVidaUrl('') }} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#e74c3c' }}>🗑️</button>
                        </div>
                      ) : (
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', border: '1.5px dashed #e8eef5', borderRadius: '8px', padding: '10px', cursor: 'pointer', marginBottom: '8px', background: '#fafbfc' }}>
                          <i className="ti ti-cloud-upload" style={{ fontSize: '1.2rem', color: '#8fa3b8' }}></i>
                          <span style={{ color: '#2563eb', fontSize: '0.78rem', fontWeight: 600 }}>Subir archivo</span>
                          <span style={{ color: '#8fa3b8', fontSize: '0.72rem' }}>PDF, JPG o PNG</span>
                          <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e => setDocHojaVida(e.target.files?.[0] || null)} style={{ display: 'none' }} />
                        </label>
                      )}
                      <div style={{ marginBottom: '8px' }}>
                        <label style={{ fontSize: '0.75rem', color: '#8fa3b8', display: 'block', marginBottom: '4px' }}>Fecha de emisión</label>
                        <input type="date" value={fechaHojaVida} onChange={e => setFechaHojaVida(e.target.value)} style={{ width: '100%', background: '#f4f7fa', border: '1px solid #e8eef5', borderRadius: '6px', padding: '6px 10px', fontSize: '0.78rem', outline: 'none', color: '#1a3a5c', boxSizing: 'border-box' }} />
                      </div>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#8fa3b8', cursor: 'pointer' }}>
                        <input type="checkbox" checked={noTengoHojaVida} onChange={e => setNoTengoHojaVida(e.target.checked)} style={{ accentColor: '#2563eb' }} />
                        No lo tengo ahora
                      </label>
                    </div>

                    {/* Certificado de antecedentes */}
                    <div style={{ background: '#fff', border: '1px solid #e8eef5', borderRadius: '10px', padding: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <i className="ti ti-file-check" style={{ fontSize: '1.2rem', color: '#2563eb' }}></i>
                          <span style={{ fontWeight: 700, color: '#1a3a5c', fontSize: '0.88rem' }}>Certificado de antecedentes</span>
                        </div>
                        <span style={{ background: '#fee2e2', color: '#991b1b', fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px' }}>Obligatorio</span>
                      </div>
                      <p style={{ color: '#8fa3b8', fontSize: '0.78rem', marginBottom: '10px' }}>Debe estar vigente.</p>
                      {(docAntecedentes || docAntecedentesUrl) ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px', padding: '6px 10px', marginBottom: '8px' }}>
                          <span style={{ color: '#22c55e' }}>✅</span>
                          <span style={{ fontSize: '0.78rem', color: '#1a3a5c', flex: 1 }}>{docAntecedentes ? docAntecedentes.name : 'Archivo cargado'}</span>
                          <button onClick={() => { setDocAntecedentes(null); setDocAntecedentesUrl('') }} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#e74c3c' }}>🗑️</button>
                        </div>
                      ) : (
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', border: '1.5px dashed #e8eef5', borderRadius: '8px', padding: '10px', cursor: 'pointer', marginBottom: '8px', background: '#fafbfc' }}>
                          <i className="ti ti-cloud-upload" style={{ fontSize: '1.2rem', color: '#8fa3b8' }}></i>
                          <span style={{ color: '#2563eb', fontSize: '0.78rem', fontWeight: 600 }}>Subir archivo</span>
                          <span style={{ color: '#8fa3b8', fontSize: '0.72rem' }}>PDF, JPG o PNG</span>
                          <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e => setDocAntecedentes(e.target.files?.[0] || null)} style={{ display: 'none' }} />
                        </label>
                      )}
                      <div style={{ marginBottom: '8px' }}>
                        <label style={{ fontSize: '0.75rem', color: '#8fa3b8', display: 'block', marginBottom: '4px' }}>Fecha de emisión</label>
                        <input type="date" value={fechaAntecedentes} onChange={e => setFechaAntecedentes(e.target.value)} style={{ width: '100%', background: '#f4f7fa', border: '1px solid #e8eef5', borderRadius: '6px', padding: '6px 10px', fontSize: '0.78rem', outline: 'none', color: '#1a3a5c', boxSizing: 'border-box' }} />
                      </div>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#8fa3b8', cursor: 'pointer' }}>
                        <input type="checkbox" checked={noTengoAntecedentes} onChange={e => setNoTengoAntecedentes(e.target.checked)} style={{ accentColor: '#2563eb' }} />
                        No lo tengo ahora
                      </label>
                    </div>

                    {/* Cédula de identidad */}
                    <div style={{ background: '#fff', border: '1px solid #e8eef5', borderRadius: '10px', padding: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <i className="ti ti-id-badge-2" style={{ fontSize: '1.2rem', color: '#2563eb' }}></i>
                          <span style={{ fontWeight: 700, color: '#1a3a5c', fontSize: '0.88rem' }}>Cédula de identidad</span>
                        </div>
                        <span style={{ background: '#fee2e2', color: '#991b1b', fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px' }}>Obligatorio</span>
                      </div>
                      <p style={{ color: '#8fa3b8', fontSize: '0.78rem', marginBottom: '10px' }}>Sube ambos lados de tu cédula.</p>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                        <div>
                          <div style={{ fontSize: '0.75rem', color: '#8fa3b8', marginBottom: '4px', fontWeight: 600 }}>Frontal</div>
                          {(docCedulaFrontal || docCedulaFrontalUrl) ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px', padding: '5px 8px' }}>
                              <span style={{ color: '#22c55e', fontSize: '0.8rem' }}>✅</span>
                              <span style={{ fontSize: '0.72rem', color: '#1a3a5c', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{docCedulaFrontal ? docCedulaFrontal.name : 'Cargado'}</span>
                              <button onClick={() => { setDocCedulaFrontal(null); setDocCedulaFrontalUrl('') }} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#e74c3c', fontSize: '0.8rem' }}>🗑️</button>
                            </div>
                          ) : (
                            <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', border: '1.5px dashed #e8eef5', borderRadius: '6px', padding: '8px', cursor: 'pointer', background: '#fafbfc', textAlign: 'center' }}>
                              <i className="ti ti-cloud-upload" style={{ fontSize: '1rem', color: '#8fa3b8' }}></i>
                              <span style={{ color: '#2563eb', fontSize: '0.7rem', fontWeight: 600 }}>Subir</span>
                              <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e => setDocCedulaFrontal(e.target.files?.[0] || null)} style={{ display: 'none' }} />
                            </label>
                          )}
                        </div>
                        <div>
                          <div style={{ fontSize: '0.75rem', color: '#8fa3b8', marginBottom: '4px', fontWeight: 600 }}>Reverso</div>
                          {(docCedulaReverso || docCedulaReversoUrl) ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px', padding: '5px 8px' }}>
                              <span style={{ color: '#22c55e', fontSize: '0.8rem' }}>✅</span>
                              <span style={{ fontSize: '0.72rem', color: '#1a3a5c', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{docCedulaReverso ? docCedulaReverso.name : 'Cargado'}</span>
                              <button onClick={() => { setDocCedulaReverso(null); setDocCedulaReversoUrl('') }} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#e74c3c', fontSize: '0.8rem' }}>🗑️</button>
                            </div>
                          ) : (
                            <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', border: '1.5px dashed #e8eef5', borderRadius: '6px', padding: '8px', cursor: 'pointer', background: '#fafbfc', textAlign: 'center' }}>
                              <i className="ti ti-cloud-upload" style={{ fontSize: '1rem', color: '#8fa3b8' }}></i>
                              <span style={{ color: '#2563eb', fontSize: '0.7rem', fontWeight: 600 }}>Subir</span>
                              <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e => setDocCedulaReverso(e.target.files?.[0] || null)} style={{ display: 'none' }} />
                            </label>
                          )}
                        </div>
                      </div>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#8fa3b8', cursor: 'pointer' }}>
                        <input type="checkbox" checked={noTengoCedula} onChange={e => setNoTengoCedula(e.target.checked)} style={{ accentColor: '#2563eb' }} />
                        No la tengo ahora
                      </label>
                    </div>
                  </div>
                </div>

                {/* Documentos recomendados */}
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span style={{ fontSize: '1rem' }}>⭐</span>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1a3a5c', margin: 0 }}>Documentos recomendados</h3>
                  </div>
                  <p style={{ color: '#8fa3b8', fontSize: '0.82rem', marginBottom: '14px' }}>Estos documentos no son obligatorios, pero te ayudan a destacar.</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '12px' }}>

                    {/* Certificados de cursos */}
                    <div style={{ background: '#fff', border: '1px solid #e8eef5', borderRadius: '10px', padding: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                        <i className="ti ti-school" style={{ fontSize: '1rem', color: '#2563eb' }}></i>
                        <span style={{ fontWeight: 700, color: '#1a3a5c', fontSize: '0.78rem' }}>Certificados de cursos</span>
                      </div>
                      <p style={{ color: '#8fa3b8', fontSize: '0.7rem', marginBottom: '8px' }}>Cursos realizados.</p>
                      <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', border: '1.5px dashed #e8eef5', borderRadius: '6px', padding: '8px', cursor: 'pointer', background: '#fafbfc', marginBottom: '6px' }}>
                        <i className="ti ti-cloud-upload" style={{ fontSize: '1rem', color: '#8fa3b8' }}></i>
                        <span style={{ color: '#2563eb', fontSize: '0.7rem', fontWeight: 600, textAlign: 'center' }}>Subir archivos</span>
                        <span style={{ color: '#8fa3b8', fontSize: '0.65rem', textAlign: 'center' }}>PDF, JPG o PNG</span>
                        <input type="file" accept=".pdf,.jpg,.jpeg,.png" multiple onChange={e => setDocsCursos(Array.from(e.target.files || []))} style={{ display: 'none' }} />
                      </label>
                      {(docsCursos.length > 0 || docsCursosUrls.length > 0) && <div style={{ color: '#22c55e', fontSize: '0.7rem', fontWeight: 600 }}>✅ {docsCursos.length || docsCursosUrls.length} archivo(s) cargado(s)</div>}
                      <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', color: '#8fa3b8', cursor: 'pointer', marginTop: '6px' }}>
                        <input type="checkbox" style={{ accentColor: '#2563eb' }} />No tengo ahora
                      </label>
                    </div>

                    {/* Examen preocupacional */}
                    <div style={{ background: '#fff', border: '1px solid #e8eef5', borderRadius: '10px', padding: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                        <i className="ti ti-heart-rate-monitor" style={{ fontSize: '1rem', color: '#2563eb' }}></i>
                        <span style={{ fontWeight: 700, color: '#1a3a5c', fontSize: '0.78rem' }}>Examen preocupacional</span>
                      </div>
                      <p style={{ color: '#8fa3b8', fontSize: '0.7rem', marginBottom: '8px' }}>Vigencia del examen.</p>
                      {['Vigente','Vencido','No tengo'].map(op => (
                        <label key={op} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', color: estadoPreocupacional === op ? '#2563eb' : '#1a3a5c', cursor: 'pointer', marginBottom: '4px', fontWeight: estadoPreocupacional === op ? 700 : 400 }}>
                          <input type="radio" checked={estadoPreocupacional === op} onChange={() => setEstadoPreocupacional(op)} style={{ accentColor: '#2563eb' }} />{op}
                        </label>
                      ))}
                      {estadoPreocupacional === 'Vigente' && (
                        <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', border: '1.5px dashed #e8eef5', borderRadius: '6px', padding: '6px', cursor: 'pointer', background: '#fafbfc', marginTop: '6px' }}>
                          <i className="ti ti-cloud-upload" style={{ fontSize: '1rem', color: '#8fa3b8' }}></i>
                          <span style={{ color: '#2563eb', fontSize: '0.7rem', fontWeight: 600 }}>{docPreocupacional ? docPreocupacional.name : 'Subir archivo'}</span>
                          <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e => setDocPreocupacional(e.target.files?.[0] || null)} style={{ display: 'none' }} />
                        </label>
                      )}
                      <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', color: '#8fa3b8', cursor: 'pointer', marginTop: '6px' }}>
                        <input type="checkbox" checked={noTengoPreocupacional} onChange={e => setNoTengoPreocupacional(e.target.checked)} style={{ accentColor: '#2563eb' }} />No tengo ahora
                      </label>
                    </div>

                    {/* Certificados de experiencia */}
                    <div style={{ background: '#fff', border: '1px solid #e8eef5', borderRadius: '10px', padding: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                        <i className="ti ti-briefcase" style={{ fontSize: '1rem', color: '#2563eb' }}></i>
                        <span style={{ fontWeight: 700, color: '#1a3a5c', fontSize: '0.78rem' }}>Certificados de experiencia</span>
                      </div>
                      <p style={{ color: '#8fa3b8', fontSize: '0.7rem', marginBottom: '8px' }}>Cartas o certificados laborales.</p>
                      <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', border: '1.5px dashed #e8eef5', borderRadius: '6px', padding: '8px', cursor: 'pointer', background: '#fafbfc', marginBottom: '6px' }}>
                        <i className="ti ti-cloud-upload" style={{ fontSize: '1rem', color: '#8fa3b8' }}></i>
                        <span style={{ color: '#2563eb', fontSize: '0.7rem', fontWeight: 600, textAlign: 'center' }}>Subir archivos</span>
                        <span style={{ color: '#8fa3b8', fontSize: '0.65rem', textAlign: 'center' }}>PDF, JPG o PNG</span>
                        <input type="file" accept=".pdf,.jpg,.jpeg,.png" multiple onChange={e => setDocsExperiencia(Array.from(e.target.files || []))} style={{ display: 'none' }} />
                      </label>
                      {(docsExperiencia.length > 0 || docsExperienciaUrls.length > 0) && <div style={{ color: '#22c55e', fontSize: '0.7rem', fontWeight: 600 }}>✅ {docsExperiencia.length || docsExperienciaUrls.length} archivo(s) cargado(s)</div>}
                      <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', color: '#8fa3b8', cursor: 'pointer', marginTop: '6px' }}>
                        <input type="checkbox" checked={noTengoExpDoc} onChange={e => setNoTengoExpDoc(e.target.checked)} style={{ accentColor: '#2563eb' }} />No tengo ahora
                      </label>
                    </div>

                    {/* Finiquitos */}
                    <div style={{ background: '#fff', border: '1px solid #e8eef5', borderRadius: '10px', padding: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                        <i className="ti ti-file-invoice" style={{ fontSize: '1rem', color: '#2563eb' }}></i>
                        <span style={{ fontWeight: 700, color: '#1a3a5c', fontSize: '0.78rem' }}>Finiquitos</span>
                      </div>
                      <p style={{ color: '#8fa3b8', fontSize: '0.7rem', marginBottom: '8px' }}>Documentos de término de contrato.</p>
                      <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', border: '1.5px dashed #e8eef5', borderRadius: '6px', padding: '8px', cursor: 'pointer', background: '#fafbfc', marginBottom: '6px' }}>
                        <i className="ti ti-cloud-upload" style={{ fontSize: '1rem', color: '#8fa3b8' }}></i>
                        <span style={{ color: '#2563eb', fontSize: '0.7rem', fontWeight: 600, textAlign: 'center' }}>Subir archivos</span>
                        <span style={{ color: '#8fa3b8', fontSize: '0.65rem', textAlign: 'center' }}>PDF, JPG o PNG</span>
                        <input type="file" accept=".pdf,.jpg,.jpeg,.png" multiple onChange={e => setDocsFiniquitos(Array.from(e.target.files || []))} style={{ display: 'none' }} />
                      </label>
                      {(docsFiniquitos.length > 0 || docsFiniquitosUrls.length > 0) && <div style={{ color: '#22c55e', fontSize: '0.7rem', fontWeight: 600 }}>✅ {docsFiniquitos.length || docsFiniquitosUrls.length} archivo(s) cargado(s)</div>}
                      <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', color: '#8fa3b8', cursor: 'pointer', marginTop: '6px' }}>
                        <input type="checkbox" checked={noTengoFiniquitos} onChange={e => setNoTengoFiniquitos(e.target.checked)} style={{ accentColor: '#2563eb' }} />No tengo ahora
                      </label>
                    </div>

                    {/* Certificado de residencia */}
                    <div style={{ background: '#fff', border: '1px solid #e8eef5', borderRadius: '10px', padding: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                        <i className="ti ti-home" style={{ fontSize: '1rem', color: '#2563eb' }}></i>
                        <span style={{ fontWeight: 700, color: '#1a3a5c', fontSize: '0.78rem' }}>Certificado de residencia</span>
                      </div>
                      <p style={{ color: '#8fa3b8', fontSize: '0.7rem', marginBottom: '8px' }}>Certificado de residencia actual.</p>
                      <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', border: '1.5px dashed #e8eef5', borderRadius: '6px', padding: '8px', cursor: 'pointer', background: '#fafbfc', marginBottom: '6px' }}>
                        <i className="ti ti-cloud-upload" style={{ fontSize: '1rem', color: '#8fa3b8' }}></i>
                        <span style={{ color: '#2563eb', fontSize: '0.7rem', fontWeight: 600, textAlign: 'center' }}>Subir archivos</span>
                        <span style={{ color: '#8fa3b8', fontSize: '0.65rem', textAlign: 'center' }}>PDF, JPG o PNG</span>
                        <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e => setDocResidencia(e.target.files?.[0] || null)} style={{ display: 'none' }} />
                      </label>
                      {(docResidencia || docResidenciaUrl) && <div style={{ color: '#22c55e', fontSize: '0.7rem', fontWeight: 600 }}>✅ {docResidencia ? docResidencia.name : 'Archivo cargado'}</div>}
                      <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', color: '#8fa3b8', cursor: 'pointer', marginTop: '6px' }}>
                        <input type="checkbox" checked={noTengoResidencia} onChange={e => setNoTengoResidencia(e.target.checked)} style={{ accentColor: '#2563eb' }} />No tengo ahora
                      </label>
                    </div>

                    {/* Otros documentos */}
                    <div style={{ background: '#fff', border: '1px solid #e8eef5', borderRadius: '10px', padding: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                        <i className="ti ti-dots" style={{ fontSize: '1rem', color: '#2563eb' }}></i>
                        <span style={{ fontWeight: 700, color: '#1a3a5c', fontSize: '0.78rem' }}>Otros documentos</span>
                      </div>
                      <p style={{ color: '#8fa3b8', fontSize: '0.7rem', marginBottom: '8px' }}>Cualquier otro documento relevante.</p>
                      <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', border: '1.5px dashed #e8eef5', borderRadius: '6px', padding: '8px', cursor: 'pointer', background: '#fafbfc', marginBottom: '6px' }}>
                        <i className="ti ti-cloud-upload" style={{ fontSize: '1rem', color: '#8fa3b8' }}></i>
                        <span style={{ color: '#2563eb', fontSize: '0.7rem', fontWeight: 600, textAlign: 'center' }}>Subir archivos</span>
                        <span style={{ color: '#8fa3b8', fontSize: '0.65rem', textAlign: 'center' }}>PDF, JPG o PNG</span>
                        <input type="file" accept=".pdf,.jpg,.jpeg,.png" multiple onChange={e => setDocsOtros(Array.from(e.target.files || []))} style={{ display: 'none' }} />
                      </label>
                      {(docsOtros.length > 0 || docsOtrosUrls.length > 0) && <div style={{ color: '#22c55e', fontSize: '0.7rem', fontWeight: 600 }}>✅ {docsOtros.length || docsOtrosUrls.length} archivo(s) cargado(s)</div>}
                      <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', color: '#8fa3b8', cursor: 'pointer', marginTop: '6px' }}>
                        <input type="checkbox" checked={noTengoOtros} onChange={e => setNoTengoOtros(e.target.checked)} style={{ accentColor: '#2563eb' }} />No tengo ahora
                      </label>
                    </div>
                  </div>
                </div>

                <div style={{ background: '#eaf1fe', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '10px 14px', fontSize: '0.78rem', color: '#2563eb', marginBottom: '20px' }}>
                  ℹ️ Puedes cargar documentos más adelante desde tu perfil. Los documentos pendientes no te impedirán completar tu perfil.
                </div>

                {mensaje && <div style={{ fontSize: '0.85rem', color: mensaje.includes('Error') ? '#e74c3c' : '#22c55e', marginBottom: '16px', textAlign: 'right' }}>{mensaje}</div>}

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <button onClick={() => setPasoActivo(4)} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#2563eb', border: 'none', color: 'white', padding: '12px 28px', borderRadius: '8px', fontSize: '0.92rem', fontWeight: 700, cursor: 'pointer' }}>← Volver atrás</button>
                  <button onClick={() => handleGuardarPaso5(false, 6)} disabled={guardando} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#2563eb', border: 'none', color: 'white', padding: '12px 28px', borderRadius: '8px', fontSize: '0.92rem', fontWeight: 700, cursor: guardando ? 'wait' : 'pointer' }}>{guardando ? 'Guardando...' : 'Continuar →'}</button>
                </div>
              </>
            )}

            {pasoActivo === 6 && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                  <div>
                    <div style={{ color: '#2563eb', fontWeight: 700, fontSize: '0.85rem', marginBottom: '4px' }}>Paso 6 de 6</div>
                    <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1a3a5c', margin: 0 }}>Foto y CV</h2>
                    <p style={{ color: '#8fa3b8', fontSize: '0.88rem', margin: '4px 0 0' }}>Agrega tu foto de perfil y genera tu CV profesional.</p>
                  </div>
                  <div style={{ background: '#f4f7fa', border: '1px solid #e8eef5', borderRadius: '10px', padding: '10px 16px', display: 'flex', gap: '8px', alignItems: 'flex-start', minWidth: '200px' }}>
                    <span style={{ color: '#f59e0b', fontSize: '1rem' }}>💡</span>
                    <div>
                      <div style={{ fontWeight: 700, color: '#22c55e', fontSize: '0.82rem', marginBottom: '2px' }}>Consejo</div>
                      <div style={{ color: '#8fa3b8', fontSize: '0.75rem', lineHeight: 1.4 }}>Una foto profesional y un CV completo aumentan tus oportunidades laborales.</div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '24px', marginBottom: '24px' }}>

                  {/* Sección 1: Foto */}
                  <div>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1a3a5c', marginBottom: '6px' }}>1. Agrega tu foto de perfil</h3>
                    <p style={{ color: '#8fa3b8', fontSize: '0.82rem', marginBottom: '14px' }}>Tu foto será visible para las empresas.</p>
                    <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '2px dashed #e8eef5', borderRadius: '12px', padding: '32px 16px', cursor: 'pointer', background: '#fafbfc', marginBottom: '16px', minHeight: '200px' }}>
                      {fotoPreview ? (
                        <img src={fotoPreview} alt="Foto de perfil" style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', marginBottom: '10px' }} />
                      ) : (
                        <>
                          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#eef1f5', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                            <i className="ti ti-user" style={{ fontSize: '2.5rem', color: '#8fa3b8' }}></i>
                          </div>
                          <span style={{ fontWeight: 700, color: '#1a3a5c', fontSize: '0.88rem', marginBottom: '4px' }}>Haz clic para subir tu foto</span>
                          <span style={{ color: '#8fa3b8', fontSize: '0.78rem' }}>o arrastra y suelta aquí</span>
                        </>
                      )}
                      <span style={{ color: '#8fa3b8', fontSize: '0.72rem', marginTop: '8px' }}>Formatos recomendados: JPG, PNG</span>
                      <span style={{ color: '#8fa3b8', fontSize: '0.72rem' }}>Tamaño máximo: 5MB</span>
                      <input type="file" accept=".jpg,.jpeg,.png" onChange={e => handleFotoChange(e.target.files?.[0] || null)} style={{ display: 'none' }} />
                    </label>
                    {fotoPreview && (
                      <button onClick={() => { setFotoPerfil(null); setFotoPreview(''); setFotoPerfilUrl('') }} style={{ background: 'transparent', border: '1px solid #e8eef5', color: '#e74c3c', borderRadius: '6px', padding: '6px 14px', fontSize: '0.78rem', cursor: 'pointer', marginBottom: '12px' }}>🗑️ Eliminar foto</button>
                    )}
                    <div style={{ background: '#f4f7fa', border: '1px solid #e8eef5', borderRadius: '10px', padding: '14px' }}>
                      <div style={{ fontWeight: 700, color: '#1a3a5c', fontSize: '0.82rem', marginBottom: '8px' }}>Recomendaciones para tu foto</div>
                      {['Usa ropa adecuada para el trabajo', 'Fondo claro y buena iluminación', 'Foto de tu rostro, sin lentes oscuros ni gorro'].map(r => (
                        <div key={r} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                          <span style={{ color: '#22c55e', fontSize: '0.85rem' }}>✅</span>
                          <span style={{ fontSize: '0.78rem', color: '#8fa3b8' }}>{r}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{ marginTop: '10px' }}>
                      <span style={{ color: '#2563eb', fontSize: '0.78rem', cursor: 'pointer', fontWeight: 600 }}>👁 Vista previa de cómo te verán las empresas</span>
                    </div>
                  </div>

                  {/* Sección 2: Vista previa CV */}
                  <div>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1a3a5c', marginBottom: '6px' }}>2. Vista previa de tu CV</h3>
                    <p style={{ color: '#8fa3b8', fontSize: '0.82rem', marginBottom: '14px' }}>Así verán las empresas tu perfil profesional.</p>
                    <div ref={cvRef} style={{ border: '1px solid #e8eef5', borderRadius: '12px', overflow: 'hidden' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr' }}>
                        {/* Columna izquierda oscura */}
                        <div style={{ background: '#0d1f3c', padding: '20px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', fontWeight: 800, color: 'white', overflow: 'hidden' }}>
                            {fotoPreview ? <img src={fotoPreview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (nombreCompleto.split(' ').map((n:string) => n[0]).join('').slice(0,2).toUpperCase() || 'FS')}
                          </div>
                          <div style={{ color: 'white', fontWeight: 700, fontSize: '0.88rem', textAlign: 'center' }}>{nombreCompleto || 'Franco Sturione'}</div>
                          <div style={{ color: '#8fa3b8', fontSize: '0.72rem', textAlign: 'center' }}>Conductor Profesional</div>
                          <div style={{ display: 'flex', gap: '2px' }}>{'★★★★★'.split('').map((s,i) => <span key={i} style={{ color: '#f59e0b', fontSize: '0.7rem' }}>{s}</span>)}</div>
                          <div style={{ color: '#8fa3b8', fontSize: '0.65rem' }}>4.8 (128 reseñas)</div>
                          <div style={{ width: '100%', borderTop: '1px solid #1e3a5f', margin: '6px 0' }}></div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ color: '#8fa3b8', fontSize: '0.65rem' }}>📞</span><span style={{ color: '#8fa3b8', fontSize: '0.65rem' }}>{telefono || '+56 9 1234 5678'}</span></div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ color: '#8fa3b8', fontSize: '0.65rem' }}>✉️</span><span style={{ color: '#8fa3b8', fontSize: '0.65rem', wordBreak: 'break-all' }}>{emailContacto || 'franco@email.com'}</span></div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ color: '#8fa3b8', fontSize: '0.65rem' }}>📍</span><span style={{ color: '#8fa3b8', fontSize: '0.65rem' }}>{comunaSel || 'Chillán'}, {regionSel || 'Ñuble'}</span></div>
                          <div style={{ background: '#1e3a5f', borderRadius: '6px', padding: '4px 10px', marginTop: '6px' }}>
                            <span style={{ color: '#8fa3b8', fontSize: '0.65rem' }}>Miembro desde 2024</span>
                          </div>
                        </div>
                        {/* Columna derecha */}
                        <div style={{ padding: '16px', background: '#fff' }}>
                          <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#8fa3b8', letterSpacing: '0.08em', marginBottom: '4px' }}>PERFIL PROFESIONAL</div>
                          <p style={{ fontSize: '0.75rem', color: '#1a3a5c', marginBottom: '12px', lineHeight: 1.4 }}>Conductor profesional con {anosExp || 'más de 8 años'} de experiencia en {areasExp.slice(0,2).join(' y ') || 'transporte de carga y pasajeros'}. Responsable, comprometido y enfocado en la seguridad.</p>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '12px' }}>
                            <div>
                              <div style={{ fontSize: '0.6rem', fontWeight: 700, color: '#8fa3b8', letterSpacing: '0.08em', marginBottom: '4px' }}>LICENCIAS</div>
                              {(licenciasSel.length > 0 ? licenciasSel.slice(0,3) : ['A2 Antigua','A4','A5']).map(l => <div key={l} style={{ fontSize: '0.7rem', color: '#1a3a5c' }}>{l}</div>)}
                            </div>
                            <div>
                              <div style={{ fontSize: '0.6rem', fontWeight: 700, color: '#8fa3b8', letterSpacing: '0.08em', marginBottom: '4px' }}>EXPERIENCIA</div>
                              <div style={{ fontSize: '0.7rem', color: '#1a3a5c', fontWeight: 700 }}>{anosExp || '8 años'}</div>
                              <div style={{ fontSize: '0.7rem', color: '#8fa3b8' }}>en transporte</div>
                            </div>
                            <div>
                              <div style={{ fontSize: '0.6rem', fontWeight: 700, color: '#8fa3b8', letterSpacing: '0.08em', marginBottom: '4px' }}>EQUIPOS</div>
                              <div style={{ fontSize: '0.7rem', color: '#1a3a5c', fontWeight: 700 }}>{equiposSel.filter(e => !['Otros-Camion','Otros-Maquinaria','Otros-Izaje','Otros-Especiales'].includes(e)).length || 12} equipos</div>
                              <div style={{ fontSize: '0.7rem', color: '#8fa3b8' }}>operados</div>
                            </div>
                          </div>
                          <div style={{ borderTop: '1px solid #e8eef5', paddingTop: '10px', marginBottom: '10px' }}>
                            <div style={{ fontSize: '0.6rem', fontWeight: 700, color: '#8fa3b8', letterSpacing: '0.08em', marginBottom: '6px' }}>EXPERIENCIA LABORAL</div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <div>
                                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1a3a5c' }}>Transportes del Norte SpA</div>
                                <div style={{ fontSize: '0.7rem', color: '#8fa3b8' }}>Conductor de Camión Tolva</div>
                              </div>
                              <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '0.7rem', color: '#1a3a5c' }}>2019 - 2024</div>
                                <div style={{ fontSize: '0.7rem', color: '#8fa3b8' }}>5 años</div>
                              </div>
                            </div>
                          </div>
                          <div style={{ borderTop: '1px solid #e8eef5', paddingTop: '10px' }}>
                            <div style={{ fontSize: '0.6rem', fontWeight: 700, color: '#8fa3b8', letterSpacing: '0.08em', marginBottom: '6px' }}>DOCUMENTACIÓN</div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <div>
                                {['Hoja de vida','Certificado de antecedentes','Cursos y certificados'].map(d => (
                                  <div key={d} style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                                    <span style={{ color: '#22c55e', fontSize: '0.7rem' }}>✅</span>
                                    <span style={{ fontSize: '0.7rem', color: '#1a3a5c' }}>{d}</span>
                                  </div>
                                ))}
                              </div>
                              <span style={{ fontSize: '0.7rem', color: '#2563eb', cursor: 'pointer' }}>Ver todos los documentos &gt;</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
                      <button onClick={descargarCV} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: '#fff', border: '1px solid #e8eef5', color: '#1a3a5c', padding: '10px', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}>
                        <i className="ti ti-download" style={{ fontSize: '1rem' }}></i>
                        <div><div>Descargar vista previa</div><div style={{ fontSize: '0.72rem', color: '#8fa3b8' }}>PDF</div></div>
                      </button>
                      <button onClick={() => setPasoActivo(1)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: '#f4f7fa', border: '1px solid #e8eef5', color: '#1a3a5c', padding: '10px', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}>
                        <i className="ti ti-pencil" style={{ fontSize: '1rem' }}></i>
                        <div><div>Editar información</div><div style={{ fontSize: '0.72rem', color: '#8fa3b8' }}>Volver a revisar mis datos</div></div>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Banner final */}
                <div style={{ background: '#eaf1fe', border: '1px solid #bfdbfe', borderRadius: '10px', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                  <i className="ti ti-user-check" style={{ fontSize: '1.5rem', color: '#2563eb' }}></i>
                  <div>
                    <div style={{ fontWeight: 700, color: '#1a3a5c', fontSize: '0.88rem' }}>¡Ya casi estás listo!</div>
                    <div style={{ color: '#8fa3b8', fontSize: '0.78rem' }}>Completa tu foto y genera tu CV para comenzar a postular a las mejores oportunidades.</div>
                  </div>
                </div>

                {mensaje && <div style={{ fontSize: '0.85rem', color: mensaje.includes('Error') ? '#e74c3c' : '#22c55e', marginBottom: '16px', textAlign: 'right' }}>{mensaje}</div>}

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <button onClick={() => setPasoActivo(5)} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fff', border: '1px solid #e8eef5', color: '#1a3a5c', padding: '12px 28px', borderRadius: '8px', fontSize: '0.92rem', fontWeight: 700, cursor: 'pointer' }}>← Atrás</button>
                  <button onClick={() => handleGuardarPaso6(false)} disabled={guardando} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#2563eb', border: 'none', color: 'white', padding: '12px 28px', borderRadius: '8px', fontSize: '0.92rem', fontWeight: 700, cursor: guardando ? 'wait' : 'pointer' }}>
                    <i className="ti ti-circle-check" style={{ fontSize: '1rem' }}></i>
                    {guardando ? 'Guardando...' : 'Generar mi CV y finalizar'}
                  </button>
                </div>
                <div style={{ textAlign: 'center', color: '#8fa3b8', fontSize: '0.75rem', marginTop: '8px' }}>🔒 Tu perfil quedará visible para las empresas</div>
              </>
            )}
          </div>
        </div>
        <p style={{ textAlign: 'center', color: '#8fa3b8', fontSize: '0.8rem', marginTop: '16px' }}>🔒 Puedes guardar y continuar después. Tu progreso se guardará automáticamente.</p>
      </div>
    </div>
  )
}
