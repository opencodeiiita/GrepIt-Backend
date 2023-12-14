import bcrypt, { genSalt } from "bcrypt";
import prisma from "../config/db.config.js";

const saltRounds = 10;

async function registerUser(req, res) {
    try {
        const salt = await bcrypt.genSalt(saltRounds);
        const secPass = await bcrypt.hash(req.body.password, salt);

        const user = await prisma.user.create({
            data: {
                name: req.body.username,
                email: req.body.email,
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