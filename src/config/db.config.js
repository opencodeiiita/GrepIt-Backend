/* eslint-disable no-unused-vars */
import dotenv from 'dotenv';
import mysql from 'mysql2';
dotenv.config();

// Create the connection to the database
export async function connDB() {
    const connection = mysql.createConnection(process.env.DATABASE_URL);
    console.log('Successfully connected to DB! ✨');
}

