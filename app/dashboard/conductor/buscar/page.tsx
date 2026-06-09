'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function BuscarEmpleos() {
  const router = useRouter()
  const [filtros, setFiltros] = useState({
    cargo: '',
    ubicacion: '',
    tipoTrabajo: '',
    licencia: '',
    turno: '',
    salarioMin: '',
    salarioMax: '',
    modalidad: '',
  })

  const tiposTrabajo = ['Minería', 'Reparto', 'Transporte de pasajeros', 'Carga general', 'Granel', 'Forestal']
  const licencias = ['A1', 'A2', 'A3', 'A4', 'A5', 'B', 'C', 'D', 'E', 'F']
  const turnos = ['Lunes a Viernes', 'Turnos 7x7', 'Turnos 14x14', 'Turnos Rotativos', 'Fin de semana']
  const regiones = ['Región Metropolitana', 'Antofagasta', 'Atacama', 'Coquimbo', 'Valparaíso', 'O\'Higgins', 'Maule', 'Biobío', 'Araucanía', 'Los Lagos']

  const resultados = [
    { empresa: 'CA', nombre: 'Conductor A4', compania: 'Transporte Andes', lugar: 'Antofagasta, II Región', tags: ['Minera', 'Turnos 7x7'], salario: '$1.800.000 - $2.200.000', tiempo: 'Hace 2 horas', destacado: true },
    { empresa: 'LS', nombre: 'Conductor A5', compania: 'Logística Sur Ltda.', lugar: 'Santiago, RM', tags: ['Reparto', 'Lunes a Viernes'], salario: '$950.000 - $1.200.000', tiempo: 'Hace 5 horas', destacado: false },
    { empresa: 'MN', nombre: 'Conductor A4', compania: 'Minera del Norte', lugar: 'Calama, II Región', tags: ['Minera', 'Turnos 14x14'], salario: '$2.100.000 - $2.500.000', tiempo: 'Hace 1 día', destacado: false },
    { empresa: 'BB', nombre: 'Conductor Profesional', compania: 'Buses Bío Bío', lugar: 'Concepción, VIII Región', tags: ['Pasajeros', 'Turnos Rotativos'], salario: '$1.100.000 - $1.400.000', tiempo: 'Hace 1 día', destacado: false },
    { empresa: 'TR', nombre: 'Conductor A3', compania: 'Transportes Rápido', lugar: 'Valparaíso, V Región', tags: ['Carga', 'Lunes a Sábado'], salario: '$850.000 - $1.100.000', tiempo: 'Hace 2 días', destacado: false },
    { empresa: 'SC', nombre: 'Conductor A5', compania: 'Servicios del Centro', lugar: 'Santiago, RM', tags: ['Urbano', 'Turnos Rotativos'], salario: '$900.000 - $1.050.000', tiempo: 'Hace 2 días', destacado: false },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#f4f7fa', display: 'flex' }}>
      {/* Sidebar izquierdo con filtros */}
      <div style={{ width: '280px', background: 'white', borderRight: '1px solid #e8eef5', padding: '24px', flexShrink: 0, position: 'sticky', top: 0, height: '100vh', overflowY: 'auto' }}>
        <button onClick={() => router.back()} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'transparent', border: 'none', color: '#2563eb', fontSize: '0.85rem', cursor: 'pointer', marginBottom: '20px', padding: 0 }}>
          ← Volver al dashboard
        </button>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#1a3a5c', marginBottom: '20px' }}>🔍 Filtros de búsqueda</h2>

        {/* Cargo */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#8fa3b8', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Qué trabajo buscas</label>
          <input value={filtros.cargo} onChange={e => setFiltros({...filtros, cargo: e.target.value})} placeholder="Ej: Conductor A4, Minería..." style={{ width: '100%', background: '#f4f7fa', border: '1px solid #e8eef5', borderRadius: '8px', padding: '9px 12px', fontSize: '0.88rem', outline: 'none', color: '#1a3a5c', boxSizing: 'border-box' }} />
        </div>

        {/* Ubicación */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#8fa3b8', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Región</label>
          <select value={filtros.ubicacion} onChange={e => setFiltros({...filtros, ubicacion: e.target.value})} style={{ width: '100%', background: '#f4f7fa', border: '1px solid #e8eef5', borderRadius: '8px', padding: '9px 12px', fontSize: '0.88rem', outline: 'none', color: '#1a3a5c' }}>
            <option value="">Todas las regiones</option>
            {regiones.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        {/* Tipo de trabajo */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#8fa3b8', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Tipo de trabajo</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {tiposTrabajo.map(t => (
              <button key={t} onClick={() => setFiltros({...filtros, tipoTrabajo: filtros.tipoTrabajo === t ? '' : t})} style={{ background: filtros.tipoTrabajo === t ? '#2563eb' : '#f4f7fa', color: filtros.tipoTrabajo === t ? 'white' : '#1a3a5c', border: '1px solid ' + (filtros.tipoTrabajo === t ? '#2563eb' : '#e8eef5'), borderRadius: '6px', padding: '4px 10px', fontSize: '0.78rem', cursor: 'pointer' }}>{t}</button>
            ))}
          </div>
        </div>

        {/* Licencia */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#8fa3b8', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Licencia</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {licencias.map(l => (
              <button key={l} onClick={() => setFiltros({...filtros, licencia: filtros.licencia === l ? '' : l})} style={{ background: filtros.licencia === l ? '#2563eb' : '#f4f7fa', color: filtros.licencia === l ? 'white' : '#1a3a5c', border: '1px solid ' + (filtros.licencia === l ? '#2563eb' : '#e8eef5'), borderRadius: '6px', padding: '4px 10px', fontSize: '0.78rem', cursor: 'pointer' }}>{l}</button>
            ))}
          </div>
        </div>

        {/* Turno */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#8fa3b8', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Turno</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {turnos.map(t => (
              <button key={t} onClick={() => setFiltros({...filtros, turno: filtros.turno === t ? '' : t})} style={{ background: filtros.turno === t ? '#2563eb' : '#f4f7fa', color: filtros.turno === t ? 'white' : '#1a3a5c', border: '1px solid ' + (filtros.turno === t ? '#2563eb' : '#e8eef5'), borderRadius: '6px', padding: '4px 10px', fontSize: '0.78rem', cursor: 'pointer' }}>{t}</button>
            ))}
          </div>
        </div>

        {/* Salario */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#8fa3b8', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Rango salarial</label>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input value={filtros.salarioMin} onChange={e => setFiltros({...filtros, salarioMin: e.target.value})} placeholder="Mínimo" style={{ flex: 1, background: '#f4f7fa', border: '1px solid #e8eef5', borderRadius: '8px', padding: '8px', fontSize: '0.82rem', outline: 'none', color: '#1a3a5c' }} />
            <span style={{ color: '#8fa3b8' }}>-</span>
            <input value={filtros.salarioMax} onChange={e => setFiltros({...filtros, salarioMax: e.target.value})} placeholder="Máximo" style={{ flex: 1, background: '#f4f7fa', border: '1px solid #e8eef5', borderRadius: '8px', padding: '8px', fontSize: '0.82rem', outline: 'none', color: '#1a3a5c' }} />
          </div>
        </div>

        <button onClick={() => setFiltros({ cargo: '', ubicacion: '', tipoTrabajo: '', licencia: '', turno: '', salarioMin: '', salarioMax: '', modalidad: '' })} style={{ width: '100%', background: 'transparent', border: '1px solid #e8eef5', color: '#8fa3b8', padding: '9px', borderRadius: '8px', fontSize: '0.85rem', cursor: 'pointer', marginBottom: '10px' }}>Limpiar filtros</button>
        <button style={{ width: '100%', background: '#2563eb', border: 'none', color: 'white', padding: '10px', borderRadius: '8px', fontSize: '0.88rem', fontWeight: 700, cursor: 'pointer' }}>Buscar empleos</button>
      </div>

      {/* Resultados */}
      <div style={{ flex: 1, padding: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h1 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1a3a5c', marginBottom: '4px' }}>Buscar empleos</h1>
            <p style={{ color: '#8fa3b8', fontSize: '0.88rem' }}>{resultados.length} empleos encontrados</p>
          </div>
          <select style={{ background: 'white', border: '1px solid #e8eef5', borderRadius: '8px', padding: '8px 14px', fontSize: '0.85rem', color: '#1a3a5c', outline: 'none' }}>
            <option>Más recientes</option>
            <option>Mayor salario</option>
            <option>Más relevantes</option>
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
          {resultados.map((e, i) => (
            <div key={i} style={{ background: 'white', borderRadius: '12px', padding: '18px', border: '1px solid #e8eef5', cursor: 'pointer' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#1a3a5c', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '0.85rem' }}>{e.empresa}</div>
                {e.destacado && <span style={{ background: '#e8f5e9', color: '#1b5e20', fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>Destacado</span>}
              </div>
              <div style={{ fontWeight: 700, color: '#1a3a5c', fontSize: '1rem', marginBottom: '2px' }}>{e.nombre}</div>
              <div style={{ fontSize: '0.88rem', color: '#8fa3b8', marginBottom: '2px' }}>{e.compania}</div>
              <div style={{ fontSize: '0.85rem', color: '#8fa3b8', marginBottom: '10px' }}>📍 {e.lugar}</div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
                {e.tags.map(t => <span key={t} style={{ fontSize: '0.75rem', color: '#8fa3b8', background: '#f4f7fa', padding: '3px 10px', borderRadius: '4px' }}>{t}</span>)}
              </div>
              <div style={{ fontWeight: 700, color: '#1a3a5c', marginBottom: '4px' }}>{e.salario}</div>
              <div style={{ fontSize: '0.78rem', color: '#8fa3b8', marginBottom: '14px' }}>Publicado {e.tiempo}</div>
              <button style={{ width: '100%', background: 'transparent', border: '1px solid #2563eb', color: '#2563eb', padding: '8px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>Postular</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
