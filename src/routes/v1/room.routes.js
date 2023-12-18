import express from 'express';
import {
    createRoom,
    removeUserFromRoom,
    updateRoom,
    addUserToRoom,
    disconnectUserFromRoom
} from '../../controllers/room.controllers.js';


const roomRouter = express.Router();


roomRouter.route("/create").post(createRoom);
roomRouter.route("/remove").post(removeUserFromRoom);
roomRouter.route("/update").patch(updateRoom);
roomRouter.route("/user/add").post(addUserToRoom);
roomRouter.route("/user/disconnect").post(disconnectUserFromRoom);



export default roomRouter;
