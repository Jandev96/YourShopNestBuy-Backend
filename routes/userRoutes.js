<<<<<<< HEAD

import express from "express"
import { checkUser, signup, userLogin, userLogout, userProfile, userProfileUpdate } from "../controllers/userController.js"
import { authUser } from "../middlewares/authUser.js"
import { authAdmin } from "../middlewares/authAdmin.js"
import User from "../models/userModel.js"
import {upload} from "../middlewares/multer.js"

const router = express.Router()

//sign up
router.post("/signup",signup)
// login 
router.post("/login",userLogin)
// profile
router.get("/profile",authUser,userProfile)
// profile edit
router.put("/update",authUser,upload.single("profilePic"), userProfileUpdate)

// profile deactivate
router.put("/deactivate",authAdmin)

//logout
router.get("/logout",authUser,userLogout)

router.delete('/delete-account')
//password-forgot
router.get('/checkuser',authUser,checkUser)

// password change
router.put('/deactivateUser/:userId',authAdmin)

router.get("/recent",authAdmin, async (req, res) => {
    const users = await User.find().sort({ createdAt: -1 }).limit(5);
    res.json(users);
  });
// address update
router.get("/",authAdmin, async (req, res) => {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  });

  router.get('/me', (req, res) => {
    const token = req.cookies?.token;
    if (!token) return res.status(401).json({ message: 'Not authenticated' });
  
    try {
      const user = jwt.verify(token, process.env.JWT_SECRET); // or however you're verifying
      res.json({ data: user }); // or return user data from DB
    } catch (err) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
  });


=======

import express from "express"
import { checkUser, signup, userLogin, userLogout, userProfile, userProfileUpdate } from "../controllers/userController.js"
import { authUser } from "../middlewares/authUser.js"
import { authAdmin } from "../middlewares/authAdmin.js"
import User from "../models/userModel.js"
import {upload} from "../middlewares/multer.js"

const router = express.Router()

//sign up
router.post("/signup",signup)
// login 
router.post("/login",userLogin)
// profile
router.get("/profile",authUser,userProfile)
// profile edit
router.put("/update",authUser,upload.single("profilePic"), userProfileUpdate)

// profile deactivate
router.put("/deactivate",authAdmin)

//logout
router.get("/logout",authUser,userLogout)

router.delete('/delete-account')
//password-forgot
router.get('/checkuser',authUser,checkUser)

// password change
router.put('/deactivateUser/:userId',authAdmin)

router.get("/recent",authAdmin, async (req, res) => {
    const users = await User.find().sort({ createdAt: -1 }).limit(5);
    res.json(users);
  });
// address update
router.get("/",authAdmin, async (req, res) => {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  });

  router.get('/me', (req, res) => {
    const token = req.cookies?.token;
    if (!token) return res.status(401).json({ message: 'Not authenticated' });
  
    try {
      const user = jwt.verify(token, process.env.JWT_SECRET); // or however you're verifying
      res.json({ data: user }); // or return user data from DB
    } catch (err) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
  });


>>>>>>> 00d43a0 (archived file push)
export default router