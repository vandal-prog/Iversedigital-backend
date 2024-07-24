import express from "express";
import {
    approveOrdeclineProduct,
    getAllusers,
    getUserdetails,
    getAllstores,
    approveOrdeclineStore,
    getStorebyId,
    approveDeclineRider,
    getRiderdetails,
    checkAllwithdrawalRequest,
    acceptDeclineWithdrawalRequest,
    matchingRider,
    createDeliveryRoute,
    getAlldeliveryRoutes,
    updateDeliveryRoute
} from "../controllers/admin_controller.js";
import { verifyAdminToken } from "../middleware/jwt.js";

const router = express.Router();

router.put("/verify_product/:id", verifyAdminToken,approveOrdeclineProduct);
router.get("/all_users", verifyAdminToken,getAllusers);
router.get("/user_detail/:id", verifyAdminToken,getUserdetails);
router.get("/all_stores", verifyAdminToken,getAllstores);
router.put("/verify_store/:id", verifyAdminToken,approveOrdeclineStore);
router.get("/get_store/:id", verifyAdminToken,getStorebyId);
router.put("/verify_rider/:id", verifyAdminToken,approveDeclineRider);
router.get("/get_rider/:id", verifyAdminToken,getRiderdetails);
router.get("/get_withdrawal_request", verifyAdminToken,checkAllwithdrawalRequest);
router.put("/update_withdrawal_request/:id", verifyAdminToken,acceptDeclineWithdrawalRequest);
router.put("/match_rider", verifyAdminToken,matchingRider);
router.post("/createte_delivery_route", verifyAdminToken,createDeliveryRoute);
router.get("/get_delivery_routes", verifyAdminToken,getAlldeliveryRoutes);
router.put("/update_delivery_route/:id", verifyAdminToken,updateDeliveryRoute);

export default router;
 