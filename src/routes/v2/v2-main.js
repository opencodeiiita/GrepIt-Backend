import express from 'express';

import { default as resultRouter } from './result.routes.js';
import { default as roomRouter } from './room.routes.js';

const router = express.Router();

router.use('/results', resultRouter);
router.use('/room', roomRouter);

export default router;
