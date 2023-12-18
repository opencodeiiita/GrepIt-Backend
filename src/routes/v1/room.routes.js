import express from 'express';
import {
    createRoom,
    removeUserFromRoom,
    updateRoom,
    addUserToRoom,
    disconnectUserFromRoom,
    acceptOrRejectPendingUser
} from '../../controllers/room.controllers.js';


const roomRouter = express.Router();

roomRouter.route('/create').post(createRoom);
roomRouter.route('/user/remove').post(removeUserFromRoom);
roomRouter.route('/update').patch(updateRoom);
roomRouter.route('/user/add').post(addUserToRoom);
roomRouter.route('/user/disconnect').post(disconnectUserFromRoom);
roomRouter.route('/user/pending').post(acceptOrRejectPendingUser);

export default roomRouter;
