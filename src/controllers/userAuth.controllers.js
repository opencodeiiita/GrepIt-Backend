import bcrypt, { genSalt } from "bcrypt";
import prisma from "../config/db.config.js";

const saltRounds = 10;

async function registerUser(req, res) {
    try {
        const {username, email, password} = req.body;

        const userAlreadyPresent = await prisma.user.findUnique({
            where: {
                email: email
            }
        })

        console.log(userAlreadyPresent);
        if (userAlreadyPresent) {
            console.log('Error creating user: User already exists in the DB');
            res.status(200).json({
                error: "User already exists in the DB"
            });
            return;
        }

        const salt = await bcrypt.genSalt(saltRounds);
        const secPass = await bcrypt.hash(password, salt);

        const user = await prisma.user.create({
            data: {
                name: username,
                email: email,
                password: secPass,
            }
        })

        res.status(200).json({
            message: "User created successfully",
            user: user,
        });
    } catch (e) {
        console.log(`Error creating user: ${e}`);
        res.status(500).json({
            error: "Internal Server Error"
        });
    }
};

export default registerUser;