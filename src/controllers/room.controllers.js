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
            if (socket.handshake.query.id === req.user.id) {
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
        const roomCode = req.query.roomCode;
        const { roomName, roomDescription } = req.body;

        const room = await prisma.room.findUnique({
            where: {
                code: roomCode
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

        const updatedRoom = await prisma.room.update({
            where: {
                roomId: room.roomId
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

async function closeRoom(req, res) {
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

        // Remove all users from the room and close it
        await prisma.room.update({
            where: {
                code: roomCode
            },
            data: {
                isClosed: true,
                users: {
                    set: []
                }
            }
        });

        const updatedRoom = await prisma.room.findUnique({
            where: {
                code: roomCode
            }
        });

        const sockets = await io.fetchSockets();

        // Iterate through sockets and disconnect those associated with the deleted room
        for (const socket of sockets) {
            if (socket.rooms.has(roomCode)) {
                // If the socket is part of the room being deleted

                if (socket.handshake.query.id === userOwnsRoom.id) {
                    socket
                        .to(roomCode)
                        .emit('room closed', updatedRoom.roomName);
                }
                socket.leave(roomCode);
                socket.disconnect(true); // Disconnect the socket
            }
        }

        return response_200(res, 'Room Closed successfully');
    } catch (error) {
        response_500(res, 'Error closing room', error);
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
            response_400(res, 'Room does not exist');
            return;
        }

        const possibleCreator = await prisma.user.findUnique({
            where: {
                id: req.user.id,
                isCreator: true,
                userRoomId: room.roomId
            }
        });

        if (!possibleCreator)
            return response_403(res, 'User is not the creator of the room');

        const userInRoom = room.users.find((user) => user.id === userId);
        if (!userInRoom) {
            console.log(
                'Error removing user from room: User is not in the room'
            );
            response_400(res, 'User is not in the room');
            return;
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
            if (socket.handshake.query.id === userId) {
                socket.to(roomCode).emit('user removed', user.name);
                socket.leave(roomCode);
                socket.disconnect(true);
            }
        }

        console.log('User removed from room successfully');
        return response_200(
            res,
            'User removed from room successfully',
            { updatedRoom }
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

        if(room.isClosed){
            return response_403(res, 'Room is closed');
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

        const userInRoom = room.users.find((user) => user.id === userId);
        if (userInRoom) {
            console.log('User is already in the room');
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
                if (socket.handshake.query.id === req.user.id) {
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
                id: userId,
                userRoomId: room.roomId
            }
        });
        if (!user) {
            console.log(
                'Error removing user from room: User does not exist in the room'
            );
            response_400(res, 'User does not exist in the room');
            return;
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

        let otherUsers;
        let randomUser = null;
        if (user.isCreator) {
            otherUsers = updatedRoom.users;
            randomUser =
                otherUsers.length > 0
                    ? otherUsers[Math.floor(Math.random() * otherUsers.length)]
                    : null;
            randomUser
                ? await prisma.user.update({
                      where: {
                          id: randomUser.id
                      },
                      data: {
                          isCreator: true
                      }
                  })
                : await prisma.room.update({
                        where: {
                            code: roomCode
                        },
                        data: {
                            isClosed: true
                        }
                  });
        }

        const sockets = await io.in(roomCode).fetchSockets();

        for (const socket of sockets) {
            if (socket.handshake.query.id === req.user.id) {
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
        const roomCode = req.query.roomCode;
        const userId = parseInt(req.query.userId);
        const owneruserId = req.user.id;

        const room = await prisma.room.findUnique({
            where: {
                code: roomCode
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
                id: userId,
                userRoomId: room.roomId
            }
        });
        if (!user) {
            console.log(
                'Error transferring ownership: User does not exist or is not present in the room'
            );
            res.status(400).json({
                error: 'User does not exist or not in room'
            });
            return;
        }

        const ownerUser = await prisma.user.findUnique({
            where: {
                id: owneruserId,
                isCreator: true,
                roomId: room.roomId
            }
        });
        if (!ownerUser) {
            console.log(
                'Error removing user from room: User is not the creator of the room'
            );
            response_403(res, 'User is not the creator of the room');
            return;
        }

        const newOwner = await prisma.user.update({
            where: {
                id: userId
            },
            data: {
                isCreator: true
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
        response_200(res, 'Ownership transferred successfully', newOwner);
    } catch (e) {
        console.error(`Error transferring ownership: ${e}`);
        response_500(res, `Error transferring ownership`, e);
    }
}

async function acceptOrRejectPendingUser(req, res) {
    try {
        const roomCode = req.query.roomCode;
        const userId = parseInt(req.query.userId);
        const owneruserId = req.user.id;

        const room = await prisma.room.findUnique({
            where: {
                code: roomCode
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
                id: userId,
                userRoomId: room.roomId
            }
        });
        if (!user) {
            console.log(
                'Error accepting/rejecting pending user: User does not exist or is not in the room'
            );
            response_400(res, 'User does not exist or not in room');
            return;
        }

        const ownerUser = await prisma.user.findUnique({
            where: {
                id: owneruserId,
                isCreator: true,
                userRoomId: room.roomId
            }
        });
        if (!ownerUser) {
            console.log(
                'Error accepting/rejecting pending user: User is not the creator of the room'
            );
            response_403(res, 'User is not the creator of the room');
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
                   code: roomCode
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
                    roomId: room.roomId
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
        const roomCode = req.query.roomCode;
        const room = await prisma.room.findUnique({
            where: {
                code: roomCode
            },
            include: {
                users: {
                    orderBy: { currPoints: 'desc' },
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
        const leaderboardData = room.users.map((user) => ({
            name: user.name,
            points: user.currPoints
        }));
        response_200(res, 'Leaderboard Details', leaderboardData);
    } catch (e) {
        console.error(`Error updating room: ${e}`);
        response_500(res, `Error updating room`, e);
    }
}

async function addQuiz(req, res) {
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
            console.log('Error updating room: Room does not exist');
            res.status(400).json({
                error: 'Room does not exist'
            });
            return;
        }
        const userOwnsRoom = await prisma.user.findUnique({
            where: {
                id: userId,
                isCreator: true,
                userRoomId: room.roomId
            }
        });

        if (!userOwnsRoom) {
            console.log(
                'Error updating room: User is not the creator of the room'
            );
            response_403(res, 'User is not the creator of the room');
            return;
        }

        const newQuiz = await prisma.quiz.create({
            data: {
                room: {
                    connect: {
                        roomId: room.roomId
                    }
                }
            }
        });
        await prisma.room.update({
            where: {
                roomId: room.roomId
            },
            data: {
                quizzes: {
                    connect: {
                        quizId: newQuiz.quizId
                    }
                }
            }
        });

        const users = await prisma.user.findMany({
            where: {
                userRoomId: room.roomId
            }
        });

        const resultPromise = users.map((user) => {
            return prisma.result.create({
                data: {
                    user: {
                        connect: {
                            id: user.id
                        }
                    },
                    quiz: {
                        connect: {
                            quizId: newQuiz.quizId
                        }
                    },
                    score: 0,
                    optionsMarked: {
                        create: []
                    }
                }
            });
        });

        await Promise.all(resultPromise);


        response_200(res, 'Quiz added successfully', newQuiz);
    } catch (e) {
        console.error(`Error updating room: ${e}`);
        response_500(res, `Error updating room`, e);
    }
}

async function startQuiz(req, res) {
    try {

        const roomCode = req.query.roomCode;
        const QuizId = req.query.quizId;
        const owneruserId = req.user.id;
        const room = await prisma.room.findUnique({
            where: {
                code: roomCode
            },
            include: {
                users: true,
            }
        });

        if (!room) {
            console.log('Error starting quiz: Room does not exist');
            response_404(res, 'Room does not exist');
            return;
        }

        const ownerUser = await prisma.user.findUnique({
            where: {
                id: Number(owneruserId),
                isCreator: true,
                userRoomId: room.roomId
            }
        });

        if (!ownerUser) {
            console.log(
                'Error starting quiz: User is not the creator of the room'
            );
            response_403(res, 'User is not the creator of the room');
            return;
        }

        const Quiz = await prisma.quiz.findUnique({
            where: {
                quizId: Number(QuizId)
            },
            include: {
                questions: {
                    include: {
                        options: true
                    }
                }
            }
        });

        const getUsers = await prisma.user.findMany({
            where:{
                userRoomId: room.roomId
            }
        })

        io.to(roomCode).emit(
            'quiz started',
            room.users.map((user) => user.name)
        );

        await sendQuestions(roomCode, Quiz.questions);

        const updateResult = getUsers.map((user) => {
            return prisma.result.updateMany({
                where: {
                    userId: user.id,
                    quizId: Quiz.quizId
                },
                data: {
                    score: user.currPoints
                }
            });

        })

        await Promise.all(updateResult);

        io.to(roomCode).emit('quiz ended');
        return response_200(res, 'Quiz ended successfully');
    } catch (e) {
        console.error(`Error starting quiz: ${e}`);
        response_500(res, `Error starting quiz`, e);
    }
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

async function sendQuestions(roomCode, questions) {
    const shuffledQuestions = shuffleArray(questions);
    // question = {"questionId":2,"question":"Example Question 1","roomId":1,"options":[{"optionId":5,"option":"Correct Option","questionId":2,"isCorrect":true},{"optionId":6,"option":"Incorrect Option","questionId":2,"isCorrect":false},{"optionId":7,"option":"Incorrect Option","questionId":2,"isCorrect":false},{"optionId":8,"option":"Incorrect Option","questionId":2,"isCorrect":false}]}
    for (const question of shuffledQuestions) {
        io.to(roomCode).emit('display question', {
            question: question.question,
            questionId: question.questionId,
            options: question.options.map((option) => {
                return {
                    optionId: option.optionId,
                    option: option.option
                };
            })
        });
        //wait for all necessary asynchronous operations in the checkResponse function to complete
        //the promise resolution for setTimeout(10secs) at the end of checkResponse ensures that the next question is sent only after 10secs
        await checkResponse(roomCode, question);
    }
}

async function checkResponse(roomCode, question) {
    const correctAnswer = question.options.find((option) => option.isCorrect);
    io.in(roomCode)
        .fetchSockets()
        .then((sockets) => {
            for (const socket of sockets) {
                const userId = socket.handshake.query.id;
                //setting up an 'answer question' listener for each socket
                //run for all questions.
                socket.on('answer question', (data) => {
                    console.log(data);
                    if (data.questionId === question.questionId) {
                        if (data.optionId === correctAnswer.optionId) {
                            socket.emit('answer response', {
                                wasCorrect: true,
                                questionId: question.questionId,
                                correctoptionId: correctAnswer.optionId,
                                optionId: data.optionId
                            });
                            (async () => {
                                const user = await prisma.user.findUnique({
                                    where: {
                                        id: Number(userId)
                                    }
                                });
                                if (user) {
                                    const updated = await prisma.user.update({
                                        where: {
                                            id: Number(userId)
                                        },
                                        data: {
                                            currPoints: {
                                                increment: 10
                                            }
                                        }
                                    });
                                    console.log(updated);
                                }
                            })();
                        } else {
                            socket.emit('answer response', {
                                wasCorrect: false,
                                questionId: question.questionId,
                                correctoptionId: correctAnswer.optionId,
                                optionId: data.optionId
                            });
                        }
                    }
                });
            }
        });
    await new Promise((resolve) => setTimeout(resolve, 10000));
}

async function sendMessageAfterQuiz(req, res) {
    console.log("someone sending message")
    try {
        const roomCode = req.body.roomCode;
        const userId = req.user.id;

        const room = await prisma.room.findUnique({
            where: {
                code: roomCode
            },
            include: {
                users: true,
                messages: true
            }
        });

        if (!room) {
            console.log('Error removing user from room: Room does not exist');
            response_400(res, 'Room does not exist');
            return;
        }

        const messageSender = await prisma.user.findUnique({
            where: {
                id: userId
            }
        });

        if (!messageSender) {
            console.log('Error removing user from room: User does not exist');
            response_400(res, 'User does not exist');
            return;
        }

        const userInRoom = room.users.find((user) => user.id === userId);
        if (!userInRoom) {
            console.log(
                'Error removing user from room: User is not in the room'
            );
            response_400(res, 'User is not in the room');
            return;
        }

        const message = await prisma.message.create({
            data: {
                message: req.body.message,
                user: {
                    connect: {
                        id: userId
                    }
                },
                room: {
                    connect: {
                        roomId: room.roomId
                    }
                }
            }
        });

        await prisma.room.update({
            where: {
                roomId: room.roomId
            },
            data: {
                messages: {
                    connect: {
                        messageId: message.messageId
                    }
                }
            }
        });

        io.to(roomCode).emit('send message', {
            message: message.message,
            sender: messageSender.name
        });

        console.log('Message sent successfully');
        return response_200(res, 'Message sent successfully');

    } catch (e) {
        response_500(res, 'Error sending message', e);
    }
}


export {
    removeUserFromRoom,
    addUserToRoom,
    createRoom,
    updateRoom,
    closeRoom,
    disconnectUserFromRoom,
    transferOwnership,
    acceptOrRejectPendingUser,
    leaderboardRoom,
    addQuiz,
    startQuiz,
    sendMessageAfterQuiz
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

export const getRoom = async (req, res) => {
    try {
        const { code } = req.body;

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

        return response_200(res, 'Room found', {
            roomId: room.roomId,
            roomName: room.roomName,
            roomDescription: room.roomDescription,
            code: room.code,
            isInviteOnly: room.isInviteOnly,
            isClosed: room.isClosed,
            users: room.users.map((user) => {
                return {
                    id: user.id,
                    name: user.name,
                    email: user.email
                };
            })
        });
    } catch (err) {
        return response_500(res, 'Error getting room', err);
    }
};

export const getRooms = async (req, res) => {
    try {
        const rooms = await prisma.room.findMany({
            include: {
                users: true
            }
        });

        return response_200(res, 'Rooms found', {
            rooms: rooms.map((room) => {
                return {
                    roomId: room.roomId,
                    roomName: room.roomName,
                    roomDescription: room.roomDescription,
                    code: room.code,
                    isInviteOnly: room.isInviteOnly,
                    isClosed: room.isClosed,
                    users: room.users.map((user) => {
                        return {
                            id: user.id,
                            name: user.name,
                            email: user.email
                        };
                    })
                };
            })
        });
    } catch (err) {
        return response_500(res, 'Error getting rooms', err);
    }
};

export const getRoomUsers = async (req, res) => {
    try {
        const { code } = req.body;

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

        return response_200(res, 'Users fetched successfully', {
            users: room.users.map((user) => {
                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    currPoints: user.currPoints,
                    userRoomId: user.userRoomId,
                    isCreator: user.isCreator
                };
            })
        });
    } catch (err) {
        return response_500(res, 'Error getting users', err);
    }
};

export const getRoomPendingUsers = async (req, res) => {
    try {
        const { code } = req.body;

        const room = await prisma.room.findUnique({
            where: {
                code: code
            },
            include: {
                pending: true
            }
        });

        if (!room) {
            return response_404(res, 'Room not found');
        }

        return response_200(res, 'Pending users found', {
            pending: room.pending.map((user) => {
                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                };
            })
        });
    } catch (err) {
        return response_500(res, 'Error getting pending users', err);
    }
};


