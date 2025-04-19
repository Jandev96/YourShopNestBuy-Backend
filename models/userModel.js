import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    stripeCustomerId: {
       type: String,
        default: null,
       },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    profilePic: {
        type: String,
        default:"https://th.bing.com/th/id/OIP.hGSCbXlcOjL_9mmzerqAbQHaHa?rs=1&pid=ImgDetMain"
    },
    isActive: {
        type:Boolean,
        default:true
  }
  
},
{
  timestamps: true, // Adds createdAt & updatedAt fields
}
  
);

const User = mongoose.model('User', userSchema);
export default User;
