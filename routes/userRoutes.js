import express from "express";
const router = express.Router();
import UserController from "../controller/userController.js";
import userAuth from "../middlewares/userAuth.js";

//public routes
router.post("/changepassword",userAuth);
router.get("/loggeduser", userAuth);
router.post("/resetpassword/:id/:token", UserController.userPasswordReset);
router.post("/register", UserController.userRegistration);
router.post("/login",UserController.userLogin);
router.post("/sendpasswordresetemail", UserController.sendUserPasswordResetEmail);


//protected routes
router.post("/changepassword" ,UserController.changePassword);
router.get("/loggeduser", UserController.loggedUser);

export default router