import express from 'express';
import { 
    createRoom,
    removeUserFromRoom,
    updateRoom,
    addUserToRoom 
} from '../../controllers/room.controllers.js';
import { authVerify } from '../../middlewares/userAuth.middleware.js';

const roomRouter = express.Router();

roomRouter.route('/create').post(authVerify, createRoom);
roomRouter.route("/user/delete").post(authVerify, removeUserFromRoom);
roomRouter.route('/update').patch(authVerify, updateRoom);
roomRouter.route('/user/add').post(authVerify, addUserToRoom);

export default roomRouter;