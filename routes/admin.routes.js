import express from "express";
import {
    approveOrdeclineProduct,
    getAllusers,
    getUserdetails,
    getAllstores,
    approveOrdeclineStore,
    getStorebyId,
    approveDeclineRider,
    getRiderdetails
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

export default router;
 