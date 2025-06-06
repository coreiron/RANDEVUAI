
import { Router } from 'express';
import { authenticateUser, optionalAuth } from '../middleware/auth';
import {
  getAllShops,
  getShopDetails,
  getShopsByCategory,
  getUserShops,
  getShopServices,
  getShopStaff
} from '../controllers/shopController';

const router = Router();

// Public routes
router.get('/', optionalAuth, getAllShops);
router.get('/:shopId', optionalAuth, getShopDetails);
router.get('/category/:category', optionalAuth, getShopsByCategory);
router.get('/:shopId/services', optionalAuth, getShopServices);
router.get('/:shopId/staff', optionalAuth, getShopStaff);

// Protected routes
router.get('/user/my-shops', authenticateUser, getUserShops);

export default router;
