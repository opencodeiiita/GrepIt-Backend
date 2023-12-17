import bcrypt from 'bcrypt';
import prisma from '../config/db.config.js';
import jwt from 'jsonwebtoken';
import {
    response_200,
    response_401,
    response_404,
    response_500
} from '../utils/responseCodes.js';

const saltRounds = 10;

async function registerUser(req, res) {
    try {
        const { name, email, password } = req.body;
       
        const userAlreadyPresent = await prisma.user.findUnique({
            where: {
                email: email
            }
        });

        if (userAlreadyPresent) {
            console.log('Error creating user: User already exists in the DB');
            response_200(res,'User already exists in the DB');
        }

        const salt = await bcrypt.genSalt(saltRounds);
        const secPass = await bcrypt.hash(password, salt);
        const authToken = jwt.sign({id: user.id, name: user.name, isCreator: false}, process.env.JWT_SECRET,{
            expiresIn: "7d",
        });
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: secPass
            }
        });

        response_200(res, 'User created successfully', {
            "user" : user,
            "token" : authToken
        });
    } catch (e) {
        console.error(`Error creating user: ${e}`);
        response_500(res, 'Error creating user', e);
    }
}

async function loginUser(req, res) {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({
            where: {
                email: email
            }
        });

        if (!user) {
            console.log('Error logging in: User does not exist');
            return response_404(res, 'User does not exist');
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            console.log('Error logging in: Incorrect password');
            return response_401(res, 'Unauthorized User');
        }

        const authToken = jwt.sign({id: user.id, name: user.name, isCreator: false}, process.env.JWT_SECRET,{
            expiresIn: "7d",
        });
        res.status(200).json({
            message: 'User logged in successfully',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                currPoints: user.currPoints,
            },
            token: authToken
        });
    } catch (e) {
        console.log(`Error logging in: ${e}`);
        response_500(res,'Error logging in',e);
    }
}

export { registerUser, loginUser };
