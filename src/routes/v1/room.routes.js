import express from 'express';
import { 
    createRoom,
    removeUserFromRoom,
    updateRoom,
    addUserToRoom 
} from '../../controllers/room.controllers.js';
import { fetchUser } from '../../middlewares/userAuth.middleware.js';

const roomRouter = express.Router();

roomRouter.route('/create').post(fetchUser, createRoom);
roomRouter.route("/user/delete").post(fetchUser, removeUserFromRoom);
roomRouter.route('/update').patch(fetchUser, updateRoom);
roomRouter.route('/user/add').post(fetchUser, addUserToRoom);

export default roomRouter;