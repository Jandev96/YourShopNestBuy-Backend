import mongoose from 'mongoose';

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Reference to the User schema
      required: true,
    },
    products: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product', // Reference to the Product schema
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        price: {
          type: Number,
          required :true,
          default : 0
        }
      },
    ],
    totalPrice: {
      type: Number,
      required: true,
    },
   
  },
  {
    timestamps: true, // Adds createdAt & updatedAt fields
  }
);

cartSchema.methods.calculateTotalPrice = function () {
  this.totalPrice = this.products.reduce((total, product) => {
    return total + product.price * product.quantity;
  }, 0);
};




const Cart = mongoose.model('Cart', cartSchema);
export default Cart;
