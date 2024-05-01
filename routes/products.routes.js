import express from "express";
import {
  createProduct,
  editProduct,
  getAllproduct,
  getProductbyId
} from "../controllers/product_contoller.js";
import { verifyUserToken } from "../middleware/jwt.js";

const router = express.Router();

router.get("/", getAllproduct);
router.get("/:id", getProductbyId);
router.post("/create_product", verifyUserToken, createProduct);
router.put("/edit_product/:id", verifyUserToken, editProduct);

export default router;
