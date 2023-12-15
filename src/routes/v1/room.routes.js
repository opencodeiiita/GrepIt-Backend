import express from 'express';
import { createRoom } from '../../controllers/room.controllers.js';
import { fetchUser, removeUserFromRoom } from '../../middlewares/userAuth.middleware.js';

const router = express.Router();

router.route('/create').post(fetchUser, createRoom);
router.route("/user/delete").post(removeUserFromRoom);

export default router;