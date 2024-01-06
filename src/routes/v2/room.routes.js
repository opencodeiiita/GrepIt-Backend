import express from 'express';
import { startQuiz} from '../../controllers/room.controllers.js';
import { authVerify } from '../../middlewares/userAuth.middleware.js';

const roomRouter = express.Router();

roomRouter.post('/startQuiz', authVerify, startQuiz);

export default roomRouter;