import mongoose from 'mongoose';

const wishlistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Reference to the User schema
      required: true,
      unique: true, // Each user can have only one wishlist
    },
    products: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product', // Reference to the Product schema
          required: true,
        },
        addedAt: {
          type: Date,
          default: Date.now, // Timestamp when the product was added
        },
      },
    ],
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

const Wishlist = mongoose.model('Wishlist', wishlistSchema);
export default Wishlist;