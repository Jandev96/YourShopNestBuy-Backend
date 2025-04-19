import Wishlist from '../models/wishlistModel.js';
import { authUser } from '../middlewares/authUser.js';

export const addToWishlist = async (req, res) => {
  try {
    // Authenticate the user
    authUser(req, res, async () => {
      const { productId } = req.params;
      const userId = req.user.id;

      // Find the user's wishlist
      let wishlist = await Wishlist.findOne({ user: userId });

      // If the wishlist doesn't exist, create a new one
      if (!wishlist) {
        wishlist = new Wishlist({
          user: userId,
          products: [],
        });
      }

      // Check if the product already exists in the wishlist
      const productExists = wishlist.products.some(
        (item) => item.productId.toString() === productId
      );

      if (productExists) {
        return res.status(400).json({ message: 'Product already in wishlist' });
      }

      // Add the product to the wishlist
      wishlist.products.push({ productId });

      // Save the wishlist
      await wishlist.save();

      res.status(200).json({ message: 'Product added to wishlist', wishlist });
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};




export const removeFromWishlist = async (req, res) => {
  try {
    authUser(req, res, async () => {
      const { productId } = req.params;  // Use req.params for URL parameter
      const userId = req.user.id;

      const wishlist = await Wishlist.findOne({ user: userId });

      if (!wishlist) {
        return res.status(404).json({ message: 'Wishlist not found' });
      }

      const productIndex = wishlist.products.findIndex(
        (item) => item.productId.toString() === productId
      );

      if (productIndex === -1) {
        return res.status(404).json({ message: 'Product not found in wishlist' });
      }

      wishlist.products.splice(productIndex, 1);
      await wishlist.save();

      res.status(200).json({ message: 'Product removed from wishlist', wishlist });
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


  export const getWishlist = async (req, res) => {
    try {
      // Authenticate the user
      authUser(req, res, async () => {
        const userId = req.user.id; // Assuming the user ID is stored in the decoded token
  
        // Find the user's wishlist and populate product details
        const wishlist = await Wishlist.findOne({ user: userId }).populate({
          path: 'products.productId',
          select: 'name price images', // Select the fields you want to populate
        });
  
        // If the wishlist doesn't exist, return an empty wishlist
        if (!wishlist) {
          return res.status(200).json({ message: 'Wishlist is empty', wishlist: { products: [] } });
        }
  
        // Return the wishlist
        res.status(200).json({ message: 'Wishlist retrieved successfully', wishlist });
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };