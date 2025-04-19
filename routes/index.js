import express from "express"

import userRouter from './userRoutes.js'
import wishlistRouter from './wishlistRoutes.js'
import reviewRouter from './reviewRoutes.js'
import productRouter from './productRoutes.js'
import cartRouter from './cartRoutes.js'
import adminRouter from './adminRoutes.js'
import paymentRouter from './paymentRoutes.js'
import orderRouter from './orderRoutes.js'

const router= express.Router()

router.use('/admin',adminRouter)
router.use('/user',userRouter)
router.use('/wishlist',wishlistRouter)
router.use('/review',reviewRouter)
router.use('/product',productRouter)
router.use('/cart',cartRouter)
router.use('/payment',paymentRouter)
router.use('/order',orderRouter)


export default router