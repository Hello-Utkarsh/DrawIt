import { toNodeHandler } from "better-auth/*";
import { ConnectToDb } from "./db/index";
import cors from "cors";
import { auth } from "./auth";
const express = require("express");
const app = express();
const port = 3000;
const dotenv = require("dotenv");
dotenv.config();

app.all("/api/auth/*", toNodeHandler(auth));
app.use(
  cors({
    origin: process.env.FRONTEND_DOMAIN,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(express.json());

app.listen(port, async () => {
  try {
    await ConnectToDb();
    console.log(`Example app listening on port ${port}`);
  } catch (error) {
    console.log(error);
  }
});
