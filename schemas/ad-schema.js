import mongoose from "mongoose";

const AdSchema = new mongoose.Schema({
  url: {
    type: String,
    required: false,
  },
  imgPath: {
    type: String,
    required: true,
  },
});

export const AdModel = mongoose.model("Ad", AdSchema);
