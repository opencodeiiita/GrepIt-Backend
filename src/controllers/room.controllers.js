import Randomstring from 'randomstring';
import prisma from '../config/db.config.js';

async function generateRoomCode() {
    let code = Randomstring.generate(10);

    const roomAlreadyPresent = await prisma.room.findUnique({
        where: {
            code
        }
    });

    if (roomAlreadyPresent) {
        return await generateRoomCode();
    }

    return code;
}

async function createRoom(req, res) {
    try {
        const code = await generateRoomCode();

        const user = await prisma.user.update({
            where: {
                id: req.user.id
            },
            data: {
                isCreator: true
            }
        });

        const room = await prisma.room.create({
            data: {
                code,
                questions: {},
                users: {
                    connect: [{ id: user.id }]
                }
            }
        });

        res.status(200).json({
            message: 'Room created successfully',
            code
        });
    } catch (e) {
        console.log(`Error creating room: ${e}`);
        res.status(500).json({
            error: 'Internal Server Error'
        });
    }
}

export { createRoom };
