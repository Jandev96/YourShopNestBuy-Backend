import User from "../models/userModel.js"
import bcrypt from "bcrypt";
import { generateToken } from "../utils/token.js";
import fs from "fs";
import path from "path";
import { cloudinaryInstance } from "../config/cloudinary.js";


export const signup = async (req, res, next) => {
    try {
        console.log("sign up is working");

        const { username, email, password, confirmPassword, address, profilePic } = req.body;

        if (!username || !email || !password || !confirmPassword) {
            return res.status(400).json({ message: "All fields required" });
        }

        // Check if user already exists
        const userExist = await User.findOne({ email });

        if (userExist) {
            return res.status(400).json({ message: "User already exists" });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Confirm password error" });
        }

        // Hash password
        const hashPassword = bcrypt.hashSync(password, 10);

        const newUser = new User({ username, email, password: hashPassword, address, profilePic });
        await newUser.save();

        // Generate token
        const token = generateToken(newUser._id, "user");

        // Set cookie with authentication token
        res.cookie("token", token, {
            sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
            secure: process.env.NODE_ENV === "production",
            httpOnly: true, 
        });

        res.json({ data: newUser, message: "Signup successful" });

    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message || "Internal Server Error" });
        console.log(error);
    }
};


//user login page

export const userLogin = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "All fields required" });
        }

        const userExist = await User.findOne({ email });

        if (!userExist) {
            return res.status(404).json({ message: "User not found" });
        }

        const passwordMatch = bcrypt.compareSync(password, userExist.password);

        if (!passwordMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        if (!userExist.isActive) {
            return res.status(401).json({ message: "User account is not valid" });
        }

        // Generate token
        const token = generateToken(userExist._id, "user");

        // Set cookie with authentication token
        res.cookie("token", token, {
            sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
            secure: process.env.NODE_ENV === "production",
            httpOnly: true, 
            
        });

        const { password: _, ...userWithoutPassword } = userExist.toObject();

        res.json({ data: userWithoutPassword, message: "Login successful" });

    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message || "Internal Server Error" });
        console.log(error);
    }
};


export const userProfile =async (req, res, next)=>{
    try{
        //user id 

        const userId=req.user.id
        
        const userData= await User.findById(userId)
        res.json({data:userData,message:"user profile fetched"})
    }
    catch(error){
        res.status(error.statusCode || 500).json({message: error.message} || "internal server")

    }
}

export const userProfileUpdate = async (req, res, next) => {
    try {
      const { username, email, password, address } = req.body;
      const file = req.file;
  
      const userId = req.user.id;
      let profilePicUrl;
  
      if (file) {
        const filePath = path.resolve(file.path);
  
        const cloudinaryRes = await cloudinaryInstance.uploader.upload(filePath, {
          folder: "profile_pictures",
        });
  
        profilePicUrl = cloudinaryRes.secure_url;
  
        // Delete file from local storage after upload
        fs.unlinkSync(filePath);
      }
  
      const hashedPassword = bcrypt.hashSync(password, 10);
  
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          username,
          email,
          password: hashedPassword,
          address,
          ...(profilePicUrl && { profilePic: profilePicUrl }),
        },
        { new: true }
      );
  
      res.json({ data: updatedUser, message: "User profile updated" });
    } catch (error) {
      console.error("Update failed:", error);
      res.status(error.statusCode || 500).json({ message: error.message || "Internal server error" });
    }
  };

export const userLogout = async (req,res,next)=>{
    
    try {
        res.clearCookie('token', {
            sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
            secure: process.env.NODE_ENV === "production",
            httpOnly: true})
        res.json({message:"user successfully logged out"})
        
    } catch (error) {
        res.status(error.statusCode || 500).json({message: error.message} || "internal server")
    }
}
export const checkUser= async( req,res,next)=>{

    try {
        res.json({message:"user is authorized"})
        
    } catch (error) {
        res.status(error.statusCode || 500).json({message: error.message} || "internal server")
    }
}