import Randomstring from 'randomstring';
import prisma from '../config/db.config.js';
import { response_200, response_500 } from '../utils/responseCodes.js';

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
        let room;
        const success = await prisma.$transaction(async (tx) => {
            room = prisma.room.create({
                data: {
                    code,
                    roomName: req.body.roomName,
                    questions: {},
                    users: {
                        connect: [{ id: req.user.id }]
                    }
                }
            });

            const user = await prisma.user.update({
                where: {
                    id: req.user.id
                },
                data: {
                    isCreator: true
                }
            });
        });

        return response_200(res,'Room created successfully',room);
    } catch (e) {
        console.error(`Error creating room: ${e}`);
        return response_500(res,'Error creating room:',e);
    }
}

async function updateRoom(req, res) {
    try {
        const roomId = parseInt(req.query.roomId);
        const { roomName, roomDescription } = req.body;

        const room = await prisma.room.findUnique({
            where: {
                roomId: roomId
            }
        });

        if (!room) {
            console.log('Error updating room: Room does not exist');
            res.status(400).json({
                error: 'Room does not exist'
            });
            return;
        }

        const updatedRoom = await prisma.room.update({
            where: {
                roomId: Number(roomId)
            },
            data: {
                roomName: roomName,
                roomDescription: roomDescription
            }
        });

        response_200(res,'Room updated successfully',updatedRoom);
    } catch (e) {
        console.error(`Error updating room: ${e}`);
        response_500(res,`Error updating room`,e);
    }
}

async function removeUserFromRoom(req, res) {
    try {
        const roomId = parseInt(req.query.roomId);
        const userId  = parseInt(req.query.userId);

        const room = await prisma.room.findUnique({
            where: {
                roomId: Number(roomId)
            },
            include: {
                users: true
            }
        });

        if (!room) {
            console.log('Error removing user from room: Room does not exist');
            res.status(400).json({
                error: 'Room does not exist'
            });
            return;
        }

        const user = await prisma.user.findUnique({
            where: {
                id: Number(userId)
            }
        });
        if (!user) {
            console.log('Error removing user from room: User does not exist');
            res.status(400).json({
                error: 'User does not exist'
            });
            return;
        }

        const userInRoom = room.users.find((user) => user.id == Number(userId));
        if (!userInRoom) {
            console.log('Error removing user from room: User is not in the room');
            res.status(400).json({
                error: 'User is not in the room'
            });
            return;
        }

        const updatedRoom = await prisma.room.update({
            where: {
                roomId: Number(roomId)
            },
            data: {
                users: {
                    disconnect: {
                        id: Number(userId)
                    }
                }
            }
        });
        response_200(res,'User removed from room successfully',updatedRoom);
    } catch (e) {
        console.error(`Error removing user from room: ${e}`);
        response_500(res,`Error removing user from room`,e);
    }
}

async function addUserToRoom(req, res) {
    try {
        const roomCode = req.query.roomCode;
        const userId = req.user.id;

        const room = await prisma.room.findUnique({
            where: {
                code: roomCode,

            },
            include: {
                users: true
            }
        });

        if (!room) {
            console.log('Error adding user to room: Room does not exist');
            res.status(400).json({
                error: 'Room does not exist'
            });
            return;
        }

        const user = await prisma.user.findUnique({
            where: {
                id: userId
            }
        });
        if (!user) {
            console.log('Error adding user to room: User does not exist');
            res.status(400).json({
                error: 'User does not exist'
            });
            return;
        }

        const userInRoom = room.users.find((user) => user.id == userId);
        if (userInRoom) {
            console.log('Error adding user to room: User is already in the room');
            res.status(400).json({
                error: 'User is already in the room'
            });
            return;
        }

        const updatedRoom = await prisma.room.update({
            where: {
                code: roomCode
            },
            data: {
                users: {
                    connect: {
                        id: userId
                    }
                }
            }
        });
        response_200(res,'User added to room successfully',updatedRoom);
    } catch (e) {
        console.error(`Error adding user to room: ${e}`);
        response_500(res,`Error adding user to room`,e);
    }
}

export {
    removeUserFromRoom,
    addUserToRoom,
    createRoom,
    updateRoom
};