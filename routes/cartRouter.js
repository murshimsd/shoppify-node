import { Router } from "express";
import { addCart,checkout, getCartItems, placeOrder,getSellerOrderHistory } from './../controllers/cartController.js';
import { protect , restrictTo } from './../controllers/authController.js';
const router = Router();


router.use(protect)
router.route("/:proid")
.post(addCart)

router.route("/")
.get(getCartItems)

router.route("/checkout")
.get(checkout)

router.route("/place-order")
.get(placeOrder)

router.route("/seller-history")
.get(restrictTo('seller'),getSellerOrderHistory)



export default router;