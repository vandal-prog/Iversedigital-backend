import express from "express";
import {
  createProduct,
  editProduct,
  getAllproduct,
  getProductbyId,
  ReactTOproduct,
  AlluserLikedProduct,
  getProductLikes,
  GetProductReview,
  ReviewProduct,
  getProductbystore
} from "../controllers/product_contoller.js";
import { verifyUserToken } from "../middleware/jwt.js";

const router = express.Router();

router.get("/", getAllproduct);
router.get("/:id", getProductbyId);
router.get("/liked/products/", verifyUserToken ,AlluserLikedProduct);
router.post("/create_product", verifyUserToken, createProduct);
router.put("/edit_product/:id", verifyUserToken, editProduct);
router.put("/react/:id", verifyUserToken, ReactTOproduct);
router.get("/users_react/:id", verifyUserToken, getProductLikes);
router.post("/review/:id", verifyUserToken, ReviewProduct);
router.get("/product_review/:id", GetProductReview);
router.get("/store_product/:id", getProductbystore);

export default router;
