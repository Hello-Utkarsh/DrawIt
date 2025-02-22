import { Request, Response } from "express";
import { Shapes } from "../db/schema";

const express = require("express");
const shapesApi = express.Router();

shapesApi.get("/", async (req: Request, res: Response) => {
  const { userid } = req.headers;
  if (!userid) {
    return res.send("Please Signin").status(400);
  }
  const userCanvas = await Shapes.findById(userid);
  return res.json({ userCanvas }).status(200);
});

shapesApi.post("/", async (req: Request, res: Response) => {
  const { userid } = req.headers;
  const { shapes, newuser } =
    await req.body;
  if (newuser) {
    if (!userid) {
      return res.send("Please Signin").status(400);
    }
    try {
      const createdCanvas = await Shapes.create({ ...shapes, _id: userid });
      if (createdCanvas) {
        return res.json({ message: "Saved" }).status(201);
      }
      return res.send("Unable to create").status(200);
    } catch (error: any) {
      return res.send(error.message).status(error.status);
    }
  }
  try {
    const updateCanvas = await Shapes.findOneAndUpdate(
      { _id: userid },
      { ...shapes }
    );
    if (updateCanvas) {
      return res.json({ message: "Saved" }).status(200);
    }
    return res.send("Unable to save").status(400);
  } catch (error: any) {
    return res.send(error.message).status(error.status);
  }
});

shapesApi.delete("/", async (req: Request, res: Response) => {
  const { userid } = req.headers;
  if (!userid) {
    return res.send("Please Signin").status(400);
  }
  try {
    const deleteCanvas = await Shapes.findOneAndDelete({ _id: userid });
    if (deleteCanvas) {
      return res.json({ message: "deleted" }).status(204);
    }
    return res.send("Unable to delete").status(400);
  } catch (error: any) {
    return res.send(error.message).status(error.status);
  }
});

export default shapesApi;
