import express from "express";
import { upload } from "../middleware/multer.js";
import { addProduct, deleteVendorProduct, getSingleProduct, getVendorProducts, updateProduct } from "../controller/vendor.controller.js";
import { isAuthenticated } from "../middleware/Auth.js";


const router = express.Router();

// vendor dashboard
router.post("/add-product", isAuthenticated, upload.fields([
    { name: "product_image", maxCount: 1 },
    { name: "gallery_images", maxCount: 5 }
]), addProduct);
router.put("/update-product/:productId", isAuthenticated, upload.fields([
    { name: "product_image", maxCount: 1 },
    { name: "gallery_images", maxCount: 5 }
]), updateProduct);
router.get("/vendor-products", isAuthenticated, getVendorProducts);
router.get("/single-product-detail/:productId", isAuthenticated, getSingleProduct);
router.delete("/delete-products/:productId", isAuthenticated, deleteVendorProduct);

export default router;