import { regiones as listaRegiones, regionesComunas } from '../../conductor/completar-perfil/regiones'

export const regiones = listaRegiones
export const comunasDe = (region: string) => regionesComunas[region] || []

export const RUTA = '/dashboard/empresa'

// Contacto de NetDriver para planes y soporte (cambiar aquí si cambia)
export const CORREO_SOPORTE = 'contacto@netdriver.cl'

export const LICENCIAS = ['A1', 'A2', 'A3', 'A4', 'A5', 'D', 'E', 'F'] // mismas clases que el perfil del conductor
export const TIPOS_TRABAJO = ['Minería', 'Carga general', 'Transporte de pasajeros', 'Transporte de personal', 'Reparto', 'Granel', 'Forestal', 'Maquinaria pesada', 'Otro']
export const TURNOS = ['Lunes a Viernes', 'Lunes a Sábado', 'Turnos 4x3', 'Turnos 7x7', 'Turnos 10x10', 'Turnos 14x14', 'Turnos Rotativos', 'Fin de semana', 'Por días']

export type EstadoPostulacion = 'nueva' | 'revisada' | 'preseleccionada' | 'entrevista' | 'contratado' | 'descartada'

export const ESTADOS_POSTULACION: { id: EstadoPostulacion; label: string; color: string; bg: string }[] = [
  { id: 'nueva', label: 'Nueva', color: '#2563eb', bg: '#e8f0fe' },
  { id: 'revisada', label: 'Revisada', color: '#475569', bg: '#eef2f6' },
  { id: 'preseleccionada', label: 'Preseleccionada', color: '#8e44ad', bg: '#f3e8fd' },
  { id: 'entrevista', label: 'En entrevista', color: '#c2410c', bg: '#fef3e2' },
  { id: 'contratado', label: 'Contratado', color: '#1b5e20', bg: '#e8f5e9' },
  { id: 'descartada', label: 'Descartada', color: '#b91c1c', bg: '#fdecec' },
]
export const estadoPostulacion = (id: string) => ESTADOS_POSTULACION.find(e => e.id === id) || ESTADOS_POSTULACION[0]

export const ESTADOS_EMPLEO: Record<string, { label: string; color: string; bg: string }> = {
  activo: { label: 'Activo', color: '#1b5e20', bg: '#e8f5e9' },
  pausado: { label: 'Pausado', color: '#92400e', bg: '#fff8e1' },
  cerrado: { label: 'Cerrado', color: '#475569', bg: '#eef2f6' },
}

export const PLANES = [
  {
    id: 'gratis', nombre: 'Gratis', precio: 0,
    items: ['1 empleo activo a la vez', 'Recibir postulaciones', 'Contacto por WhatsApp', '1 usuario'],
  },
  {
    id: 'pro', nombre: 'Empresarial Pro', precio: 150000, destacado: true,
    items: ['Empleos ilimitados', 'Pegas Relámpago destacadas', 'Búsqueda avanzada de conductores', 'Ver expectativa salarial', 'Reportes completos', 'Hasta 3 usuarios por empresa'],
  },
]
export const LIMITE_EMPLEOS_GRATIS = 1

export type Plantilla = { id: string; nombre: string; datos: Record<string, any> }
export const PLANTILLAS: Plantilla[] = [
  {
    id: 'mineria-a4', nombre: 'Conductor A4 · Minería',
    datos: {
      titulo: 'Conductor A4 para faena minera', tipo_trabajo: 'Minería', licencias: ['A4'], turno: 'Turnos 7x7',
      descripcion: 'Buscamos conductor profesional con licencia A4 para transporte de carga en faena minera. Operación en camino minero y ruta.',
      requisitos: 'Licencia A4 vigente\nMínimo 3 años de experiencia en minería\nExamen preocupacional al día\nHoja de vida del conductor sin anotaciones graves',
      beneficios: 'Alojamiento y alimentación en faena\nBono de producción\nContrato indefinido tras período de prueba',
    },
  },
  {
    id: 'carga-a5', nombre: 'Conductor A5 · Carga en ruta',
    datos: {
      titulo: 'Conductor A5 para ruta interregional', tipo_trabajo: 'Carga general', licencias: ['A5'], turno: 'Turnos Rotativos',
      descripcion: 'Conductor A5 para tracto camión con semirremolque en rutas interregionales.',
      requisitos: 'Licencia A5 vigente\nExperiencia comprobable en tracto camión\nDisponibilidad para viajar',
      beneficios: 'Viáticos\nBono por kilómetro\nCamión moderno con GPS',
    },
  },
  {
    id: 'pasajeros-a3', nombre: 'Conductor A3 · Transporte de personal',
    datos: {
      titulo: 'Conductor A3 para transporte de personal', tipo_trabajo: 'Transporte de personal', licencias: ['A3'], turno: 'Turnos 7x7',
      descripcion: 'Conductor para buses de traslado de personal a faena.',
      requisitos: 'Licencia A3 vigente\nCurso de manejo a la defensiva (deseable)\nBuena presentación y trato',
      beneficios: 'Contrato directo\nCapacitación pagada',
    },
  },
  {
    id: 'reparto-b', nombre: 'Conductor de reparto urbano',
    datos: {
      titulo: 'Conductor para reparto urbano', tipo_trabajo: 'Reparto', licencias: ['A2'], turno: 'Lunes a Viernes',
      descripcion: 'Reparto de mercadería en camión 3/4 dentro de la ciudad.',
      requisitos: 'Licencia A2 o superior\nConocimiento de la ciudad',
      beneficios: 'Horario diurno\nColación',
    },
  },
]

// ---------- Utilidades ----------
export const pesos = (n?: number | null) =>
  n == null ? '' : '$' + Math.round(n).toLocaleString('es-CL')

