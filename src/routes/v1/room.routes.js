/* eslint-disable no-unused-vars */
import express from 'express';
import {
    createRoom,
    removeUserFromRoom,
    updateRoom,
    closeRoom,
    addUserToRoom,
    disconnectUserFromRoom,
    acceptOrRejectPendingUser,
    announce,
    leaderboardRoom,
    startQuiz,
    getRoom,
    getRooms,
    getRoomUsers,
    getRoomPendingUsers,
    sendMessageAfterQuiz,
} from '../../controllers/room.controllers.js';
import { authVerify } from '../../middlewares/userAuth.middleware.js';

const roomRouter = express.Router();

roomRouter.use(authVerify);

roomRouter.post('/create', createRoom);
roomRouter.post('/user/remove', removeUserFromRoom);
roomRouter.patch('/update', updateRoom);
roomRouter.post('/user/add', addUserToRoom);
roomRouter.post('/user/disconnect', disconnectUserFromRoom);
roomRouter.post('/user/pending', acceptOrRejectPendingUser);
roomRouter.post('/announce', announce);
roomRouter.patch('/close', closeRoom);
roomRouter.get('/leaderboard', leaderboardRoom);
roomRouter.post("/startQuiz", startQuiz);
roomRouter.post("/message/send", sendMessageAfterQuiz);
roomRouter.get('/getroom', getRoom);
roomRouter.get('/getrooms', getRooms);
roomRouter.get('/getroomusers', getRoomUsers);
roomRouter.get('/getroompendingusers', getRoomPendingUsers);


export default roomRouter;

