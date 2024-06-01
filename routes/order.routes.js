import express from 'express';
import { getUserorders, createOrder, trackOrder } from '../controllers/order_contoller.js';
import { verifyUserToken } from '../middleware/jwt.js';

const router = express.Router();

router.get('/create', verifyUserToken ,createOrder);
router.get('/my_orders', verifyUserToken ,getUserorders);
router.get('/track_order' ,trackOrder);

export default router