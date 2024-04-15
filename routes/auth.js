import { Router } from "express";
import checkEmailPassword from "../helpers/check-email-password.js";

const authRouter = Router();

// EndPoint pulico (No autenticado y no autorizado)

authRouter.get("/publico", (req, res) => {
  return res.send("EndPoint Publico");
});

// Endpoint autenticado

authRouter.post("/autenticado", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.sendStatus(400);
  }
  try {
    const user = checkEmailPassword(email, password);

    return res.send(`Usuario ${user.name} autenticado`);
  } catch (error) {
    return res.sendStatus(401);
  }
});

// Endpoint
// Para administradores
authRouter.post("/autorizado", (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.sendStatus(400);
    }
    const user = checkEmailPassword(email, password);

    if (user.role !== "admin") return res.sendStatus(403);

    res.send(`Administrador ${user.name} verificado`);
  } catch (error) {
    return res.sendStatus(401);
  }
});

export default authRouter;
