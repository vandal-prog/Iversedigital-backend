import express from "express";
import {
CreateCallback,
GetAllMerchantCallbacks,
GetAllUsersCallbacks
} from "../controllers/callback_controller.js";
import { verifyUserToken } from "../middleware/jwt.js";

const router = express.Router();

router.post("/create_callback", verifyUserToken ,CreateCallback);
router.get("/user_callback", verifyUserToken ,GetAllUsersCallbacks);
router.get("/merchant_callback", verifyUserToken ,GetAllMerchantCallbacks);

export default router;
