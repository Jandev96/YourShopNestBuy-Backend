import mongoose, { Schema } from "mongoose";

const adminSchema = new Schema(
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
        role: {
          type: String,
          enum: ['seller', 'admin'],
          default: 'admin',
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

 const Admin = mongoose.model("Admin", adminSchema);
 export default Admin