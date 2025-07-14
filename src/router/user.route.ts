import { Router } from "express";
import { 
    registerUser, 
    logInUser, 
    logOutUser, 
    activeUsersByMonth, 
    getUserProfile, 
    companyProfit, 
    totalUsers, 
    totalSocialMediaUsers, 
    forgotPassword, 
    resetPassword 
} from "../controller/user.controller";
import { upload } from "../middleware/multer.middleware";
import { verifyJWT } from "../middleware/auth.middleware";

const router= Router()

router.route("/register").post(
    upload.fields([
        { name: "avatar", maxCount: 1 }
    ]), registerUser
    
)

router.route("/login").post(logInUser) 
router.route("/logout").post(verifyJWT,logOutUser) //question
router.route("/active-users").post(verifyJWT, activeUsersByMonth)
router.route("/profile").get(verifyJWT, getUserProfile)
router.route("/company-profit").get(verifyJWT, companyProfit)
router.route("/total-users").get(verifyJWT, totalUsers)
router.route("/total-social-media-users").get(verifyJWT, totalSocialMediaUsers)
router.route("/forgot-password").post(forgotPassword)
router.route("/reset-password").post(resetPassword)

export default router;