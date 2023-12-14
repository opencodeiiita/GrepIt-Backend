import express from "express";

import {default as v1Router} from "./v1/v1-main.js"

const router = express.Router();

router.use("/v1", v1Router);

export default router;