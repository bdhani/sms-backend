import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path, { dirname } from 'path'
import { fileURLToPath } from 'url'; 

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Allow multiple origins for CORS
const allowedOrigins = ["http://localhost:3000", "http://127.0.0.1:3000"];

app.use(cors({
  origin: true
}))

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("static"));
app.use(cookieParser());

// Routes import
import teamsRouter from "../src/routes/teams.routes.js";
import stocksRouter from "../src/routes/stocks.routes.js";
import newsRouter from "../src/routes/news.routes.js";
import transactionRouter from "../src/routes/transactions.routes.js";
import brokerRouter from "../src/routes/brokers.routes.js";

// Routes declaration
console.log(__dirname)
app.use('/frontend', express.static(path.join(__dirname, '/public')));

app.use("/api/v1/teams", teamsRouter);
app.use("/api/v1/stocks", stocksRouter);
app.use("/api/v1/news", newsRouter);
app.use("/api/v1/transactions", transactionRouter);
app.use("/api/v1/brokers", brokerRouter);

export { app };
