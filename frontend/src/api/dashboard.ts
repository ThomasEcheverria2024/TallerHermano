export interface DashboardStats {
  ingresosDia: number;
  ingresosMes: number;
  vehiculosAtendidos: number;
  trabajosEnCurso: number;
  trabajosFinalizados: number;
}

const API_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const res = await fetch(`${API_URL}/estadisticas/dashboard`);
  if (!res.ok) {
    throw new Error('Error al cargar estadísticas');
  }
  return res.json();
}

