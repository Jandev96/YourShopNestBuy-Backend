import jwt from "jsonwebtoken"


export const authAdmin =(req, res, next)=>{
    try {

        //collect token from cookies
        const {token}=req.cookies
        
        // check if token is valid
        if(!token){
            return res.status(401).json({message:"user not authorized"})
        }

        //decode token
       const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
       

       //check if decoded token is valid
       if(!decodedToken){
        return res.status(401).json({message:"user not authorized"})
       }

       //check if role is admin
       if(decodedToken.role!="admin"){
        return res.status(401).json({message:"user not authorized"})

       }


       req.admin=decodedToken

        next()

    }
    catch(error){
        res.status(error.statusCode || 500).json({message: error.message || "Internal Server Error"})
        console.log(error)
    }
}