import express from "express";
import dotenv from "dotenv";
import accountRouter from "./routes/account.js";
import authRouter from "./routes/auth.js";

dotenv.config();

const PORT = process.env.PORT || 3001;
const expressApp = express();

expressApp.use(express.json());
expressApp.use(express.text());
expressApp.use("/account", accountRouter);
expressApp.use("/auth", authRouter);

expressApp.listen(PORT, () => {
  console.log(`Servidor levantado en el puerto, ${PORT}`);
});

// expressApp.post("/cuenta", (req, res) => {
//   console.log(req.body, "BODY");
//   console.log(req.query, "query");

//   res.status(200).send(req.body);
// console.log(req);
// });
