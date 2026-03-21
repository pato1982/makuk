import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import contentRoutes from './routes/content.js';
import adminRoutes from './routes/admin.js';
import uploadRoutes from './routes/upload.js';
import contactRoutes from './routes/contact.js';
import orderRoutes from './routes/orders.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares base
app.use(cors({
  origin: ['http://186.64.122.100', 'http://makuk.cl', 'http://www.makuk.cl', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/orders', orderRoutes);

// Servir imágenes subidas
app.use('/uploads', express.static(process.env.UPLOAD_DIR || '/var/www/makuk/uploads'));

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Makuk API corriendo en puerto ${PORT}`);
});

export default app;
