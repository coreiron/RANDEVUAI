
import { Router } from 'express';
import { authenticateUser } from '../middleware/auth';
import {
  createAppointment,
  getUserAppointments,
  getBusinessAppointments,
  updateAppointmentStatus,
  cancelAppointment
} from '../controllers/appointmentController';

const router = Router();

// User appointment routes
router.post('/', authenticateUser, createAppointment);
router.get('/user', authenticateUser, getUserAppointments);
router.put('/:appointmentId/cancel', authenticateUser, cancelAppointment);

// Business appointment routes
router.get('/business/:shopId', authenticateUser, getBusinessAppointments);
router.put('/:appointmentId/status', authenticateUser, updateAppointmentStatus);

export default router;
