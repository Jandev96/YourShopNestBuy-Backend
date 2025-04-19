// controllers/orderController.js
import mongoose from "mongoose";
import Order from '../models/orderModel.js';
import Cart from '../models/cartModel.js';
import Product from '../models/productModel.js';
import User from '../models/userModel.js';
import { generateInvoicePDF } from '../utils/invoiceGenerator.js';
import { startSession } from 'mongoose';
import nodemailer from 'nodemailer';

// Create Order
export const createOrder = async (req, res) => {
  const session = await startSession();
  session.startTransaction();

  const originalStock = new Map();

  try {
    const customerId = req.user?.id;
    if (!customerId) {
      await session.abortTransaction();
      return res.status(401).json({ message: "User not authorized" });
    }

    const cart = await Cart.findOne({ user: customerId }).populate({
      path: 'products.productId',
      select: 'name price stock'
    });
    if (!cart || !cart.products || cart.products.length === 0) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Cart is empty or not found" });
    }

    cart.calculateTotalPrice();
    await cart.save({ session });

    for (let item of cart.products) {
      const product = item.productId;
      if (!product || product.stock < item.quantity) {
        await session.abortTransaction();
        return res.status(400).json({ message: `Product ${product.name} is out of stock` });
      }
      originalStock.set(product._id.toString(), product.stock);
      product.stock -= item.quantity;
      await product.save({ session });
    }

    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + Math.floor(Math.random() * 4) + 3);

    const discount = 0;
    const tax = cart.totalPrice * 0.1;
    const finalPrice = cart.totalPrice - discount + tax;

    const orderProducts = cart.products.map(item => ({
      _id: new mongoose.Types.ObjectId(), // generate unique _id
      productId: item.productId._id,
      name: item.productId.name,
      quantity: item.quantity,
      price: item.price
    }));

    

    const order = new Order({
      customerId,
      products: orderProducts,
      totalPrice: finalPrice,
      discount,
      tax,
      shippingAddress: req.body.shippingAddress,
      estimatedDelivery,
    });

    await order.save({ session });
    await Cart.deleteOne({ _id: cart._id }, { session });

    await session.commitTransaction();

    const populatedOrder = await Order.findById(order._id);

    const user = await User.findById(customerId);
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      secure:false,

      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const pdfBuffer = await generateInvoicePDF({ ...populatedOrder.toObject(), products: orderProducts }, user);

    const mailOptions = {
      from: `"NestBuy" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Order Confirmation",
      html: `
        <h2>Thank you for your order, ${user.username}!</h2>
        <p>Your order has been placed successfully. Estimated Delivery: ${order.estimatedDelivery.toDateString()}</p>
        <p>We'll notify you when it ships.</p>
      `,
      attachments: [
        {
          filename: `Invoice-${order._id}.pdf`,
          content: pdfBuffer,
          contentType: "application/pdf"
        }
      ]
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({ message: "Order placed successfully", order: populatedOrder });
  } catch (error) {
    try {
      await session.abortTransaction();
    } catch (abortErr) {
      console.error("Abort Transaction Error:", abortErr.message);
    }

    for (let [productId, stock] of originalStock) {
      await Product.findByIdAndUpdate(productId, { stock });
    }

    console.error("Order Error:", error);
    res.status(500).json({ message: "Error placing order", error: error.message });
  } finally {
    session.endSession();
  }
};



// Update Order Status
export const updateOrderStatus = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid order ID" });
    }

    const updates = {
      status: req.body.status,
      $push: { statusHistory: { status: req.body.status } },
    };

    if (req.body.status === "Shipped" && req.body.trackingNumber) {
      updates.trackingNumber = req.body.trackingNumber;
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    )
      .populate("products.productId", "name price images")
      .populate("customerId", "email username")
      .select("status estimatedDelivery customerId trackingNumber");

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    const transporter = nodemailer.createTransport({
      service: "Gmail",
      secure:false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"NestBuy" <${process.env.EMAIL_USER}>`,
      to: updatedOrder.customerId.email,
      subject: `Order Status Updated - ${updatedOrder.status}`,
      html: `
        <h2>Hi ${updatedOrder.customerId.username},</h2>
        <p>Your order status has been  <strong>${updatedOrder.status}</strong>.</p>
        <p>Estimated Delivery: ${new Date(updatedOrder.estimatedDelivery).toDateString()}</p>
        ${updatedOrder.trackingNumber ? `<p>Tracking Number: <strong>${updatedOrder.trackingNumber}</strong></p>` : ""}
      `,
    };

    await transporter.sendMail(mailOptions);

    res.json(updatedOrder);
  } catch (error) {
    res.status(400).json({ message: "Error updating order status", error: error.message });
  }
};

// Get All Orders (Admin only)
export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("products.productId", "name price images")
      .populate("customerId", "username email")
      .select("customerId orderDate status estimatedDelivery products totalPrice");

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Error fetching orders", error: error.message });
  }
};

// Get User Orders
export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customerId: req.user.id })
      .populate("products.productId", "name price images")
      .select("orderDate status estimatedDelivery products totalPrice");

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Error fetching orders", error: error.message });
  }
};

// Get Order by ID
;

export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Order ID is missing in the request." });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid order ID" });
    }

    const order = await Order.findById(id)
      .populate("products.productId", "name price images")
      // .populate()

      // .populate({
      //   path: "customerId",
        
      // });
      console.log("order populated is ",order.products)
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json(order);
  } catch (error) {
    console.error("Error fetching order by ID:", error);
    res.status(500).json({ message: "Error fetching order", error: error.message });
  }
};


// Delete Order (Admin only)
export const deleteOrder = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid order ID" });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    for (let item of order.products) {
      const product = await Product.findById(item.productId);
      if (product) {
        product.stock += item.quantity;
        await product.save();
      }
    }

    await order.deleteOne();
    res.json({ message: "Order deleted and stock restored" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting order", error: error.message });
  }
};
