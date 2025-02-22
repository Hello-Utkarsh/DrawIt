import {
  clerkClient,
  clerkMiddleware,
  getAuth,
  requireAuth,
} from "@clerk/express";
import { ConnectToDb } from "./db/index";
import cors from "cors";
import { Request, Response } from "express";
import shapesApi from "./routes/shape";
const express = require("express");
const app = express();
const port = 3000;
const dotenv = require("dotenv");
dotenv.config();

app.use(clerkMiddleware());
app.use(cors({ origin: process.env.FRONTEND_DOMAIN }));

app.use(express.json());
app.use("/api/v1", shapesApi);

app.listen(port, async () => {
  try {
    await ConnectToDb();
    console.log(`Example app listening on port ${port}`);
  } catch (error) {
    console.log(error);
  }
});
