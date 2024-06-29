import express from "express";
import {
    approveOrdeclineProduct,
    getAllusers,
    getUserdetails,
    getAllstores,
    approveOrdeclineStore,
    getStorebyId
} from "../controllers/admin_controller.js";
import { verifyAdminToken } from "../middleware/jwt.js";

const router = express.Router();

router.put("/verify_product/:id", verifyAdminToken,approveOrdeclineProduct);
router.get("/all_users", verifyAdminToken,getAllusers);
router.get("/user_detail/:id", verifyAdminToken,getUserdetails);
router.get("/all_stores", verifyAdminToken,getAllstores);
router.get("/verify_store/:id", verifyAdminToken,approveOrdeclineStore);
router.get("/get_store/:id", verifyAdminToken,getStorebyId);

export default router;
