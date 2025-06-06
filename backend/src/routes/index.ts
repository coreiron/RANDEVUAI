
import { Router } from 'express';
import appointmentRoutes from './appointmentRoutes';
import shopRoutes from './shopRoutes';

const router = Router();

// API routes
router.use('/appointments', appointmentRoutes);
router.use('/shops', shopRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    message: 'AppointMe API is running'
  });
});

export default router;
