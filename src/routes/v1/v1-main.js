import express from "express";

import {default as userAuthRouter} from "./userAuth.routes.js"
import { default as roomRouter } from "./room.routes.js"
import {default as questionRouter} from "./questions.routes.js"

const router = express.Router();

import { authVerify } from '../../middlewares/userAuth.middleware.js';

router.use("/auth", userAuthRouter);
router.use("/room",  roomRouter);
router.use("/questions", questionRouter);

export default router;