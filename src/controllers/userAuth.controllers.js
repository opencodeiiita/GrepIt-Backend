import bcrypt from 'bcrypt';
import prisma from '../config/db.config.js';
import jwt from 'jsonwebtoken';
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
            res.status(200).json({
                error: 'User already exists in the DB'
            });
            return;
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

        res.status(200).json({
            message: 'User created successfully',
            user: user
        });
    } catch (e) {
        console.log(`Error creating user: ${e}`);
        res.status(500).json({
            error: 'Internal Server Error'
        });
    }
}

async function loginUser(req, res) {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({
            where: {
                email: email
            },
        });

        if (!user) {
            console.log('Error logging in: User does not exist');
            res.status(200).json({
                error: 'User does not exist'
            });
            return;
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            console.log('Error logging in: Incorrect password');
            res.status(401).json({
                error: 'Incorrect password'
            });
            return;
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
        res.status(500).json({
            error: 'Internal Server Error'
        });
    }
}

export { registerUser, loginUser };
