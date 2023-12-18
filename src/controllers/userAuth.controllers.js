import bcrypt from 'bcrypt';
import prisma from '../config/db.config.js';
import {
    response_200,
    response_401,
    response_404,
    response_500
} from '../utils/responseCodes.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

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
            return response_200(res,'User already exists in the DB');
        }

        const salt = await bcrypt.genSalt(saltRounds);
        const secPass = await bcrypt.hash(password, salt);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: secPass
            }
        });

        const token = jwt.sign({userID:user.id,userName:user.name,isCreator:false},JWT_SECRET,{expiresIn:'2d'})

        return response_200(res,'User created successfully',{
            user: user,
            token:token
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

        const token = jwt.sign({userID:user.id,userName:user.name,isCreator:user.isCreator},JWT_SECRET,{expiresIn:'2d'})

        response_200(res,'User logged in successfully',{
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                currPoints: user.currPoints,
                token:token
            },
        });
    } catch (e) {
        console.log(`Error logging in: ${e}`);
        response_500(res,'Error logging in',e);
    }
}

export { registerUser, loginUser };
