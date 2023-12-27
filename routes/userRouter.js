import { Router } from "express";
import { updateMe, deleteMe, addUser, getAllUser, getUser, removeUser,  updateUserPhoto,resizeUserPhoto } from "./../controllers/userControllers.js";
import { singnUp, login, protect, forgotPassword, resetPasswod, updatePassword, restrictTo } from "./../controllers/authController.js";

// import cartController from "./../controllers/cartController.js";
const router = Router();


router.route("/signup").post(singnUp);
router.route("/login").post(login);

router.use(protect);
router.route("/forgotPassword").post(forgotPassword);
router.route("/resetPassword/:token").patch(resetPasswod);
router.route("/updateMyPassword").patch(updatePassword);
router.route("/updateMe").patch(updateUserPhoto,resizeUserPhoto,updateMe);
router.route("/deleteMe").delete(deleteMe);

router
  .route("/")
  .post(addUser)
  .get(restrictTo("admin"), getAllUser);

router
  .route("/:id")
  .get(restrictTo("admin"),getUser)
  .delete(restrictTo("admin"),removeUser);

export default router;
