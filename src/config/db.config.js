import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
export default prisma;

export async function connDB() {
    try {
        await prisma.$connect();
        console.log(`Successfully connected to Database ✨`);
    } catch (error) {
        console.log(`Error occurred while connecting to Database ❌`);
        console.log(error);
    }
}

