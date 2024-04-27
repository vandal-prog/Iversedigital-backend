import express from 'express';
import { createProduct, editProduct } from '../controllers/product_contoller.js';
import { verifyUserToken } from '../middleware/jwt.js';

const router = express.Router();

router.post('/create_product', verifyUserToken ,createProduct);
router.put('/edit_product/:id', verifyUserToken ,editProduct);

export default router