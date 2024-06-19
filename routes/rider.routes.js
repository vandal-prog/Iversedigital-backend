import express from "express";
import {
  createRiderdetails,
  editRiderdetails,
  getAllavailableOrders,
  acceptOrder,
  getActiveOrders,
  updatedOrderproductStatus,
  finalDelivery,
  getAllDelivered
} from "../controllers/riders_controller.js"; 
import { verifyRiderToken } from "../middleware/jwt.js";

const router = express.Router();

router.post("/create_details", verifyRiderToken, createRiderdetails);
router.put("/edit_details", verifyRiderToken, editRiderdetails);
router.get("/available_orders", verifyRiderToken, getAllavailableOrders);
router.post("/accept_order/:id", verifyRiderToken, acceptOrder )
router.get("/active_order", verifyRiderToken, getActiveOrders )
router.put("/update_order/:id", verifyRiderToken, updatedOrderproductStatus )
router.put("/final_delivery_update/:id", verifyRiderToken, finalDelivery )
router.get("/delivered_orders/", verifyRiderToken, getAllDelivered )


export default router;
