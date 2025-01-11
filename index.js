import express from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import cors from "cors";

import accountRouter from "./routes/account.js";
import authRouter from "./routes/auth.js";
import authToken from "./routes/authToken.js";
import authSession from "./routes/authSession.js";
import mongoose from "mongoose";
import newsRouter from "./routes/noticias.js";
import imagesRouter from "./routes/noticiasImgs.js";
import eventosRouter from "./routes/eventos.js";
import imagesEventRouter from "./routes/eventosImgs.js";
import adRouter from "./routes/ad.js";
dotenv.config();

const PORT = process.env.PORT || 3001;
const expressApp = express();

// Middleware CORS manual
expressApp.use((req, res, next) => {
  res.header(
    "Access-Control-Allow-Origin",
    "https://puertoreal-noticias-front.vercel.app"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  next();
});

expressApp.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? "https://puertoreal-noticias-front.vercel.app"
        : "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// Sirve imágenes estáticas desde el directorio 'uploads'
expressApp.use("/uploads", express.static("uploads"));

// otros middlewares...
expressApp.use(cookieParser());
expressApp.use(express.json());
expressApp.use(express.text());

// tus rutas...
expressApp.use("/account", accountRouter);
expressApp.use("/auth", authRouter);
expressApp.use("/authToken", authToken);
expressApp.use("/authSession", authSession);
expressApp.use("/noticias", newsRouter);
expressApp.use("/event", eventosRouter);
expressApp.use("/news-imgs", imagesRouter);
expressApp.use("/event-imgs", imagesEventRouter);
expressApp.use("/anuncios", adRouter);

const bootstrap = async () => {
  await mongoose.connect(process.env.MONGODB_URL);
  expressApp.listen(PORT, () => {
    console.log(`Servidor levantado en el puerto ${PORT}`);
  });
};
bootstrap();
