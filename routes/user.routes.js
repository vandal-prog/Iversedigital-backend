import express from 'express';
import { getUserdetails, editUserdetails, resetUserpassword } from '../controllers/user_contoller.js';
import { verifyUserToken } from '../middleware/jwt.js';

const router = express.Router();

router.get('/', verifyUserToken ,getUserdetails);
router.put('/update', verifyUserToken ,editUserdetails);
router.put('/reset_password', verifyUserToken ,resetUserpassword);

export default router