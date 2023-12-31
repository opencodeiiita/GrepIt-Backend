import express from 'express';

import {default as resultRouter} from "./result.routes";

const router = express.Router();

router.use('/results',resultRouter);


export default router