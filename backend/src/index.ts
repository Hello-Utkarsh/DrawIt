import { clerkMiddleware, requireAuth } from "@clerk/express";
import { ConnectToDb } from "./db/index";
import cors from "cors";
import user from "./routes/user";
import { Request, Response } from "express";
import { Webhook } from "svix";
import { Shapes } from "./db/schema";
const express = require("express");
const app = express();
const port = 3000;
const dotenv = require("dotenv");
dotenv.config();

app.use(clerkMiddleware());
app.use(cors({ origin: process.env.FRONTEND_DOMAIN }));

app.use(express.json());
app.use("/api/v1/user", requireAuth(), user);
app.post(
  "/api/webhooks",

  async (req: Request, res: Response) => {
    const SIGNING_SECRET = process.env.SIGNING_SECRET;

    if (!SIGNING_SECRET) {
      throw new Error(
        "Error: Please add SIGNING_SECRET from Clerk Dashboard to .env"
      );
    }

    const wh = new Webhook(SIGNING_SECRET);

    const headers = req.headers;
    const payload = req.body;

    const svix_id = headers["svix-id"];
    const svix_timestamp = headers["svix-timestamp"];
    const svix_signature = headers["svix-signature"];

    if (!svix_id || !svix_timestamp || !svix_signature) {
      return void res.status(400).json({
        success: false,
        message: "Error: Missing svix headers",
      });
    }

    let evt: any;

    try {
      evt = wh.verify(JSON.stringify(payload), {
        "svix-id": svix_id as string,
        "svix-timestamp": svix_timestamp as string,
        "svix-signature": svix_signature as string,
      });
    } catch (err: any) {
      console.log("Error: Could not verify webhook:", err.message);
      return void res.status(400).json({
        success: false,
        message: err.message,
      });
    }

    const { id } = evt.data;
    const eventType = evt.type;
    if (eventType == "user.deleted") {
      try {
        const deleteUser = await Shapes.findByIdAndDelete({ _id: id });
        if (deleteUser) {
          return res.status(200).json({
            success: true,
            message: "Webhook received",
          });
        }
        console.log("User not Found");
        return res.status(200).json({
          success: true,
          message: "Webhook received",
        });
      } catch (error: any) {
        console.log(error.message);
        return res.status(500).json({ message: error.message });
      }
    }
    if (eventType == "user.created") {
      try {
        const createUser = await Shapes.create({ _id: id });
        if (createUser) {
          return res.status(200).json({
            success: true,
            message: "Webhook received",
          });
        }
        console.log("User not created");
        return res.status(200).json({
          success: true,
          message: "Webhook received",
        });
      } catch (error: any) {
        console.log(error.message);
        return res.status(500).json({ message: error.message });
      }
    }
  }
);

app.listen(port, async () => {
  try {
    await ConnectToDb();
    console.log(`Example app listening on port ${port}`);
  } catch (error) {
    console.log(error);
  }
});
