import mongoose from "mongoose";

export const ConnectToDb = async () => {
  await mongoose
    .connect(process.env.MONGO_URI || "")
    .then(() => console.log("Connected"))
    .catch((err) => console.log(err.message));
};
