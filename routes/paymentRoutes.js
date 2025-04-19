import e from "express";
import { authUser } from "../middlewares/authUser.js";
import Stripe from "stripe";

const client_domain = process.env.CLIENT_DOMAIN;
const stripe = new Stripe(process.env.Stripe_Private_Api_Key);
const router = e.Router();

// Create Checkout Session
router.post("/create-checkout-session", authUser, async (req, res) => {
  try {
    const { products } = req.body;
    // console.log("Received products:", products);

    const lineItems = products.map((product) => {
      const image =
        typeof product.productId.images === "string"
          ? product.productId.images
          : product.productId.images?.[0] || "";

      const unitPrice =
        product.productId.originalPrice ||
        product.price ||
        product.productId.price;

      return {
        price_data: {
          currency: "inr",
          product_data: {
            name: product.productId.name,
            images: [image],
          },
          unit_amount: Math.round(unitPrice * 100),
        },
        quantity: product.quantity,
      };
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${client_domain}/user/payment/success`,
      cancel_url: `${client_domain}/user/payment/cancel`,
    });

    console.log("Stripe Session Created:", session.id);
    res.json({ success: true, sessionId: session.id });
  } catch (error) {
    console.error("Stripe Checkout Error:", error);
    res
      .status(error.statusCode || 500)
      .json({ success: false, message: "Stripe error", error: error.message });
  }
});

// Check Payment Status
router.get("/session-status", async (req, res) => {
  try {
    const sessionId = req.query.session_id;
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    res.send({
      data: session,
      status: session?.status,
      customer_email: session?.customer_details?.email,
      session_data: session,
    });
  } catch (error) {
    res
      .status(error?.statusCode || 500)
      .json({ error: error.message || "Internal Server Error" });
  }
});

export default router;
