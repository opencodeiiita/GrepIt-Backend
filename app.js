import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { connDB } from './src/config/db.config.js';
import { default as userAuthRoute } from './src/routes/v1/userAuth.routes.js';

dotenv.config();
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(morgan('dev'));

app.get('/', (req, res) => {
    res.send('Hello World');
});

app.use("/api/v1/auth/register", userAuthRoute);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}! 🚀`);
    connDB();
});
