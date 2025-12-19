import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';
import authRoutes from './modules/auth/auth.routes';
import appointmentRoutes from './modules/appointments/appointment.routes';
import notesRoutes from './modules/notes/notes.routes';
import doctorRoutes from './modules/doctors/doctor.routes';

const app = express();

// Load OpenAPI specification
const swaggerPath = path.join(__dirname, '..', 'openapi.yaml');
const swaggerDocument = YAML.load(swaggerPath);

// Middleware
app.use(cors());
app.use(express.json());

// Swagger UI documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'MediConnect API Documentation',
  swaggerOptions: {
    persistAuthorization: true,
  },
}));

// API routes
app.use('/auth', authRoutes);
app.use('/appointments', appointmentRoutes);
app.use('/notes', notesRoutes);
app.use('/doctors', doctorRoutes);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

export default app;
