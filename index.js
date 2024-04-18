import express from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import accountRouter from "./routes/account.js";
import authRouter from "./routes/auth.js";
import authToken from "./routes/authToken.js";
import authSession from "./routes/authSession.js";
import mongoose from "mongoose";
import newsRouter from "./routes/noticias.js";
import imagesRouter from "./routes/noticiasImgs.js";
dotenv.config();

const PORT = process.env.PORT || 3001;
const expressApp = express();
expressApp.use(cookieParser());
expressApp.use(express.json());
expressApp.use(express.text());
expressApp.use("/account", accountRouter);
expressApp.use("/auth", authRouter);

expressApp.use("/authToken", authToken);
expressApp.use("/authSession", authSession);

expressApp.use("/noticias", newsRouter);
expressApp.use("/imgs", imagesRouter);

const bootstrap = async () => {
  await mongoose.connect(process.env.MONGODB_URL);
  expressApp.listen(PORT, () => {
    console.log(`Servidor levantado en el puerto, ${PORT}`);
  });
};
// expressApp.post("/cuenta", (req, res) => {
//   console.log(req.body, "BODY");
//   console.log(req.query, "query");

//   res.status(200).send(req.body);
// console.log(req);
// });
bootstrap();
