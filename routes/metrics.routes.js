import express from "express";
import {
  SellerMetric
} from "../controllers/metrics_controller.js"; 
import { verifyUserToken, verifyAdminToken } from "../middleware/jwt.js";

const router = express.Router();

router.get("/merchant", verifyUserToken, SellerMetric);


export default router;
