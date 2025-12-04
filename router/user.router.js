import express from "express";
import { createAd, getAds, getAllChats, getAllProductsFilters, getFeaturedProducts, getMessages, getPopularProducts, getProductDetail, getProfile, getUserOrderDetail, getUserOrders, getVendorPlans, login, register, requestPlan, sendMessage, submitContact, updateOrderStatus, updateProfile } from "../controller/user.controller.js";
import { upload } from "../middleware/multer.js";
import { isAuthenticated } from "../middleware/Auth.js";
import { getAllCategories } from "../controller/admin.controller.js";
import { checkout } from "../controller/checkout.controller.js";


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
router.get("/product-detail/:productId", getProductDetail);
// popular products
router.get("/popular-products", getPopularProducts);
// featured products
router.get("/featured-products", getFeaturedProducts);
// checkout
router.post("/checkout", checkout);
// orders
router.get("/user-orders-list", isAuthenticated, getUserOrders);
router.get("/user-orders-detail/:orderId", isAuthenticated, getUserOrderDetail);
router.post("/order-status/:orderId", isAuthenticated, updateOrderStatus);
// contact us
router.post("/contact", submitContact);

// messages
router.post("/send", sendMessage);
router.get("/chat/:user1/:user2", getMessages);
router.get("/chats", isAuthenticated, getAllChats);

// plan
router.post("/plan/request", upload.single("receipt"), requestPlan);
router.get("/request/by-vendor/:vendor_id", getVendorPlans);

router.post("/create-ads", createAd);
router.get("/ads", getAds)


export default router;