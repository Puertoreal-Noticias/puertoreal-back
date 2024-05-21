import { Router } from "express";
import bcrypt from "bcrypt";

const authRouter = Router();

// EndPoint pulico (No autenticado y no autorizado)

authRouter.get("/publico", (req, res) => {
  return res.send("EndPoint Publico");
});

// Endpoint autenticado

authRouter.post("/autenticado", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.sendStatus(400);
  }
  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      console.log("Usuario no encontrado:", email);
      return res.sendStatus(404);
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      console.log("Contraseña incorrecta:", password);
      return res.sendStatus(400);
    }

    return res.send(`Usuario ${user.name} autenticado`);
  } catch (error) {
    console.log("Error:", error);
    return res.sendStatus(401);
  }
});

authRouter.post("/autorizado", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.sendStatus(400);
  }
  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      console.log("Usuario no encontrado:", email);
      return res.sendStatus(404);
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      console.log("Contraseña incorrecta:", password);
      return res.sendStatus(400);
    }

    if (user.role !== "admin") return res.sendStatus(403);

    return res.send(`Administrador ${user.name} verificado`);
  } catch (error) {
    console.log("Error:", error);
    return res.sendStatus(401);
  }
});

export default authRouter;
