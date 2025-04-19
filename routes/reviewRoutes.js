import express from "express"
import { addReview, deleteReview, getReviews,updateReview } from "../controllers/reviewController.js";
import { authUser } from "../middlewares/authUser.js";


import { authAdmin } from "../middlewares/authAdmin.js";



const router = express.Router()


router.post("/",authUser, addReview );
router.get("/:productId",authUser, getReviews);
router.delete("/:reviewId",authUser, deleteReview );
router.delete("/:reviewId",authAdmin, deleteReview );
router.put("/update/:reviewId", authUser, updateReview);


export default router