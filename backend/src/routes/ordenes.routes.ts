import { Router } from 'express';

let nextOrdenId = 1;

type EstadoOrden = 'pendiente' | 'en_reparacion' | 'terminado' | 'entregado';

interface OrdenTrabajoPayload {
  clienteNombre: string;
  clienteTelefono: string;
  vehiculo: string;
  modelo: string;
  patente: string;
  kilometraje?: number;
  problemaReportado?: string;
}

const ordenes: (OrdenTrabajoPayload & {
  id: number;
  estado: EstadoOrden;
  fechaIngreso: string;
})[] = [];

const router = Router();

router.post('/', (req, res) => {
  const {
    clienteNombre,
    clienteTelefono,
    vehiculo,
    modelo,
    patente,
    kilometraje,
    problemaReportado
  } = req.body as OrdenTrabajoPayload;

  if (!clienteNombre || !patente) {
    return res.status(400).json({ message: 'clienteNombre y patente son obligatorios' });
  }

  const nuevaOrden = {
    id: nextOrdenId++,
    clienteNombre,
    clienteTelefono,
    vehiculo,
    modelo,
    patente,
    kilometraje: kilometraje ?? undefined,
    problemaReportado: problemaReportado ?? '',
    estado: 'pendiente',
    fechaIngreso: new Date().toISOString()
  };

  ordenes.push(nuevaOrden);

  return res.status(201).json(nuevaOrden);
});

router.get('/', (req, res) => {
  const { q, estado } = req.query as { q?: string; estado?: EstadoOrden };
  let resultado = [...ordenes];

  if (q && q.trim() !== '') {
    const term = q.toLowerCase();
    resultado = resultado.filter(
      (o) =>
        o.clienteNombre.toLowerCase().includes(term) ||
        o.patente.toLowerCase().includes(term) ||
        (o.vehiculo && o.vehiculo.toLowerCase().includes(term)) ||
        (o.modelo && o.modelo.toLowerCase().includes(term))
    );
  }

  if (estado && ['pendiente', 'en_reparacion', 'terminado', 'entregado'].includes(estado)) {
    resultado = resultado.filter((o) => o.estado === estado);
  }

  res.json(resultado);
});

router.patch('/:id/estado', (req, res) => {
  const id = Number(req.params.id);
  const { estado } = req.body as { estado: EstadoOrden };

  const orden = ordenes.find((o) => o.id === id);
  if (!orden) {
    return res.status(404).json({ message: 'Orden no encontrada' });
  }

  if (!estado || !['pendiente', 'en_reparacion', 'terminado', 'entregado'].includes(estado)) {
    return res.status(400).json({ message: 'Estado inválido' });
  }

  orden.estado = estado;
  res.json(orden);
});

router.get('/:id/whatsapp', (req, res) => {
  const id = Number(req.params.id);
  const orden = ordenes.find((o) => o.id === id);
  if (!orden) {
    return res.status(404).json({ message: 'Orden no encontrada' });
  }

  const mensaje = `Hola ${orden.clienteNombre}, su vehículo ${orden.patente} ya está listo para retirar en el taller. Muchas gracias.`;
  const telefonoLimpio = (orden.clienteTelefono || '').replace(/\D/g, '');
  const encoded = encodeURIComponent(mensaje);
  const url = `https://wa.me/${telefonoLimpio}?text=${encoded}`;

  res.json({ mensaje, url });
});

router.delete('/:id', (req, res) => {
  const id = Number(req.params.id);
  const index = ordenes.findIndex((o) => o.id === id);
  if (index === -1) {
    return res.status(404).json({ message: 'Orden no encontrada' });
  }

  ordenes.splice(index, 1);
  res.status(204).send();
});

export default router;

