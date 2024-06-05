import express from "express";
import {
  createRiderdetails
} from "../controllers/riders_controller.js"; 
import { verifyRiderToken } from "../middleware/jwt.js";

const router = express.Router();

router.post("/create_details", verifyRiderToken, createRiderdetails);


export default router;