export const rangoSueldo = (min?: number | null, max?: number | null) => {
  if (min && max) return `${pesos(min)} - ${pesos(max)}`
  if (min) return `Desde ${pesos(min)}`
  if (max) return `Hasta ${pesos(max)}`
  return 'A convenir'
}

export const sueldoEmpleo = (e: any) =>
  e?.es_relampago ? (e.sueldo_min ? `${pesos(e.sueldo_min)} por día` : 'Pago a convenir') : rangoSueldo(e?.sueldo_min, e?.sueldo_max)

export const fecha = (f?: string | null) => {
  if (!f) return '—'
  const d = new Date(f.length <= 10 ? f + 'T12:00:00' : f)
  return d.toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' })
}

export const fechaHora = (f?: string | null) => {
  if (!f) return '—'
  const d = new Date(f)
  return d.toLocaleDateString('es-CL', { weekday: 'short', day: 'numeric', month: 'short' }) + ' · ' +
    d.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })
}

export const haceCuanto = (f?: string | null) => {
  if (!f) return ''
  const seg = (Date.now() - new Date(f).getTime()) / 1000
  if (seg < 60) return 'Hace un momento'
  if (seg < 3600) return `Hace ${Math.floor(seg / 60)} min`
  if (seg < 86400) { const h = Math.floor(seg / 3600); return `Hace ${h} hora${h > 1 ? 's' : ''}` }
  const d = Math.floor(seg / 86400)
  if (d < 30) return `Hace ${d} día${d > 1 ? 's' : ''}`
  const m = Math.floor(d / 30)
  return `Hace ${m} mes${m > 1 ? 'es' : ''}`
}

export const diasHasta = (f?: string | null) => {
  if (!f) return null
  const fin = new Date(f + 'T23:59:59').getTime()
  return Math.ceil((fin - Date.now()) / 86400000)
}

export const iniciales = (...partes: (string | null | undefined)[]) =>
  partes.filter(Boolean).join(' ').split(/\s+/).filter(Boolean).slice(0, 2).map(p => p[0]?.toUpperCase()).join('') || '?'

export const nombreConductor = (c: any) =>
  [c?.nombre, c?.apellido].filter(Boolean).join(' ') || 'Conductor'

// Enlace de WhatsApp con mensaje prellenado. Acepta números chilenos en cualquier formato.
export const enlaceWhatsApp = (telefono?: string | null, mensaje = '') => {
  if (!telefono) return null
  let n = telefono.replace(/\D/g, '')
  if (n.startsWith('00')) n = n.slice(2)
  if (n.length === 9 && n.startsWith('9')) n = '56' + n
  if (n.length === 8) n = '569' + n
  if (n.length < 10) return null
  return `https://wa.me/${n}${mensaje ? '?text=' + encodeURIComponent(mensaje) : ''}`
}

// Áreas de experiencia del conductor (wizard) que corresponden a cada tipo de trabajo del empleo
export const AREAS_POR_TIPO: Record<string, string[]> = {
  'Minería': ['Minería'], 'Carga general': ['Transporte de carga'], 'Transporte de pasajeros': ['Transporte de pasajeros'],
  'Transporte de personal': ['Transporte de pasajeros', 'Minería'], 'Reparto': ['Logística / Otros', 'Transporte de carga'],
  'Granel': ['Transporte de carga'], 'Forestal': ['Forestal'], 'Maquinaria pesada': ['Construcción', 'Minería'],
}
export const AREAS_CONDUCTOR = ['Minería', 'Transporte de carga', 'Transporte de pasajeros', 'Construcción', 'Forestal', 'Agrícola', 'Logística / Otros']
export const EXPERIENCIA = ['Menos de 1 año', '1 a 3 años', '3 a 5 años', '5 a 10 años', 'Más de 10 años']
export const DISPONIBILIDAD = ['Inmediata', 'En 1 semana', 'En 2 semanas', 'En 1 mes o más', 'Actualmente trabajando']

// Porcentaje de coincidencia entre un conductor y un empleo (licencia, región, tipo de trabajo)
export const calcularMatch = (conductor: any, empleo: any) => {
  if (!conductor || !empleo) return null
  let puntos = 0, total = 0
  const licC: string[] = conductor.licencias || []
  const licE: string[] = empleo.licencias || []
  if (licE.length) { total += 50; if (licE.some(l => licC.includes(l))) puntos += 50 }
  if (empleo.region) {
    total += 30
    if (conductor.region === empleo.region) puntos += 30
    else if (conductor.disponibilidad_fuera_region === 'si') puntos += 15
  }
  if (empleo.tipo_trabajo && AREAS_POR_TIPO[empleo.tipo_trabajo]?.length) {
    total += 20
    const areas: string[] = [...(conductor.areas_experiencia || []), ...(conductor.tipos_trabajo || [])]
    if (AREAS_POR_TIPO[empleo.tipo_trabajo].some(a => areas.includes(a))) puntos += 20
  }
  return total ? Math.round((puntos / total) * 100) : null
}

export const colorMatch = (m: number) =>
  m >= 90 ? { bg: '#e8f5e9', color: '#1b5e20' } : m >= 60 ? { bg: '#e8f0fe', color: '#1a3a5c' } : { bg: '#fff8e1', color: '#92400e' }

// Campos del conductor que la empresa necesita leer
export const CAMPOS_CONDUCTOR =
  'id, nombre, apellido, telefono, email, region, comuna, licencias, licencias_vencimientos, anos_experiencia, areas_experiencia, tipos_trabajo, turnos_experiencia, disponibilidad_trabajo, disponibilidad_fuera_region, movilidad_propia, equipos_sel, foto_perfil_url, perfil_completo'
