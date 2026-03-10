import { Request, Response, NextFunction } from 'express';

export async function getDashboardStats(_req: Request, res: Response, next: NextFunction) {
  try {
    // Por ahora devolvemos valores estáticos (0).
    // Más adelante conectaremos esto con la base de datos real.
    res.json({
      ingresosDia: 0,
      ingresosMes: 0,
      vehiculosAtendidos: 0,
      trabajosEnCurso: 0,
      trabajosFinalizados: 0
    });
  } catch (error) {
    next(error);
  }
}

