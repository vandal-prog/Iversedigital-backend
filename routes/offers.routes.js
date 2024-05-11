import express from "express";
import {
  AcceptOrDeclineOffers,
  CreateOffer,
  GetAllMerchantOffers,
  getAllUsersOffers
} from "../controllers/offers_controller.js";
import { verifyUserToken } from "../middleware/jwt.js";

const router = express.Router();

router.post("/create_offer", verifyUserToken ,CreateOffer);
router.post("/react/:id", verifyUserToken ,AcceptOrDeclineOffers);
router.get("/merchant_offers", verifyUserToken ,GetAllMerchantOffers);
router.get("/users_offers", verifyUserToken ,getAllUsersOffers);

export default router;
