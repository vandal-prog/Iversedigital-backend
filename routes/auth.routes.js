import express from 'express';
import { createUser, userLogin, createAdmin, loginAdmin, refreshToken } from '../controllers/auth_contoller.js';

const router = express.Router();

router.post('/user_sign_up',createUser);
router.post('/user_sign_in',userLogin);
router.post('/refresh_token',refreshToken);
router.post('/admin_sign_up',createAdmin);
router.post('/admin_sign_in',loginAdmin);

export default router