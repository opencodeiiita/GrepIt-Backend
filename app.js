import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import morgan from "morgan";

dotenv.config();
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(morgan('dev'));

app.get("/", (req, res) => {
    res.send("Hello World");
});

app.listen(4000, () => {
    console.log(`Server is listening on port ${process.env.PORT}! 🚀`);
});
