import express from "express";
import {
  getUserTransactions,
  getallUserbankaccount,
  saveUserbank,
  withdrawalRequest,
  acceptwithdrawalRequest,
  declinewithdrawalRequest
} from "../controllers/transactions_controller.js"; 
import { verifyUserToken, verifyAdminToken } from "../middleware/jwt.js";

const router = express.Router();

router.get("/", verifyUserToken, getUserTransactions);
router.get("/bank_account", verifyUserToken, getallUserbankaccount);
router.post("/save_bank_account", verifyUserToken, saveUserbank);
router.post("/withdraw", verifyUserToken, withdrawalRequest);
router.post("/accept_withdraw/:id", verifyAdminToken, acceptwithdrawalRequest);
router.post("/decline_withdraw/:id", verifyAdminToken, declinewithdrawalRequest);


export default router;
