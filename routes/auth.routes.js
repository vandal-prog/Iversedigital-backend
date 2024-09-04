import express from "express";
import {
  createUser,
  userLogin,
  createAdmin,
  loginAdmin,
  refreshToken,
  createRider,
  loginRider,
  submitEmail,
  VerifyOtp,
  ResetPassword
} from "../controllers/auth_contoller.js";

const router = express.Router();

router.post("/user_sign_up", createUser);
router.post("/user_sign_in", userLogin);
router.post("/refresh_token", refreshToken);
router.post("/admin_sign_up", createAdmin);
router.post("/admin_sign_in", loginAdmin);
router.post("/rider_sign_up", createRider);
router.post("/rider_sign_in", loginRider);
router.post("/submitEmail", submitEmail);
router.post("/VerifyOtp", VerifyOtp);
router.post("/ResetPassword", ResetPassword);

export default router;
