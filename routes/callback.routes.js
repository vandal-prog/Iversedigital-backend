import express from "express";
import {
CreateCallback,
GetAllMerchantCallbacks,
GetAllUsersCallbacks,
UpdateCallback
} from "../controllers/callback_controller.js";
import { verifyUserToken, verifyMarchantToken } from "../middleware/jwt.js";

const router = express.Router();

router.post("/create_callback", verifyUserToken ,CreateCallback);
router.get("/user_callback", verifyUserToken ,GetAllUsersCallbacks);
router.get("/merchant_callback", verifyMarchantToken ,GetAllMerchantCallbacks);
router.put("/merchant_callback/update/:id", verifyMarchantToken ,UpdateCallback);

export default router;
