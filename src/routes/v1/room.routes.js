/* eslint-disable no-unused-vars */
import express from 'express';
import {
    createRoom,
    removeUserFromRoom,
    updateRoom,
    addUserToRoom,
    disconnectUserFromRoom,
    acceptOrRejectPendingUser
} from '../../controllers/room.controllers.js';
import { announce } from '../../controllers/announce.controllers.js';
import { authVerify } from '../../middlewares/userAuth.middleware.js';
import prisma from '../../config/db.config.js';

const roomRouter = express.Router();

roomRouter.post('/create', authVerify, createRoom);
roomRouter.post('/user/remove', authVerify, removeUserFromRoom);
roomRouter.patch('/update', authVerify, updateRoom);
roomRouter.post('/user/add', authVerify, addUserToRoom);
roomRouter.post('/user/disconnect', authVerify, disconnectUserFromRoom);
roomRouter.post('/user/pending', authVerify, acceptOrRejectPendingUser);

// just  testing routes for now can be upgraded later
roomRouter.get('/', async (req, res) => {
    const rooms = await prisma.room.findMany();
    return res.json(rooms);
});

roomRouter.delete('/delete/:code', async (req, res) => {
    const { code } = req.params;
    const room = await prisma.room.delete({
        where: {
            code: code
        }
    });
    return res.status(200).send('Room deleted');
});

roomRouter.post("/announce", announce);

export default roomRouter;

