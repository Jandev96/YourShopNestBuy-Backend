import Product from "../models/productModel.js";
import Review from "../models/reviewModel.js";
import { cloudinaryInstance } from "../config/cloudinary.js";

// Get all products
export const getAllProducts = async (req, res, next) => {
  try {
    const productList = await Product.find();
    res.json({ data: productList, message: 'List of Products' });
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message || "Internal server error" });
  }
};

// Get one product
export const getOneProduct = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const displaySingleProduct = await Product.findById(productId);
    const productReview = await Review.findById(productId);

    res.json({ data: { displaySingleProduct, productReview }, message: "user authorized" });
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message || "Internal server error" });
  }
};

// Create a product
export const createProduct = async (req, res, next) => {
  try {
    const { name, description, price, category, stock } = req.body;
    const adminId = req.admin.id;

    console.log(req.file, " requested file is present");

    // Upload to Cloudinary using secure URL (HTTPS)
    const cloudinaryRes = await cloudinaryInstance.uploader.upload(req.file.path, {
      secure: true,
    });

    const newProduct = new Product({
      name,
      description,
      price,
      category,
      stock,
      images: cloudinaryRes.secure_url,
      admin: adminId,
    });

    await newProduct.save();

    res.json({ data: newProduct, message: "user authorized" });
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message || "Internal server error" });
  }
};

// Update a product
export const updateProduct = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { name, description, price, category, stock } = req.body;
    const adminId = req.admin.id;

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Update fields if provided
    if (name) product.name = name;
    if (description) product.description = description;
    if (price) product.price = price;
    if (category) product.category = category;
    if (stock) product.stock = stock;

    // Upload new image if provided
    if (req.file) {
      const cloudinaryRes = await cloudinaryInstance.uploader.upload(req.file.path, {
        secure: true,
      });
      product.images = cloudinaryRes.secure_url;
    }

    await product.save();

    res.status(200).json({ data: product, message: "Product updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};

// Delete a product
export const deleteProduct = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const adminId = req.admin.id;

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Delete product
    await Product.findByIdAndDelete(productId);

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};
