import { Router } from "express";
import { createCategory, categories, removeCategory, getProductsByCategory } from "./../controllers/categoryControllers.js";
const router = Router();
import { protect, restrictTo } from './../controllers/authController.js';


router.use(protect)
router.route("/")
.post(restrictTo('seller','admin'),createCategory)
.get(restrictTo('seller','admin'),categories)



router.route("/:id")
.delete(restrictTo('admin'),removeCategory)
router.route("/:cid")
.get(getProductsByCategory)


export default router;