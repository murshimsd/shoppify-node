import { Router } from "express";
import { getAllProducts, addProduct, getProduct, updateProduct, removeProduct ,uploadProductImages,resizeProductImages} from "./../controllers/productController.js";
import { protect, restrictTo } from './../controllers/authController.js';
import { addCart } from './../controllers/cartController.js';
const router = Router();

router.route("/")
.get(getAllProducts)

router.use(protect)
router.route('/:proid/cart')
.post(addCart)


router.route("/")
.post(restrictTo('seller','admin'),addProduct)


router.route("/:id")
.get(getProduct)
.patch(restrictTo('seller'),uploadProductImages,resizeProductImages,updateProduct)
.delete(restrictTo('admin','seller'),removeProduct)

export default router;

