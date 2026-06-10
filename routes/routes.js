import { Router } from "express";
import {  getUser, logOut, signupUser, generateLink, resetPassword, updatePassword, updateProfile} from "../controller/userController.js";
import passport from "../lib/passport.js"
import { isAuthenticated, isAuthorized} from "../middleware/middleware.js";
import { createProduct, deleteProductById, fetchAllProducts, fetchProductById, getProductsByCategory, updateProduct } from "../controller/productController.js";
import { deleteReview, postReview } from "../controller/reviewController.js";
import { adminDashboard, deleteUser, getAllUsers, getUserById } from "../controller/adminController.js";
import { createOrder, getAllOrders, processPayment, sendRazorpayKey, verifyPayment } from "../controller/orderController.js";
import { cancelOrder, getCompletedOrders, getLiveOrderById, getLiveOrders, getOrderByID, refundOrder, updateStatus } from "../controller/adminOrderController.js";
import { getUserStats, updateUserRole } from "../controller/adminMetaController.js";
import { getStoreStatus, toggleISBT, toggleStore } from "../controller/storeController.js";


const router = Router();

router.post("/signup", signupUser);
router.post("/login", passport.authenticate("local", { failWithError: true }),getUser, (err, req,res, next) =>{
    return res.status(401).json({success : false, message: err?.message});
});
router.get("/secret", isAuthenticated, getUser)
router.get("/logout", logOut);
router.post("/password/reset", generateLink);
router.put("/password/reset/:token", resetPassword);
router.put("/updateprofile/password",isAuthenticated ,updatePassword);
router.put("/profile/update", isAuthenticated, updateProfile);
router.post("/product/create",isAuthenticated,isAuthorized, createProduct);
router.get("/product/getproducts", fetchAllProducts);
router.put("/product/admin/update/:id",isAuthenticated,isAuthorized, updateProduct);
router.get("/product/:id", fetchProductById);
router.get("/products/:category", getProductsByCategory);
router.delete("/product/admin/delete/:id", deleteProductById);
router.post("/review/:order/:product",postReview);
router.delete("/review/:order/:product", deleteReview);
router.get("/admin/users", getAllUsers);
router.get("/admin/users/:id", getUserById);
router.delete("/admin/users/delete/:id", deleteUser);
router.get("/admin/dashboard/stats", isAuthenticated, isAuthorized, adminDashboard);
router.post("/order/create", isAuthenticated, createOrder);
router.post('/payment/process', isAuthenticated, processPayment);
router.get("/payment/key", sendRazorpayKey);
router.post("/payment/verify", verifyPayment);
router.get("/orders", isAuthenticated, getAllOrders);
router.get("/admin/live-orders", isAuthenticated, isAuthorized, getLiveOrders);
router.get("/admin/live-orders/:id", isAuthenticated, isAuthorized, getLiveOrderById);
router.put("/admin/order/update/:id/:status", isAuthenticated, isAuthorized, updateStatus);
router.get("/admin/orders",isAuthenticated,getCompletedOrders);
router.get("/admin/order/:id", isAuthenticated, getOrderByID);
router.post("/order/cancel/:id", isAuthenticated, cancelOrder);
router.post("/admin/order/refund/:id", isAuthenticated, isAuthorized, refundOrder);
router.get("/admin/user/:id", isAuthenticated, isAuthorized, getUserStats);
router.put('/admin/user/update/:id', isAuthenticated, isAuthorized, updateUserRole);
router.get("/admin/store/status", getStoreStatus);
router.post("/admin/store/toggle/:status", toggleStore);
router.post('/admin/store/toggle/isbt/:status', toggleISBT);
export default router;