import express from "express"
import { authUser } from "../middlewares/authUser.js"
import { authAdmin } from "../middlewares/authAdmin.js"
import { createProduct, deleteProduct, getAllProducts, getOneProduct, updateProduct } from "../controllers/productController.js"
import { upload } from "../middlewares/multer.js"

const router = express.Router()

// // Get all products
// GET /api/products
router.get("/products",getAllProducts)




// // Get a single product by ID
// GET /api/products/:id
router.get("/products/:productId",getOneProduct)




// // Create a new product (Admin only)
// POST /api/products
router.post('/products',authAdmin,upload.single("images"), createProduct)


// // Update a product (Admin only)
// PUT /api/products/:id
router.put('/:productId',authAdmin,updateProduct)

// // Delete a product (Admin only)
// DELETE /api/products/:id
router.delete('/:productId',authAdmin,deleteProduct)

export default router
