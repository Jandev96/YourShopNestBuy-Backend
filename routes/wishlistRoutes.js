import express from "express"
import { authUser } from "../middlewares/authUser.js"
import { addToWishlist, getWishlist, removeFromWishlist } from "../controllers/wishlistController.js"
const router = express.Router()

// // Add a product to the wishlist
// POST /api/wishlist

router.post('/:productId',authUser,addToWishlist)

// // Remove a product from the wishlist
// DELETE /api/wishlist/:productId
router.delete('/:productId',authUser,removeFromWishlist)
// // Get the user’s wishlist
// GET /api/wishlist
router.get('/',authUser,getWishlist)



export default router