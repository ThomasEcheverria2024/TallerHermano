const API_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export type EstadoTurno = 'pendiente' | 'confirmado' | 'cancelado';

export interface Turno {
  id: number;
  clienteNombre: string;
  clienteTelefono: string;
  vehiculo: string;
  patente: string;
  fecha: string;
  hora: string;
  observaciones: string;
  estado: EstadoTurno;
}

export interface NuevoTurnoPayload {
  clienteNombre: string;
  clienteTelefono: string;
  vehiculo: string;
  patente: string;
  fecha: string;
  hora: string;
  observaciones?: string;
}

export async function crearTurno(payload: NuevoTurnoPayload): Promise<Turno> {
  const res = await fetch(`${API_URL}/turnos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || 'Error al crear turno');
  }
  return res.json();
}

export async function listarTurnos(fecha?: string): Promise<Turno[]> {
  const url = fecha ? `${API_URL}/turnos?fecha=${encodeURIComponent(fecha)}` : `${API_URL}/turnos`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Error al cargar turnos');
  return res.json();
}

export async function cambiarEstadoTurno(
  id: number,
  estado: EstadoTurno
): Promise<Turno> {
  const res = await fetch(`${API_URL}/turnos/${id}/estado`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ estado })
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || 'Error al cambiar estado de turno');
  }
  return res.json();
}

export async function eliminarTurno(id: number): Promise<void> {
  const res = await fetch(`${API_URL}/turnos/${id}`, { method: 'DELETE' });
  if (!res.ok && res.status !== 204) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || 'Error al eliminar turno');
  }
}

