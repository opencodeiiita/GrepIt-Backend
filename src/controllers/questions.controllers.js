import prisma from '../config/db.config.js';
import { response_200, response_500 } from '../utils/responseCodes.js';

async function addMultipleChoiceQuestion(req, res) {
    try {
        const question = req.body.question;
        const options = req.body.options;
        const roomCode = req.query.roomCode;

        const newQuestion = await prisma.question.create({
            data: {
                question,
                room: {
                    connect: {
                        code: roomCode
                    }
                },
                options: {
                    createMany: {
                        data: options.map((option) => ({
                            option: option.option,
                            isCorrect: option.isCorrect
                        }))
                    }
                }
            },
            include: {
                options: true
            }
        });

        response_200(res, 'Question added successfully', newQuestion);
    } catch (error) {
        console.error(`Error adding question: ${error}`);
        response_500(res, 'Error adding question', error);
    }
}

export { addMultipleChoiceQuestion };

