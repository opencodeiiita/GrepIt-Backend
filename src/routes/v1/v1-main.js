import express from "express";

import {default as userAuthRouter} from "./userAuth.routes.js"
import {default as roomRouter} from "./room.routes.js"

const router = express.Router();

router.use("/auth", userAuthRouter);
router.use("/room", roomRouter);

export default router;