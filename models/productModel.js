import mongoose from 'mongoose';

const allowedCategories = [
  "Electronics",
  "Clothing",
  "Home & Kitchen",
  "Beauty & Health",
  "Sports",
  "Automotive",
  "Books",
  "Toys",
  "Grocery",
  "Furniture",
];


const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    category: [{
      type: String,
      required: true,
      trim: true,
      enum:allowedCategories,
    },
  ],
    stock: {
      type: Number,
      required: true,
      min: 0,
    },
  
    images: [
      {
        type: String, // Image URLs
        
      },
    ],
    isActive: [
      {
        type:Boolean,
        default:true
      }
    ],
    admin:[ { type: mongoose.Types.ObjectId, ref: "Admin" },],
    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Review', // Reference to Review schema
      },
    ],
  },
  // {
  //   timestamps: true,
  // }
);

const Product = mongoose.model('Product', productSchema);
export default Product;
