import express from 'express';
import { createRoom } from '../../controllers/room.controllers.js';
import { fetchUser } from '../../middlewares/userAuth.middleware.js';

const router = express.Router();

router.route('/create').post(fetchUser, createRoom);

export default router;
