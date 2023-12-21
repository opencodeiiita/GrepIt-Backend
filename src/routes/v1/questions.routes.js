import express from 'express';
import { addMultipleChoiceQuestion } from '../../controllers/questions.controllers.js';

const router = express.Router();

router.route('/add/').post(addMultipleChoiceQuestion);

export default router;
