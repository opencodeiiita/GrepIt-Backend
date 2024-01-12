import express from 'express';
import { addQuiz, startQuiz } from '../../controllers/room.controllers.js';
import { authVerify } from '../../middlewares/userAuth.middleware.js';

const roomRouter = express.Router();

roomRouter.post('/addQuiz', authVerify, addQuiz);
roomRouter.post('/startQuiz', authVerify, startQuiz);

export default roomRouter;