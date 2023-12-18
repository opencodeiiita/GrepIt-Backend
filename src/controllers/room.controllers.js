import Randomstring from 'randomstring';
import prisma from '../config/db.config.js';
import { response_200, response_400, response_403, response_404, response_500 } from '../utils/responseCodes.js';
import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET;

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

        const room = await prisma.room.create({
            data: {
                ...req.body,
                code,
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

        const token = jwt.sign(
            { userID: user.id, userName: user.name, isCreator: true },
            JWT_SECRET,
            { expiresIn: '2d' }
        );

        response_200(res, 'Room created successfully', {
            code,
            roomId: room.id,
            token: token
        });
    } catch (e) {
        console.error(`Error creating room: ${e}`);
        response_500(res, 'Error creating room:', e);
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

        const userOwnsRoom = await prisma.user.findUnique({
            where: {
                id: req.user.id,
                userRoomId: roomId,
                isCreator: true,
            }
        });
        if (!userOwnsRoom) {
            console.log('Error updating room: User is not the creator of the room');
            response_403(res, 'User is not the creator of the room');
            return;
        }

        const updatedRoom = await prisma.room.update({
            where: {
                roomId: roomId
            },
            data: {
                roomName: roomName,
                roomDescription: roomDescription
            }
        });

        response_200(res, 'Room updated successfully', updatedRoom);
    } catch (e) {
        console.error(`Error updating room: ${e}`);
        response_500(res, `Error updating room`, e);
    }
}

async function removeUserFromRoom(req, res) {
    try {
        const roomId = parseInt(req.query.roomId);
        const userId = parseInt(req.query.userId);

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
        if (!user.isCreator && !(user.userRoomId === room.roomId)) {
            console.log('Error removing user from room: User is not the creator of the room');
            response_403(res, 'User is not the creator of the room');
            return;
        }

        const userInRoom = room.users.find((user) => user.id == Number(userId));
        if (!userInRoom) {
            console.log(
                'Error removing user from room: User is not in the room'
            );
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
        response_200(res, 'User removed from room successfully', updatedRoom);
    } catch (e) {
        console.error(`Error removing user from room: ${e}`);
        response_500(res, `Error removing user from room`, e);
    }
}

async function addUserToRoom(req, res) {
    try {
        const roomCode = req.query.roomCode;
        const userId = req.user.id;

        const room = await prisma.room.findUnique({
            where: {
                code: roomCode
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
        if (!user.isCreator && !(user.userRoomId === room.roomId)) {
            console.log('Error removing user from room: User is not the creator of the room');
            response_403(res, 'User is not the creator of the room');
            return;
        }

        const userInRoom = room.users.find((user) => user.id == userId);
        if (userInRoom) {
            console.log(
                'Error adding user to room: User is already in the room'
            );
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
        response_200(res, 'User added to room successfully', updatedRoom);
    } catch (e) {
        console.error(`Error adding user to room: ${e}`);
        response_500(res, `Error adding user to room`, e);
    }
}

async function disconnectUserFromRoom(req, res) {
    try {
        const roomId = parseInt(req.query.roomId);
        const userId = req.user.id;

        const room = await prisma.room.findUnique({
            where: {
                roomId: roomId
            },
            include: {
                users: true
            }
        });

        if (!room) {
            console.log('Error removing user from room: Room does not exist');
            response_404(res, 'Room does not exist');
            return;
        }

        const user = await prisma.user.findUnique({
            where: {
                id: userId
            }
        });
        if (!user) {
            console.log('Error removing user from room: User does not exist');
            response_404(res, 'User does not exist');
            return;
        }
        if (!user.isCreator && !(user.userRoomId === room.roomId)) {
            console.log('Error removing user from room: User is not the creator of the room');
            response_403(res, 'User is not the creator of the room');
            return;
        }

        const userInRoom = room.users.find((user) => user.id == userId);
        if (!userInRoom) {
            console.log(
                'Error removing user from room: User is not in the room'
            );
            response_400(res, 'User is not in the room');
            return;
        } else if (userInRoom.isCreator) {
            const otherUsers = room.users.filter((user) => user.id != userId);
            const randomUser = otherUsers[Math.floor(Math.random() * otherUsers.length)];
            await prisma.user.update({
                where: {
                    id: randomUser.id
                },
                data: {
                    isCreator: true
                }
            });
        }

        const updatedRoom = await prisma.room.update({
            where: {
                roomId: roomId
            },
            data: {
                users: {
                    disconnect: {
                        id: userId
                    }
                }
            }
        });
        response_200(res, 'User removed from room successfully', updatedRoom);
    } catch (e) {
        console.error(`Error removing user from room: ${e}`);
        response_500(res, `Error removing user from room`, e);
    }
}

async function transferOwnership(req, res) {
    try {
        const roomId = parseInt(req.query.roomId);
        const userId = parseInt(req.query.userId);
        const owneruserId = req.user.id;

        const room = await prisma.room.findUnique({
            where: {
                roomId: roomId
            },
            include: {
                users: true
            }
        });

        if (!room) {
            console.log('Error transferring ownership: Room does not exist');
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
            console.log('Error transferring ownership: User does not exist');
            res.status(400).json({
                error: 'User does not exist'
            });
            return;
        }

        const ownerUser = await prisma.user.findUnique({
            where: {
                id: owneruserId,
                isCreator: true,
                roomId: roomId
            }
        });
        if (!ownerUser.isCreator && !(ownerUser.userRoomId === room.roomId)) {
            console.log('Error removing user from room: User is not the creator of the room');
            response_403(res, 'User is not the creator of the room');
            return;
        }

        const userInRoom = room.users.find((user) => user.id == userId);
        if (!userInRoom) {
            console.log(
                'Error transferring ownership: User is not in the room'
            );
            res.status(400).json({
                error: 'User is not in the room'
            });
            return;
        }

        const updatedRoom = await prisma.room.update({
            where: {
                roomId: roomId
            },
            data: {
                users: {
                    update: {
                        where: {
                            id: userId
                        },
                        data: {
                            isCreator: true
                        }
                    }
                }
            }
        });


        await prisma.user.update({
            where: {
                id: owneruserId
            },
            data: {
                isCreator: false
            }
        });
        response_200(res, 'Ownership transferred successfully', updatedRoom);
    } catch (e) {
        console.error(`Error transferring ownership: ${e}`);
        response_500(res, `Error transferring ownership`, e);
    }
}

export {
    removeUserFromRoom,
    addUserToRoom,
    createRoom,
    updateRoom,
    disconnectUserFromRoom,
    transferOwnership
};

