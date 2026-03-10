const API_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export type EstadoOrden = 'pendiente' | 'en_reparacion' | 'terminado' | 'entregado';

export interface NuevaOrdenPayload {
  clienteNombre: string;
  clienteTelefono: string;
  vehiculo: string;
  modelo: string;
  patente: string;
  kilometraje?: number;
  problemaReportado?: string;
}

export interface Orden {
  id: number;
  clienteNombre: string;
  clienteTelefono: string;
  vehiculo: string;
  modelo: string;
  patente: string;
  kilometraje?: number;
  problemaReportado: string;
  estado: EstadoOrden;
  fechaIngreso: string;
}

export async function crearOrden(payload: NuevaOrdenPayload) {
  const res = await fetch(`${API_URL}/ordenes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || 'Error al crear la orden');
  }

  return res.json() as Promise<Orden>;
}

export async function listarOrdenes(params?: { q?: string; estado?: EstadoOrden }): Promise<Orden[]> {
  const query = new URLSearchParams();
  if (params?.q) query.set('q', params.q);
  if (params?.estado) query.set('estado', params.estado);

  const url = `${API_URL}/ordenes${query.toString() ? `?${query.toString()}` : ''}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Error al cargar órdenes');
  return res.json();
}

export async function eliminarOrden(id: number): Promise<void> {
  const res = await fetch(`${API_URL}/ordenes/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok && res.status !== 204) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || 'Error al eliminar orden');
  }
}

export async function cambiarEstadoOrden(id: number, estado: EstadoOrden): Promise<Orden> {
  const res = await fetch(`${API_URL}/ordenes/${id}/estado`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ estado })
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || 'Error al cambiar estado');
  }
  return res.json();
}

export async function obtenerWhatsappOrden(
  id: number
): Promise<{ mensaje: string; url: string }> {
  const res = await fetch(`${API_URL}/ordenes/${id}/whatsapp`);
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || 'Error al obtener WhatsApp');
  }
  return res.json();
}

