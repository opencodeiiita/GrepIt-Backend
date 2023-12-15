import express from 'express';
import { createRoom, removeUserFromRoom } from '../../controllers/room.controllers.js';
import { fetchUser } from '../../middlewares/userAuth.middleware.js';

const roomRouter = express.Router();

roomRouter.route('/create').post(fetchUser, createRoom);
roomRouter.route("/user/delete").post(removeUserFromRoom);

export default roomRouter;