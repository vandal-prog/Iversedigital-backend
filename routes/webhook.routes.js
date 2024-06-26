import express from "express";
import {
    UserOrderPayed
} from "../controllers/webhook_controller.js";

const router = express.Router();


router.post('/order_payment',UserOrderPayed)

export default router;