import express from 'express';
import {
    createRoom,
    removeUserFromRoom,
    updateRoom,
    addUserToRoom,
    disconnectUserFromRoom
} from '../../controllers/room.controllers.js';
import { authVerify } from '../../middlewares/userAuth.middleware.js';

const roomRouter = express.Router();

roomRouter.route('/create').post(authVerify, createRoom);
roomRouter.route('/user/remove').post(authVerify, removeUserFromRoom);
roomRouter.route('/update').patch(authVerify, updateRoom);
roomRouter.route('/user/add').post(authVerify, addUserToRoom);
roomRouter.route('/user/disconnect').post(authVerify, disconnectUserFromRoom);

export default roomRouter;
