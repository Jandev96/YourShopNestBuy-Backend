
import mongoose from "mongoose"
import dotenv from 'dotenv';
dotenv.config();


export const dbconnect= async ()=>{
    try{
        const response = await mongoose.connect(process.env.DB_LINK)
        console.log("dB connected")
       
    }
    catch{
        console.log('connection error')
    }
}


