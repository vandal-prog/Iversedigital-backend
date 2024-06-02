import express from 'express';
import { createUser, userLogin, createAdmin, loginAdmin, refreshToken , createRider, loginRider} from '../controllers/auth_contoller.js';

const router = express.Router();

router.post('/user_sign_up', createUser);
router.post('/user_sign_in', userLogin);
router.post('/refresh_token', refreshToken);
router.post('/admin_sign_up', createAdmin);
router.post('/admin_sign_in', loginAdmin);
router.post('/rider_sign_up', createRider);
router.post('/rider_sign_in', loginRider);

export default router