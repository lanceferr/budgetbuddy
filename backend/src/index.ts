import express from 'express';
import http from 'http';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import cors from 'cors';
import mongoose from 'mongoose';
import 'dotenv/config';

import router from './router/index.ts';

const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:5173", // frontend URL
  credentials: true
}));

app.use(compression());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const server = http.createServer(app);

const PORT = process.env.PORT || 8080;

server.listen(PORT,() => {
	console.log(`Server running at http://localhost:${PORT}/`);
});

const MONGO_URL = process.env.MONGO_URL || "mongodb://localhost:27017/BudgetBuddyDb";

mongoose.Promise = Promise;
mongoose.connect(MONGO_URL);
mongoose.connection.on("error", (error: Error) => console.log(error));
mongoose.connection.once("open", () => {
	console.log(`Connected to MongoDB at ${MONGO_URL}`);
});

app.use('/', router());