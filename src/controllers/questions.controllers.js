import prisma from '../config/db.config.js';

async function addMultipleChoiceQuestion(req, res) {
    try {
        const  question = req.body.question;
        const options = req.body.options;
        const roomId = req.params.roomId;

        const newQuestion = await prisma.question.create({
            data: {
                question,
                roomId: Number(roomId),
                options: {
                    createMany: {
                        data: options.map(option => ({
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

        res.status(200).json({
            message: 'Question added successfully',
            question: newQuestion
        });
    } catch (error) {
        console.error(`Error adding question: ${error}`);
        res.status(500).json({
            error: 'Internal Server Error'
        });
    }
}

export { addMultipleChoiceQuestion };