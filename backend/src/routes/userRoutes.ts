import { Router } from 'express';
import {
    getUserProfile,
    updateUserProfile,
    updateUserPreferences,
    createBusinessAuthAccounts
} from '../controllers/userController';
import { authenticateUser } from '../middleware/auth';

const router = Router();

// Kullanıcı profili route'ları
router.get('/profile', authenticateUser, getUserProfile);
router.put('/profile', authenticateUser, updateUserProfile);
router.put('/preferences', authenticateUser, updateUserPreferences);

// İşletme hesapları oluşturma (admin işlemi)
router.post('/create-business-accounts', createBusinessAuthAccounts);

export default router; 