import express from 'express';
import cors from 'cors';
import estadisticasRoutes from './routes/estadisticas.routes';
import ordenesRoutes from './routes/ordenes.routes';
import turnosRoutes from './routes/turnos.routes';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'API Taller Hermano funcionando' });
});

app.use('/api/estadisticas', estadisticasRoutes);
app.use('/api/ordenes', ordenesRoutes);
app.use('/api/turnos', turnosRoutes);

export default app;

