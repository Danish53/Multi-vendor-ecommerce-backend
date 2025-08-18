import express from "express";
import { getAllProductsFilters, getProfile, login, register, updateProfile } from "../controller/user.controller.js";
import { upload } from "../middleware/multer.js";
import { isAuthenticated } from "../middleware/Auth.js";
import { getAllCategories } from "../controller/admin.controller.js";


const router = express.Router();
// Auth user/vendor
router.post("/register", upload.single("business_license"), register);
router.post("/login", login);
router.post("/update-profile", isAuthenticated, upload.fields([
    { name: "profileAvatar", maxCount: 1 },
    { name: "shop_logo", maxCount: 1 },
    // { name: "business_license", maxCount: 1 },
]), updateProfile);
router.get("/profile", isAuthenticated, getProfile);

// all Categories
router.get("/all-categories", getAllCategories);

// filter products
router.get("/products", getAllProductsFilters);



export default router;