import express from "express";
import {
  SellerMetric,
  AdminMetrics
} from "../controllers/metrics_controller.js"; 
import { verifyUserToken, verifyAdminToken } from "../middleware/jwt.js";

const router = express.Router();

router.get("/merchant", verifyUserToken, SellerMetric);
router.get("/admin", verifyAdminToken, AdminMetrics);


export default router;
