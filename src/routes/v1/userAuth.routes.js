import express from "express";
import registerUser from "../../controllers/userAuth.controllers.js";

const router = express.Router();

router.route("/register").post(registerUser);

export default router;