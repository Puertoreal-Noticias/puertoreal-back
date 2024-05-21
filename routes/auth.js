import { Router } from "express";
import bcrypt from "bcrypt";
import userModel from "../schemas/user-schema.js";

const authRouter = Router();

// EndPoint pulico (No autenticado y no autorizado)

authRouter.get("/publico", (req, res) => {
  return res.send("EndPoint Publico");
});

authRouter.post("/login", async (req, res) => {
  console.log("Inicio de sesión iniciado");
  const { name, password } = req.body;

  console.log(`Nombre de usuario: ${name}`);
  console.log(`Contraseña: ${password}`);

  try {
    console.log("Buscando usuario en la base de datos...");
    const user = await userModel.findOne({ name });
    if (!user) {
      console.log("Usuario no encontrado:", name);
      return res.sendStatus(404);
    }

    console.log("Usuario encontrado, comparando contraseñas...");
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      console.log("Contraseña incorrecta:", password);
      return res.sendStatus(400);
    }

    console.log(`Usuario ${user.name} autenticado`);
    return res.send(`autenticado`);
  } catch (error) {
    console.log("Error durante el inicio de sesión:", error);
    return res.sendStatus(401);
  }
});
// Endpoint autenticado

authRouter.post("/autenticado", async (req, res) => {
  const { name, password } = req.body;
  if (!name || !password) {
    return res.sendStatus(400);
  }
  try {
    const user = await userModel.findOne({ name });
    if (!user) {
      console.log("Usuario no encontrado:", name);
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

export default authRouter;
