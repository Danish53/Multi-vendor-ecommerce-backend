import express from "express";
import { adminLogin, createCategory, deleteCategory, getAdminProfile, getAllCategories, updateAdminProfile, updateCategory, updateVendorStatus } from "../controller/admin.controller.js";
import { isAuthenticated, isAuthorized } from "../middleware/Auth.js";
import { upload } from "../middleware/multer.js";


const router = express.Router();

// admin 
router.post("/admin-login", adminLogin);
router.get("/profile", isAuthenticated, isAuthorized("admin"), getAdminProfile);
router.post(
  "/update-profile",
  isAuthenticated,
  isAuthorized("admin"),
  upload.single("profileAvatar"),
  updateAdminProfile
);
// accept/reject
router.post("/vendor-status", isAuthenticated, updateVendorStatus);
// category/subcategory
router.post("/create-category", upload.single("category_image"), createCategory);
router.get("/all-categories", getAllCategories);
router.put("/update-category/:id", upload.single("category_image"), updateCategory);
router.delete("/delete-category/:id", deleteCategory);


export default router;