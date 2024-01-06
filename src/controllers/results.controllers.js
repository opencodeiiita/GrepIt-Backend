import prisma from '../config/db.config.js';
import {
    response_200,
    response_500
} from '../utils/responseCodes.js';

async function createResult (req,res) {
    try {
        const quizId = req.body.quizId;
        const optionsMarked = req.body.optionsMarked;
        const roomId = req.body.roomId
        const score = parseInt(req.body.score);

        const newResult = await prisma.result.create({
            data:{
                quiz:{
                    connect:{
                        quizId: quizId
                    }
                },
                optionsMarked,
                score,
                user : {
                    connect : {
                        id: req.user.id
                    }
                },
                room : {
                    connect: {
                        id: roomId
                    }
                }
            }
        })

        response_200(res, 'Result added successfully', newResult);
    }
    catch(error)
    {
        console.error(`Error creating results: ${error}`);
        response_500(res, 'Error creating result:', error);

    }
}

export { createResult };