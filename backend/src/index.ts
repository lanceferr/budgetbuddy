import express from 'express';
import http from 'http';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import cors from 'cors';
import mongoose from 'mongoose';

import router from './router/index.ts';

const app = express();

app.use(cors({
  origin: "http://localhost:3000", // frontend URL
  credentials: true
}));

app.use(compression());
app.use(cookieParser());
app.use(express.json());

const server = http.createServer(app);

server.listen(8080,() => {
	console.log("Server running at http://localhost:8080/");
});

const MONGO_URL = "mongodb://localhost:27017/BudgetBuddyDb";

mongoose.Promise = Promise;
mongoose.connect(MONGO_URL);
mongoose.connection.on("error", (error: Error) => console.log(error))

app.use('/', router());