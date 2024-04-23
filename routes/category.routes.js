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

router.post("/create_category", verifyAdminToken, createCategory);
router.post("/create_sub_category", verifyAdminToken, createsubCategory);
router.delete("/delete_category/:id", verifyAdminToken, deleteCategory);
router.delete("/delete_sub_category/:id", verifyAdminToken, deletesubCategory);
router.put("/edit_category/:id", verifyAdminToken, editCategory);
router.put("/edit_sub_category/:id", verifyAdminToken, editsubCategory);
router.get("/", getAllcategory);
router.get("/:id", getCategory);
router.get("/sub_category/:id", getsubCategory);


export default router;
