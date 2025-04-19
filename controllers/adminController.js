
import Admin from '../models/adminModel.js'
import bcrypt from "bcrypt";
import { generateToken } from "../utils/token.js";


export const signup = async(req, res, next)=>{
    try{
        // res.json({data: data, message:"signup success"})
       

        //collect user data
        const {username,email,password,confirmPassword,address,profilePic}=req.body

        //data validation
        if(!username || !email || !password || !confirmPassword  ){
            return res.status(400).json({message:"all fields required"})
        }
        

      



        //check if admin already exist 
        const adminExist= await Admin.findOne({email}) 

        if(adminExist){
          return  res.status(400).json({message:"admin already exist"})
        }
        if(password!=confirmPassword ){
            return res.status(400).json({message:'confirm password error'})
        }

          //password hashing
        const hashPassword = bcrypt.hashSync(password, 10);
        
        const newAdmin= new Admin({username,email,password:hashPassword,address,profilePic,role:"admin"})
        await newAdmin.save()

        //generate token id and role using
        const token =generateToken(newAdmin._id,'admin')
        res.cookie('token',token)



        res.json({data: newAdmin, message:'signup success'})



    }
    catch(error){
        res.status(error.statusCode || 500).json({message: error.message || "Internal Server Error"})
        console.log(error)
    }
}

//user login page


export const adminLogin =async (req,res, next)=>{
    try{
       //collect user data
       const {email,password}=req.body
        
              


       //data validation
       if(!email||!password){
        return res.status(400).json({message:"all fields required"})
       }

       //user exist -check
       const adminExist= await Admin.findOne({email})

       if(!adminExist){
        return res.status(404).json({message:"user not found"})
       }



       // check db password is matched
       const passwordMatch=bcrypt.compareSync(password, adminExist.password)

       if(!passwordMatch){
        return res.status(401).json({message:"invalid credentials"})
       }

       if(!adminExist.isActive){
        return res.status(401).json({message:"user account is not valid"})
       }
       
       //generate token 
       const token =generateToken(adminExist._id,'admin')
       res.cookie("token", token, {
        sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
        secure: process.env.NODE_ENV === "production",
        httpOnly: true, 
    });

       const { password: _, ...userWithoutPassword } = adminExist.toObject();

       res.json({data: userWithoutPassword, message:'login successful'})


    }
    catch(error){
        res.status(error.statusCode || 500).json({message: error.message || "Internal Server Error"})
        console.log(error)
    }

   
}

export const adminProfile =async (req, res, next)=>{
    try{
        //user id 

        const adminId=req.admin.id
        
        const adminData= await Admin.findById(adminId)
        res.json({data:adminData,message:"admin profile fetched"})
    }
    catch(error){
        res.status(error.statusCode || 500).json({message: error.message} || "internal server")

    }
}

export const adminProfileUpdate= async (req,res,next)=>{
    try {
        const {username,email,password} =req.body

        const hashPassword = bcrypt.hashSync(password, 10);

        const adminId=req.admin.id
        const adminupdateData= await Admin.findByIdAndUpdate(adminId,{username,email,password:hashPassword,role:"admin"},{new:true})
       
        res.json({data:adminupdateData,message:"admin profile updated"})
    
        
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message || "Internal server error" });
        
    }
}

export const adminLogout = async (req,res,next)=>{
    
    try {

        res.clearCookie('token')
        res.json({message:"user successfully logged out"})
        
    } catch (error) {
        res.status(error.statusCode || 500).json({message: error.message} || "internal server")
    }
}

export const checkadmin= async( req,res,next)=>{

    try {
        res.json({message:"admin is authorized"})
        
    } catch (error) {
        res.status(error.statusCode || 500).json({message: error.message} || "internal server")
    }
}

// controller/adminController.js

export const getAllAdmins = async (req, res) => {
    try {
      const { page = 1, limit = 8, search = '', sort = 'newest' } = req.query;
  
      const query = {
        $or: [
          { username: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ],
      };
  
      const total = await Admin.countDocuments(query);
      const admins = await Admin.find(query)
        .sort(sort === 'newest' ? { createdAt: -1 } : { createdAt: 1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit));
  
      res.json({
        data: admins,
        total,
        message: 'Admins fetched successfully',
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch admins', error });
    }
  };
  
  export const updateAdminById = async (req, res) => {
    try {
      const { id } = req.params;
      const { username, email, address, role, isActive, profilePic } = req.body;
  
      const admin = await Admin.findById(id);
      if (!admin) {
        return res.status(404).json({ message: "Admin not found" });
      }
  
      admin.username = username || admin.username;
      admin.email = email || admin.email;
      admin.address = address || admin.address;
      admin.role = role || admin.role;
      admin.profilePic = profilePic || admin.profilePic;
      admin.isActive = isActive !== undefined ? isActive : admin.isActive;
  
      const updatedAdmin = await admin.save();
      res.json({ data: updatedAdmin, message: "Admin updated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Update failed", error });
    }
  };
