import express from 'express';
import {
    registerUser,
    loginUser
} from '../../controllers/userAuth.controllers.js';
import prisma from '../../config/db.config.js';

const router = express.Router();

router.route('/register').post(registerUser);
router.route('/login').post(loginUser);

// another test route
router.route('/').get(async (req, res) => {
    const users = await prisma.user.findMany();
    return res.status(200).json(users);
});

export default router;
