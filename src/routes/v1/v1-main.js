import express from "express";

import {default as userAuthRouter} from "./userAuth.routes.js"

const router = express.Router();

router.use("/auth", userAuthRouter);

export default router;