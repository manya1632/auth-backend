import dotenv from "dotenv";
dotenv.config();
import express from "express";
const app =  express();
import cors from 'cors';
import connectDB from "./config/connectDB.js";
import userRoutes from "./routes/userRoutes.js";

app.use(cors());
app.use(express.json());
const port = process.env.PORT;
const DB_URL = process.env.DB_URL;

app.use("/api/user", userRoutes);

connectDB(DB_URL);

app.listen(port, () => {
    console.log(`Server is listening at ${port}`);
})