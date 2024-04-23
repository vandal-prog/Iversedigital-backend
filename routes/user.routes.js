import express from 'express';
import { getUserdetails, editUserdetails, resetUserpassword, becomeMarchant, toggleStoreOpen_Close, getUserstore, edituserStore } from '../controllers/user_contoller.js';
import { verifyUserToken } from '../middleware/jwt.js';

const router = express.Router();

router.get('/', verifyUserToken ,getUserdetails);
router.put('/update', verifyUserToken ,editUserdetails);
router.post('/become_marchant', verifyUserToken ,becomeMarchant);
router.put('/reset_password', verifyUserToken ,resetUserpassword);
router.put('/toggle_store', verifyUserToken ,toggleStoreOpen_Close);
router.get('/user_store', verifyUserToken ,getUserstore);
router.put('/edit_user_store', verifyUserToken ,edituserStore);

export default router