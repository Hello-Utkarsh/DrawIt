import mongoose from "mongoose";
const shapesTypes = [
  "rectangle",
  "circle",
  "line",
  "freehand",
  "arrow",
  "text",
];

export const shapeSchema = new mongoose.Schema({
  type: { type: String, enum: shapesTypes },
  start: { x: Number, y: Number, _id: false },
  end: { x: Number, y: Number, _id: false },
  points: [{ x: Number, y: Number, _id: false }],
  width: Number,
  height: Number,
  centerX: Number,
  centerY: Number,
  radius: Number,
  content: String,
  lineWidth: Number,
  color: String,
  fontSize: Number,
});
