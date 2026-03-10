import { Router } from 'express';

let nextTurnoId = 1;

type EstadoTurno = 'pendiente' | 'confirmado' | 'cancelado';

interface TurnoPayload {
  clienteNombre: string;
  clienteTelefono: string;
  vehiculo: string;
  patente: string;
  fecha: string; // ISO date
  hora: string; // HH:mm
  observaciones?: string;
}

const turnos: (TurnoPayload & { id: number; estado: EstadoTurno })[] = [];

const router = Router();

router.get('/', (req, res) => {
  const { fecha } = req.query as { fecha?: string };
  if (fecha) {
    const resultados = turnos.filter((t) => t.fecha === fecha);
    return res.json(resultados);
  }
  res.json(turnos);
});

router.post('/', (req, res) => {
  const { clienteNombre, clienteTelefono, vehiculo, patente, fecha, hora, observaciones } =
    req.body as TurnoPayload;

  if (!clienteNombre || !patente || !fecha || !hora) {
    return res
      .status(400)
      .json({ message: 'clienteNombre, patente, fecha y hora son obligatorios' });
  }

  const nuevo = {
    id: nextTurnoId++,
    clienteNombre,
    clienteTelefono,
    vehiculo,
    patente,
    fecha,
    hora,
    observaciones: observaciones ?? '',
    estado: 'pendiente' as EstadoTurno
  };

  turnos.push(nuevo);
  res.status(201).json(nuevo);
});

router.patch('/:id/estado', (req, res) => {
  const id = Number(req.params.id);
  const { estado } = req.body as { estado: EstadoTurno };

  const turno = turnos.find((t) => t.id === id);
  if (!turno) return res.status(404).json({ message: 'Turno no encontrado' });

  if (!estado || !['pendiente', 'confirmado', 'cancelado'].includes(estado)) {
    return res.status(400).json({ message: 'Estado inválido' });
  }

  turno.estado = estado;
  res.json(turno);
});

router.delete('/:id', (req, res) => {
  const id = Number(req.params.id);
  const index = turnos.findIndex((t) => t.id === id);
  if (index === -1) return res.status(404).json({ message: 'Turno no encontrado' });
  turnos.splice(index, 1);
  res.status(204).send();
});

export default router;

