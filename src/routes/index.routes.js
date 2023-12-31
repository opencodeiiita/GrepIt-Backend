import express from "express";

import {default as v1Router} from "./v1/v1-main.js"
import {default as v2Router} from "./v2/v2-main.js"

const router = express.Router();

router.use("/v1", v1Router);
router.use("/v2",v2Router)

export default router;