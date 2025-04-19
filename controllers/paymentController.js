// const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
// const User = require("../models/User");
// const Payment = require("../models/Payment");

import Stripe from "stripe";


import Payment from "../models/paymentModel.js";
import User from "../models/userModel.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
// Create or Retrieve Stripe Customer
export const createCustomer = async (req, res,next) => {
  try {

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.stripeCustomerId) {
      return res.json({ message: "Customer already exists", customerId: user.stripeCustomerId });
    }
    
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name,
    });

    user.stripeCustomerId = customer.id;
    await user.save();

    res.json({ message: "Stripe customer created", customerId: customer.id });
  } catch (error) {
    res.status(500).json({ message: "Error creating Stripe customer", error: error.message });
  }
};

// Create a Payment Intent (and store it)
export const createPaymentIntent = async (req, res) => {
  try {
    const { amount, currency = "usd", saveCard, paymentMethodId } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ message: "Invalid amount" });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    let customer = user.stripeCustomerId;
    if (saveCard && !customer) {
      const newCustomer = await stripe.customers.create({ email: user.email, name: user.name });
      user.stripeCustomerId = newCustomer.id;
      await user.save();
      customer = newCustomer.id;
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100,
      currency,
      customer,
      payment_method: paymentMethodId || undefined,
      setup_future_usage: saveCard ? "on_session" : undefined,
      automatic_payment_methods: { enabled: true },
    });

    await Payment.create({
      userId: req.user.id,
      stripeCustomerId: customer || null,
      stripePaymentIntentId: paymentIntent.id,
      amount,
      currency,
      status: paymentIntent.status,
      receiptUrl: paymentIntent.charges?.data?.[0]?.receipt_url || "",
      paymentMethod: paymentMethodId || "automatic",
    });

    res.json({
      message: "Payment Intent created",
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    res.status(500).json({ message: "Payment failed", error: error.message });
  }
};

// Retrieve Saved Payment Methods
export const getSavedPaymentMethods = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.stripeCustomerId) {
      return res.json({ message: "No saved payment methods" });
    }

    const paymentMethods = await stripe.paymentMethods.list({
      customer: user.stripeCustomerId,
      type: "card",
    });

    res.json({
      message: "Retrieved saved payment methods",
      methods: paymentMethods.data,
    });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving payment methods", error: error.message });
  }
};

// NEW: Retrieve User's Payment Records
export const getPaymentRecords = async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.user.id }).sort({ createdAt: -1 });

    if (!payments.length) {
      return res.status(404).json({ message: "No payment records found" });
    }

    res.json({
      message: "Payment records retrieved",
      records: payments,
    });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving payment records", error: error.message });
  }
};