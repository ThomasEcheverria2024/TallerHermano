import './App.css'
import { useEffect, useState } from 'react'
import Swal from 'sweetalert2'
import { fetchDashboardStats } from './api/dashboard'
import type { DashboardStats } from './api/dashboard'
import {
  cambiarEstadoOrden,
  crearOrden,
  listarOrdenes,
  obtenerWhatsappOrden,
  eliminarOrden,
  type Orden,
  type EstadoOrden
} from './api/ordenes'
import {
  cambiarEstadoTurno,
  crearTurno,
  eliminarTurno,
  listarTurnos,
  type Turno,
  type EstadoTurno
} from './api/turnos'

type Theme = 'dark' | 'light'
type Panel = 'dashboard' | 'ordenes' | 'turnos'

function App() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [savingOrden, setSavingOrden] = useState(false)
  const [ordenMessage, setOrdenMessage] = useState<string | null>(null)
  const [ordenes, setOrdenes] = useState<Orden[]>([])
  const [loadingOrdenes, setLoadingOrdenes] = useState(false)
  const [theme, setTheme] = useState<Theme>('dark')
  const [activePanel, setActivePanel] = useState<Panel>('dashboard')
  const [ordenFiltroTexto, setOrdenFiltroTexto] = useState('')
  const [ordenFiltroEstado, setOrdenFiltroEstado] = useState<EstadoOrden | ''>('')

  const [turnos, setTurnos] = useState<Turno[]>([])
  const [loadingTurnos, setLoadingTurnos] = useState(false)
  const [turnoFecha, setTurnoFecha] = useState<string>('')
  const [turnoForm, setTurnoForm] = useState({
    clienteNombre: '',
    clienteTelefono: '',
    vehiculo: '',
    patente: '',
    fecha: '',
    hora: '',
    observaciones: ''
  })

  const [form, setForm] = useState({
    clienteNombre: '',
    clienteTelefono: '',
    vehiculo: '',
    modelo: '',
    patente: '',
    kilometraje: '',
    problemaReportado: ''
  })

  useEffect(() => {
    fetchDashboardStats()
      .then((data) => {
        setStats(data)
        setLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setError('No se pudieron cargar las estadísticas')
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    const body = document.body
    body.classList.remove('theme-dark', 'theme-light')
    body.classList.add(theme === 'dark' ? 'theme-dark' : 'theme-light')
  }, [theme])

  const cargarOrdenes = async () => {
    setLoadingOrdenes(true)
    try {
      const data = await listarOrdenes({
        q: ordenFiltroTexto || undefined,
        estado: ordenFiltroEstado || undefined
      })
      setOrdenes(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingOrdenes(false)
    }
  }

  useEffect(() => {
    void cargarOrdenes()
  }, [ordenFiltroTexto, ordenFiltroEstado])

  const cargarTurnos = async (fecha?: string) => {
    setLoadingTurnos(true)
    try {
      const data = await listarTurnos(fecha)
      setTurnos(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingTurnos(false)
    }
  }

  useEffect(() => {
    void cargarTurnos(turnoFecha || undefined)
  }, [turnoFecha])

  const ingresosDia = stats?.ingresosDia ?? 0
  const ingresosMes = stats?.ingresosMes ?? 0
  const vehiculosAtendidos = stats?.vehiculosAtendidos ?? 0
  const trabajosEnCurso = stats?.trabajosEnCurso ?? 0
  const trabajosFinalizados = stats?.trabajosFinalizados ?? 0

  return (
    <div className="app">
      <header className="app-header">
        <div>
          <h1>Taller Hermano</h1>
          <p>Gestión integral del taller</p>
        </div>

        <div className="header-actions">
          <div className="tabs">
            <button
              type="button"
              className={activePanel === 'dashboard' ? 'tab active' : 'tab'}
              onClick={() => setActivePanel('dashboard')}
            >
              Dashboard
            </button>
            <button
              type="button"
              className={activePanel === 'ordenes' ? 'tab active' : 'tab'}
              onClick={() => setActivePanel('ordenes')}
            >
              Órdenes
            </button>
            <button
              type="button"
              className={activePanel === 'turnos' ? 'tab active' : 'tab'}
              onClick={() => setActivePanel('turnos')}
            >
              Turnos
            </button>
          </div>
          <button
            type="button"
            className="theme-toggle"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
          </button>
        </div>
      </header>

      <main className="dashboard">
        {error && <p style={{ color: '#fca5a5' }}>{error}</p>}

        {activePanel === 'dashboard' && (
          <>
            <section className="cards">
              <div className="card">
                <h2>Ingresos del día</h2>
                <p className="value">
                  {loading ? 'Cargando...' : `$ ${ingresosDia.toFixed(2)}`}
                </p>
              </div>
              <div className="card">
                <h2>Ingresos del mes</h2>
                <p className="value">
                  {loading ? 'Cargando...' : `$ ${ingresosMes.toFixed(2)}`}
                </p>
              </div>
              <div className="card">
                <h2>Vehículos atendidos</h2>
                <p className="value">
                  {loading ? 'Cargando...' : vehiculosAtendidos}
                </p>
              </div>
              <div className="card">
                <h2>Trabajos en curso</h2>
                <p className="value">
                  {loading ? 'Cargando...' : trabajosEnCurso}
                </p>
              </div>
              <div className="card">
                <h2>Trabajos finalizados</h2>
                <p className="value">
                  {loading ? 'Cargando...' : trabajosFinalizados}
                </p>
              </div>
            </section>

            <section className="chart-placeholder">
              <h2>Gráfico mensual de ingresos</h2>
              <p>(Aquí irá el gráfico)</p>
            </section>
          </>
        )}

        {activePanel === 'ordenes' && (
          <>
            <section className="ingreso-vehiculo">
          <h2>Ingreso rápido de vehículo</h2>
          <p className="ingreso-subtitle">
            Crear una orden de trabajo básica cuando el vehículo llega al taller.
          </p>

          {ordenMessage && <p className="orden-message">{ordenMessage}</p>}

          <form
            className="ingreso-form"
            onSubmit={async (e) => {
              e.preventDefault()
              setOrdenMessage(null)
              setSavingOrden(true)
              try {
                await crearOrden({
                  clienteNombre: form.clienteNombre,
                  clienteTelefono: form.clienteTelefono,
                  vehiculo: form.vehiculo,
                  modelo: form.modelo,
                  patente: form.patente,
                  kilometraje: form.kilometraje
                    ? Number(form.kilometraje)
                    : undefined,
                  problemaReportado: form.problemaReportado
                })
                setOrdenMessage('Orden creada correctamente.')
                void cargarOrdenes()
                setForm({
                  clienteNombre: '',
                  clienteTelefono: '',
                  vehiculo: '',
                  modelo: '',
                  patente: '',
                  kilometraje: '',
                  problemaReportado: ''
                })
              } catch (err: any) {
                setOrdenMessage(err.message || 'Error al crear la orden')
              } finally {
                setSavingOrden(false)
              }
            }}
          >
            <div className="form-grid">
              <div className="field">
                <label>Cliente *</label>
                <input
                  type="text"
                  required
                  value={form.clienteNombre}
                  onChange={(e) =>
                    setForm({ ...form, clienteNombre: e.target.value })
                  }
                />
              </div>
              <div className="field">
                <label>Teléfono</label>
                <input
                  type="tel"
                  value={form.clienteTelefono}
                  onChange={(e) =>
                    setForm({ ...form, clienteTelefono: e.target.value })
                  }
                />
              </div>
              <div className="field">
                <label>Vehículo</label>
                <input
                  type="text"
                  placeholder="Ej: Ford"
                  value={form.vehiculo}
                  onChange={(e) =>
                    setForm({ ...form, vehiculo: e.target.value })
                  }
                />
              </div>
              <div className="field">
                <label>Modelo</label>
                <input
                  type="text"
                  placeholder="Ej: Focus"
                  value={form.modelo}
                  onChange={(e) =>
                    setForm({ ...form, modelo: e.target.value })
                  }
                />
              </div>
              <div className="field">
                <label>Patente *</label>
                <input
                  type="text"
                  required
                  value={form.patente}
                  onChange={(e) =>
                    setForm({ ...form, patente: e.target.value })
                  }
                />
              </div>
              <div className="field">
                <label>Kilometraje</label>
                <input
                  type="number"
                  min={0}
                  value={form.kilometraje}
                  onChange={(e) =>
                    setForm({ ...form, kilometraje: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="field">
              <label>Problema reportado</label>
              <textarea
                rows={3}
                value={form.problemaReportado}
                onChange={(e) =>
                  setForm({ ...form, problemaReportado: e.target.value })
                }
              />
            </div>

            <button className="submit-btn" type="submit" disabled={savingOrden}>
              {savingOrden ? 'Guardando...' : 'Crear orden de trabajo'}
            </button>
          </form>
            </section>

            <section className="ordenes-lista">
              <h2>Órdenes recientes</h2>
              <div className="ordenes-filtros">
                <input
                  type="text"
                  placeholder="Buscar por cliente, vehículo o patente..."
                  value={ordenFiltroTexto}
                  onChange={(e) => setOrdenFiltroTexto(e.target.value)}
                />
                <select
                  value={ordenFiltroEstado}
                  onChange={(e) =>
                    setOrdenFiltroEstado(
                      e.target.value === '' ? '' : (e.target.value as EstadoOrden)
                    )
                  }
                >
                  <option value="">Todos los estados</option>
                  <option value="pendiente">Pendiente</option>
                  <option value="en_reparacion">En reparación</option>
                  <option value="terminado">Terminado</option>
                  <option value="entregado">Entregado</option>
                </select>
              </div>
          {loadingOrdenes ? (
            <p>Cargando órdenes...</p>
          ) : ordenes.length === 0 ? (
            <p className="ordenes-empty">Todavía no hay órdenes.</p>
          ) : (
            <div className="ordenes-table">
              <div className="ordenes-header">
                <span>#</span>
                <span>Cliente</span>
                <span>Vehículo</span>
                <span>Patente</span>
                <span>Estado</span>
                <span>Acciones</span>
              </div>
              {ordenes.map((o) => (
                <div key={o.id} className="ordenes-row">
                  <span>{o.id}</span>
                  <span>{o.clienteNombre}</span>
                  <span>
                    {o.vehiculo} {o.modelo}
                  </span>
                  <span>{o.patente}</span>
                  <span className={`estado-pill estado-${o.estado}`}>
                    {o.estado.replace('_', ' ')}
                  </span>
                  <span className="ordenes-actions">
                    <select
                      value={o.estado}
                      onChange={async (e) => {
                        const nuevo = e.target.value as EstadoOrden
                        try {
                          const actualizada = await cambiarEstadoOrden(o.id, nuevo)
                          setOrdenes((prev) =>
                            prev.map((ord) => (ord.id === o.id ? actualizada : ord))
                          )
                        } catch (err) {
                          console.error(err)
                          alert('Error al cambiar estado')
                        }
                      }}
                    >
                      <option value="pendiente">Pendiente</option>
                      <option value="en_reparacion">En reparación</option>
                      <option value="terminado">Terminado</option>
                      <option value="entregado">Entregado</option>
                    </select>
                    <button
                      type="button"
                      className="delete-btn"
                      onClick={async () => {
                        const result = await Swal.fire({
                          title: 'Eliminar orden',
                          text: '¿Seguro que quieres eliminar esta orden?',
                          icon: 'warning',
                          showCancelButton: true,
                          confirmButtonText: 'Sí, eliminar',
                          cancelButtonText: 'Cancelar',
                          confirmButtonColor: '#ef4444'
                        })
                        if (!result.isConfirmed) return
                        try {
                          await eliminarOrden(o.id)
                          await Swal.fire('Eliminada', 'La orden fue eliminada.', 'success')
                          void cargarOrdenes()
                        } catch (err) {
                          console.error(err)
                          void Swal.fire('Error', 'Error al eliminar orden', 'error')
                        }
                      }}
                    >
                      Eliminar
                    </button>
                    <button
                      type="button"
                      className="whatsapp-btn"
                      disabled={o.estado !== 'terminado'}
                      onClick={async () => {
                        try {
                          const data = await obtenerWhatsappOrden(o.id)
                          window.open(data.url, '_blank')
                        } catch (err) {
                          console.error(err)
                          void Swal.fire('Error', 'Error al abrir WhatsApp', 'error')
                        }
                      }}
                    >
                      WhatsApp
                    </button>
                  </span>
                </div>
              ))}
            </div>
          )}
            </section>
          </>
        )}

        {activePanel === 'turnos' && (
          <>
            <section className="ingreso-vehiculo">
              <h2>Nuevo turno</h2>
              <p className="ingreso-subtitle">
                Agenda un turno para el cliente con fecha y hora.
              </p>
              <form
                className="ingreso-form"
                onSubmit={async (e) => {
                  e.preventDefault()
                  try {
                    await crearTurno({
                      clienteNombre: turnoForm.clienteNombre,
                      clienteTelefono: turnoForm.clienteTelefono,
                      vehiculo: turnoForm.vehiculo,
                      patente: turnoForm.patente,
                      fecha: turnoForm.fecha,
                      hora: turnoForm.hora,
                      observaciones: turnoForm.observaciones
                    })
                    setTurnoForm({
                      clienteNombre: '',
                      clienteTelefono: '',
                      vehiculo: '',
                      patente: '',
                      fecha: '',
                      hora: '',
                      observaciones: ''
                    })
                    void cargarTurnos(turnoFecha || undefined)
                  } catch (err: any) {
                    void Swal.fire(
                      'Error',
                      err.message || 'Error al crear turno',
                      'error'
                    )
                  }
                }}
              >
                <div className="form-grid">
                  <div className="field">
                    <label>Cliente *</label>
                    <input
                      type="text"
                      required
                      value={turnoForm.clienteNombre}
                      onChange={(e) =>
                        setTurnoForm({ ...turnoForm, clienteNombre: e.target.value })
                      }
                    />
                  </div>
                  <div className="field">
                    <label>Teléfono</label>
                    <input
                      type="tel"
                      value={turnoForm.clienteTelefono}
                      onChange={(e) =>
                        setTurnoForm({ ...turnoForm, clienteTelefono: e.target.value })
                      }
                    />
                  </div>
                  <div className="field">
                    <label>Vehículo</label>
                    <input
                      type="text"
                      value={turnoForm.vehiculo}
                      onChange={(e) =>
                        setTurnoForm({ ...turnoForm, vehiculo: e.target.value })
                      }
                    />
                  </div>
                  <div className="field">
                    <label>Patente *</label>
                    <input
                      type="text"
                      required
                      value={turnoForm.patente}
                      onChange={(e) =>
                        setTurnoForm({ ...turnoForm, patente: e.target.value })
                      }
                    />
                  </div>
                  <div className="field">
                    <label>Fecha *</label>
                    <input
                      type="date"
                      required
                      value={turnoForm.fecha}
                      onChange={(e) =>
                        setTurnoForm({ ...turnoForm, fecha: e.target.value })
                      }
                    />
                  </div>
                  <div className="field">
                    <label>Hora *</label>
                    <input
                      type="time"
                      required
                      value={turnoForm.hora}
                      onChange={(e) =>
                        setTurnoForm({ ...turnoForm, hora: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="field">
                  <label>Observaciones</label>
                  <textarea
                    rows={3}
                    value={turnoForm.observaciones}
                    onChange={(e) =>
                      setTurnoForm({ ...turnoForm, observaciones: e.target.value })
                    }
                  />
                </div>
                <button className="submit-btn" type="submit">
                  Crear turno
                </button>
              </form>
            </section>

            <section className="ordenes-lista">
              <h2>Turnos</h2>
              <div className="ordenes-filtros">
                <input
                  type="date"
                  value={turnoFecha}
                  onChange={(e) => setTurnoFecha(e.target.value)}
                />
              </div>
              {loadingTurnos ? (
                <p>Cargando turnos...</p>
              ) : turnos.length === 0 ? (
                <p className="ordenes-empty">Todavía no hay turnos.</p>
              ) : (
                <div className="ordenes-table">
                  <div className="ordenes-header">
                    <span>#</span>
                    <span>Cliente</span>
                    <span>Fecha</span>
                    <span>Patente</span>
                    <span>Estado</span>
                    <span>Acciones</span>
                  </div>
                  {turnos.map((t) => (
                    <div key={t.id} className="ordenes-row">
                      <span>{t.id}</span>
                      <span>{t.clienteNombre}</span>
                      <span>
                        {t.fecha} {t.hora}
                      </span>
                      <span>{t.patente}</span>
                      <span className={`estado-pill`}>
                        {t.estado}
                      </span>
                      <span className="ordenes-actions">
                        <select
                          value={t.estado}
                          onChange={async (e) => {
                            const nuevo = e.target.value as EstadoTurno
                            try {
                              const actualizado = await cambiarEstadoTurno(t.id, nuevo)
                              setTurnos((prev) =>
                                prev.map((tu) => (tu.id === t.id ? actualizado : tu))
                              )
                            } catch (err) {
                              console.error(err)
                              void Swal.fire(
                                'Error',
                                'Error al cambiar estado de turno',
                                'error'
                              )
                            }
                          }}
                        >
                          <option value="pendiente">Pendiente</option>
                          <option value="confirmado">Confirmado</option>
                          <option value="cancelado">Cancelado</option>
                        </select>
                        <button
                          type="button"
                          className="delete-btn"
                          onClick={async () => {
                            const result = await Swal.fire({
                              title: 'Eliminar turno',
                              text: '¿Seguro que quieres eliminar este turno?',
                              icon: 'warning',
                              showCancelButton: true,
                              confirmButtonText: 'Sí, eliminar',
                              cancelButtonText: 'Cancelar',
                              confirmButtonColor: '#ef4444'
                            })
                            if (!result.isConfirmed) return
                            try {
                              await eliminarTurno(t.id)
                              await Swal.fire('Eliminado', 'El turno fue eliminado.', 'success')
                              void cargarTurnos(turnoFecha || undefined)
                            } catch (err) {
                              console.error(err)
                              void Swal.fire('Error', 'Error al eliminar turno', 'error')
                            }
                          }}
                        >
                          Eliminar
                        </button>
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  )
}

export default App
