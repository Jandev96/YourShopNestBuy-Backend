import express from "express"

import { authUser } from "../middlewares/authUser.js"
import { createOrder, deleteOrder, getOrderById, getOrders, getUserOrders, updateOrderStatus } from "../controllers/orderController.js"
import { authAdmin } from "../middlewares/authAdmin.js"

const router = express.Router()


router.post('/',authUser,createOrder)
router.get('/',authAdmin, getOrders)
router.get('/userOrder',authUser,getUserOrders)
router.get('/:id',authUser,getOrderById)
router.put('/:id',authAdmin,updateOrderStatus)
router.delete('/:id',authAdmin,deleteOrder)



export default router