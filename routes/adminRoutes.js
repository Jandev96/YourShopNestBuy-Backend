<<<<<<< HEAD

import express from "express"
import { adminLogin, checkadmin } from "../controllers/adminController.js"
import { authAdmin } from "../middlewares/authAdmin.js"
import { adminProfile } from "../controllers/adminController.js"
import { adminProfileUpdate } from "../controllers/adminController.js"
import { adminLogout } from "../controllers/adminController.js"
import { signup } from "../controllers/adminController.js"
import { getAllAdmins,updateAdminById } from "../controllers/adminController.js"
import Admin from "../models/adminModel.js"


const router = express.Router()

//sign up
router.post("/signup",authAdmin,signup)
// login 
router.post("/login",adminLogin)
// profile
router.get("/profile",authAdmin,adminProfile)
// profile edit
router.put("/update",authAdmin,adminProfileUpdate)

router.get('/all',authAdmin, getAllAdmins)


router.delete("/:id", authAdmin, async (req, res) => {
    const admin = await Admin.findByIdAndDelete(req.params.id);
    if (!admin) return res.status(404).json({ message: "Admin not found" });
    res.json({ message: "Admin deleted successfully" });
  });

  router.put('/:id', authAdmin, updateAdminById);


// profile deactivate
router.put("/deactivate",authAdmin)

//logout
router.get("/logout",authAdmin,adminLogout)

router.delete('/delete-account')
//password-forgot
router.get('/checkadmin',authAdmin,checkadmin)

// password change
router.put('/deactivateUser/:userId',authAdmin)
// address update

=======

import express from "express"
import { adminLogin, checkadmin } from "../controllers/adminController.js"
import { authAdmin } from "../middlewares/authAdmin.js"
import { adminProfile } from "../controllers/adminController.js"
import { adminProfileUpdate } from "../controllers/adminController.js"
import { adminLogout } from "../controllers/adminController.js"
import { signup } from "../controllers/adminController.js"
import { getAllAdmins,updateAdminById } from "../controllers/adminController.js"
import Admin from "../models/adminModel.js"


const router = express.Router()

//sign up
router.post("/signup",authAdmin,signup)
// login 
router.post("/login",adminLogin)
// profile
router.get("/profile",authAdmin,adminProfile)
// profile edit
router.put("/update",authAdmin,adminProfileUpdate)

router.get('/all',authAdmin, getAllAdmins)


router.delete("/:id", authAdmin, async (req, res) => {
    const admin = await Admin.findByIdAndDelete(req.params.id);
    if (!admin) return res.status(404).json({ message: "Admin not found" });
    res.json({ message: "Admin deleted successfully" });
  });

  router.put('/:id', authAdmin, updateAdminById);


// profile deactivate
router.put("/deactivate",authAdmin)

//logout
router.get("/logout",authAdmin,adminLogout)

router.delete('/delete-account')
//password-forgot
router.get('/checkadmin',authAdmin,checkadmin)

// password change
router.put('/deactivateUser/:userId',authAdmin)
// address update

>>>>>>> 00d43a0 (archived file push)
export default router