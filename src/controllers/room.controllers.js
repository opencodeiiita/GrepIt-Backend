import Randomstring from 'randomstring';
import prisma from '../config/db.config.js';
import {
    response_200,
    response_400,
    response_403,
    response_404,
    response_500
} from '../utils/responseCodes.js';
import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET;
import { io } from '../../app.js';

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
                roomName: req.body.roomName,
                roomDescription: req.body.roomDescription,
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

        const sockets = await io.fetchSockets();

        for (const socket of sockets) {
            console.log(socket.handshake.query);
            if (socket.handshake.query.id == req.user.id) {
                socket.join(code);
                socket.emit('room joined', code);
                break;
            }
        }

        return response_200(res, 'Room created successfully', {
            code,
            room: room,
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
                isCreator: true
            }
        });
        if (!userOwnsRoom) {
            console.log(
                'Error updating room: User is not the creator of the room'
            );
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

async function deleteRoom(req, res) {
    try {
        const roomCode = req.query.roomCode;

        const room = await prisma.room.findUnique({
            where: {
                code: roomCode
            }
        });

        if (!room) {
            res.status(400).json({
                error: 'Room does not exist'
            });
            return;
        }

        const userOwnsRoom = await prisma.user.findUnique({
            where: {
                id: req.user.id,
                userRoomId: room.roomId,
                isCreator: true
            }
        });
        if (!userOwnsRoom) {
            console.log(
                'Error updating room: User is not the creator of the room'
            );
            response_403(res, 'User is not the creator of the room');
            return;
        }

        const deletedRoom = await prisma.room.delete({
            where: {
                code: roomCode
            }
        });

        const sockets = await io.fetchSockets();

        // Iterate through sockets and disconnect those associated with the deleted room
        for (const socket of sockets) {
            if (socket.rooms.has(roomCode)) {
                // If the socket is part of the room being deleted
                for (const socketOfRoomCreator of socket) {
                    // Sends message to room creator
                    if (
                        socketOfRoomCreator.handshake.query.id ===
                        userOwnsRoom.id
                    )
                        socket
                            .to(roomCode)
                            .emit(
                                'This room has been deleted',
                                deletedRoom.roomName
                            );
                }
                socket.leave(roomCode);
                socket.disconnect(true); // Disconnect the socket
            }
        }

        return response_200(res, 'Room deleted successfully');
    } catch (error) {
        response_500(res, 'Error deleting room', error);
    }
}

async function removeUserFromRoom(req, res) {
    try {
        const roomCode = req.query.roomCode;
        const userId = parseInt(req.query.userId);

        const room = await prisma.room.findUnique({
            where: {
                code: roomCode
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

        const possibleCreator = await prisma.user.findUnique({
            where: {
                id: req.user.id
            }
        });

        if (!possibleCreator)
            return response_403(
                res,
                "This User who claims to be the admin doesn't exist"
            );

        if (
            !(
                possibleCreator.isCreator &&
                room.users.find((user) => user.id == req.user.id)
            )
        )
            return response_403(res, 'User is not the creator of the room');

        const userInRoom = room.users.find((user) => user.id == userId);
        if (!userInRoom) {
            console.log(
                'Error removing user from room: User is not in the room'
            );
            return res.status(400).json({
                error: 'User is not in the room'
            });
        }

        const updatedRoom = await prisma.room.update({
            where: {
                code: roomCode
            },
            data: {
                users: {
                    disconnect: {
                        id: userId
                    }
                }
            }
        });

        const sockets = await io.in(roomCode).fetchSockets();

        const user = await prisma.user.findUnique({
            // to be removed
            where: {
                id: userId
            }
        });

        for (const socket of sockets) {
            if (socket.handshake.query.id == userId) {
                socket.to(roomCode).emit('user removed', user.name);
                socket.leave(roomCode);
                socket.disconnect(true);
            }
        }

        console.log('User removed from room successfully');
        return response_200(
            res,
            'User removed from room successfully',
            updatedRoom
        );
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
            response_404(res, 'Room does not exist');
            return;
        }

        const user = await prisma.user.findUnique({
            where: {
                id: userId
            }
        });
        if (!user) {
            console.log('Error adding user to room: User does not exist');
            response_404(res, 'User does not exist');
            return;
        }

        const userInRoom = room.users.find((user) => user.id == userId);
        if (userInRoom) {
            console.log(
                'Error adding user to room: User is already in the room'
            );
            response_400(res, 'User is already in the room');
            return;
        }

        if (!room.isInviteOnly) {
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

            // this is the syntax for joining a room in socket.io
            const sockets = await io.fetchSockets();

            for (const socket of sockets) {
                console.log(socket.handshake.query.id);
                if (socket.handshake.query.id == req.user.id) {
                    socket.join(roomCode);
                    socket.emit('room joined', roomCode);
                    socket.to(roomCode).emit('new join', user.name);
                    break;
                }
            }

            return response_200(
                res,
                'User added to room successfully',
                updatedRoom
            );
        } else {
            const updatedRoom = await prisma.room.update({
                where: {
                    code: roomCode
                },
                data: {
                    pending: {
                        connect: {
                            id: userId
                        }
                    }
                }
            });
            response_200(res, 'User added to room waiting list', updatedRoom);
        }
    } catch (e) {
        console.error(`Error adding user to room: ${e}`);
        response_500(res, `Error adding user to room`, e);
    }
}

async function disconnectUserFromRoom(req, res) {
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

        const userInRoom = room.users.find((user) => user.id == userId);
        if (!userInRoom) {
            console.log(
                'Error removing user from room: User is not in the room'
            );
            response_400(res, 'User is not in the room');
            return;
        } else if (userInRoom.isCreator) {
            const otherUsers = room.users.filter((user) => user.id != userId);
            const randomUser =
                otherUsers[Math.floor(Math.random() * otherUsers.length)];
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
                code: roomCode
            },
            data: {
                users: {
                    disconnect: {
                        id: userId
                    }
                }
            }
        });

        const sockets = await io.in(roomCode).fetchSockets();

        for (const socket of sockets) {
            if (socket.handshake.query.id == req.user.id) {
                socket.to(roomCode).emit('user left', user.name);
                socket.leave(roomCode);
                socket.disconnect(true);
            }
        }

        return response_200(
            res,
            'User removed from room successfully',
            updatedRoom
        );
    } catch (e) {
        console.error(`Error removing user from room: ${e}`);
        return response_500(res, `Error removing user from room`, e);
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
        if (!ownerUser) {
            console.log(
                'Error removing user from room: User is not the creator of the room'
            );
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

async function acceptOrRejectPendingUser(req, res) {
    try {
        const roomId = parseInt(req.query.roomId);
        const userId = parseInt(req.query.userId);
        const owneruserId = req.user.id;

        const room = await prisma.room.findUnique({
            where: {
                roomId: roomId
            },
            include: {
                users: true,
                pending: true
            }
        });
        if (!room) {
            console.log(
                'Error accepting/rejecting pending user: Room does not exist'
            );
            response_400(res, 'Room does not exist');
            return;
        }

        const user = await prisma.user.findUnique({
            where: {
                id: userId
            }
        });
        if (!user) {
            console.log(
                'Error accepting/rejecting pending user: User does not exist'
            );
            response_400(res, 'User does not exist');
            return;
        }

        const ownerUser = await prisma.user.findUnique({
            where: {
                id: owneruserId,
                isCreator: true,
                userRoomId: roomId
            }
        });
        if (!ownerUser) {
            console.log(
                'Error accepting/rejecting pending user: User is not the creator of the room'
            );
            response_403(res, 'User is not the creator of the room');
            return;
        }

        const userInRoom = room.users.find((user) => user.id == userId);
        if (userInRoom) {
            console.log(
                'Error accepting/rejecting pending user: User is already in the room'
            );
            response_400(res, 'User is already in the room');
            return;
        }

        const pendingUser = room.pending.find((user) => user.id == userId);
        if (!pendingUser) {
            console.log(
                'Error accepting/rejecting pending user: User is not in the pending list'
            );
            response_400(res, 'User is not in the pending list');
            return;
        }

        if (req.query.action === 'accept') {
            await prisma.room.update({
                where: {
                    roomId: roomId
                },
                data: {
                    users: {
                        connect: {
                            id: userId
                        }
                    },
                    pending: {
                        disconnect: {
                            id: userId
                        }
                    }
                }
            });
            response_200(res, 'User accepted successfully');
        } else if (req.query.action === 'reject') {
            await prisma.room.update({
                where: {
                    roomId: roomId
                },
                data: {
                    pending: {
                        disconnect: {
                            id: userId
                        }
                    }
                }
            });
            response_200(res, 'User rejected successfully');
        } else {
            console.log(
                'Error accepting/rejecting pending user: Invalid action'
            );
            response_400(res, 'Invalid action');
        }
    } catch (e) {
        console.error(`Error accepting/rejecting pending user: ${e}`);
        response_500(res, `Error accepting/rejecting pending user`, e);
    }
}

async function leaderboardRoom(req, res) {
    try {
        const roomCode = (req.query.roomCode);
        const room = await prisma.room.findUnique({
            where: {
                code: roomCode
            },
            include: {
                users: {
                    orderBy: {currPoints: 'desc'},
                    select: {
                        name: true,
                        currPoints: true
                    }
                }
            }
        });
        if (!room) {
            console.log('Error updating room: Room does not exist');
            res.status(400).json({
                error: 'Room does not exist'
            });
            return;
        }
        const leaderboardData = room.users.map(user => ({
            name: user.name,
            points: user.currPoints
        }));
        response_200(res, 'Leaderboard Details', leaderboardData);
    } catch (e) {
        console.error(`Error updating room: ${e}`);
        response_500(res, `Error updating room`, e);
    }
}

export {
    removeUserFromRoom,
    addUserToRoom,
    createRoom,
    updateRoom,
    deleteRoom,
    disconnectUserFromRoom,
    transferOwnership,
    acceptOrRejectPendingUser,
    leaderboardRoom
};

export const announce = async (req, res) => {
    try {
        const { code, message } = req.body;
        const userId = req.user.id;

        const room = await prisma.room.findUnique({
            where: {
                code: code
            },
            include: {
                users: true
            }
        });

        if (!room) {
            return response_404(res, 'Room not found');
        }

        const user = await prisma.user.findUnique({
            where: {
                id: userId
            }
        });

        if (!user) {
            return response_404(res, 'User not found');
        }

        const userInRoom = room.users.find((user) => user.id === userId);
        if (!userInRoom) {
            return response_400(res, 'User is not in the room');
        }
        if (!userInRoom.isCreator) {
            return response_403(res, 'User is not the creator of the room');
        }

        io.to(room.code).emit('announcement', message);

        return response_200(res, 'Announcement sent');
    } catch (err) {
        return response_500(res, 'Error sending announcement', err);
    }
};

