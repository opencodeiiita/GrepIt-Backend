import { io } from '../../app.js';
import prisma from '../config/db.config.js';
import { response_404, response_200, response_500 } from '../utils/responseCodes.js';


export const announce = async (req, res) => {
    try{
        const { code, message } = req.body;
        const room = await prisma.room.findUnique({
            where: {
                code: code
            }
        });

        if (!room) {
            return response_404(res, "Room not found");
        }

        io.to(room.code).emit('announcement', message);

        return response_200(res ,"Announcement sent");
    }
    catch (err) {
        return response_500(res, 'Error sending announcement', err);
    }
}