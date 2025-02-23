import { Request, Response } from "express";
import { Shapes } from "../db/schema";

const express = require("express");
const user = express.Router();

user.get("/:userid", async (req: Request, res: Response) => {
  const { userid } = req.params;
  if (!userid) {
    return res.send("Please Signin").status(400);
  }
  try {
    const userCanvas = await Shapes.findById(userid);
    return res.json({ userCanvas }).status(200);
  } catch (error: any) {
    return res.send(error.message).status(error.status);
  }
});

user.post("/", async (req: Request, res: Response) => {
  const { shapes, userid } = await req.body;
  try {
    const updateCanvas = await Shapes.findOneAndUpdate(
      { _id: userid },
      { shapes },
      { upsert: true, new: true }
    );
    console.log(updateCanvas);
    if (updateCanvas) {
      return res.json({ message: "Saved" }).status(201);
    }
    return res.send("Unable to save").status(200);
  } catch (error: any) {
    return res.send(error.message).status(error.status);
  }
});

export default user;
