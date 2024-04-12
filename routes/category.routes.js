import express from "express";
import {
  createCategory,
  createsubCategory,
  deleteCategory,
  deletesubCategory,
  editCategory,
  editsubCategory,
  getAllcategory,
  getCategory,
  getsubCategory,
} from "../controllers/product_category_contoller.js";
import { verifyAdminToken } from "../middleware/jwt.js";

const router = express.Router();

router.get("/create_category", verifyAdminToken, createCategory);
router.get("/create_sub_category", verifyAdminToken, createsubCategory);
router.get("/delete_category/:id", verifyAdminToken, deleteCategory);
router.get("/delete_sub_category/:id", verifyAdminToken, deletesubCategory);
router.get("/edit_category/:id", verifyAdminToken, editCategory);
router.get("/edit_sub_category/:id", verifyAdminToken, editsubCategory);
router.get("/category", getAllcategory);
router.get("/category/:id", getCategory);
router.get("/sub_category/:id", getsubCategory);


export default router;
