import { Router } from "express";
import { getOverview, getProduct, profile, login, cart } from './../controllers/viewController.js';
// import authController from './../controllers/authController.js';
const router = Router();

router.route('/').get(getOverview)
router.route('/product/:slug').get(getProduct)
router.route('/profile').get(profile)
router.route('/login').get(login)
router.route('/cart').get(cart)


export default router;