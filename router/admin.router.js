import express from "express";
import { adminLogin, allUsers, allVendors, approvePlanRequest, createCategory, createPlan, deleteCategory, deletePlan, getAdminProfile, getAllCategories, getAllPlans, getPlanRequests, getSingleVendorProducts, toggleSoftDeleteUser, updateAdminProfile, updateCategory, updateOrderStatusadmin, updateProductFeature, updateProductPopularity, updateVendorStatus } from "../controller/admin.controller.js";
import { isAuthenticated, isAuthorized } from "../middleware/Auth.js";
import { upload } from "../middleware/multer.js";
import { getVendorOrders } from "../controller/user.controller.js";


const router = express.Router();

// admin 
router.post("/admin-login", adminLogin);
router.get("/profile", isAuthenticated, getAdminProfile);
router.post(
  "/update-profile",
  isAuthenticated,
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
// popularity
router.post("/update-popularity", updateProductPopularity);
// Featured
router.post("/update-featured", updateProductFeature);
// all users/vendors
router.get("/all-users", allUsers);
router.get("/all-vendors", allVendors);
router.delete("/soft-toggle-delete/:id", toggleSoftDeleteUser);
// single vendor products
router.get("/single-vendor-products/:vendor_id", getSingleVendorProducts);

// vendor orders
router.get("/vendor-orders-list/:id", getVendorOrders);
router.post("/order-status/:orderId/:userId", updateOrderStatusadmin);

// plans
router.post("/plan/create", createPlan);
router.get("/plan/all", getAllPlans);
router.delete("/plan/delete/:id", deletePlan);

router.get("/plan/requests", getPlanRequests);
router.get("/plan/requests/:id", approvePlanRequest);



export default router;