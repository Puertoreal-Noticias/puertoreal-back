import express from "express";
import userModel from "../schemas/user-schema.js";
import bcrypt from "bcrypt";
const accountRouter = express.Router();
accountRouter.use((req, res, next) => {
  console.log(req.ip);
  next();
});

// Obtener los Detalles de una cuenta
accountRouter.get("/:guid", async (req, res) => {
  const guid = req.params.guid;
  const user = await userModel.findById(guid).exec();
  if (!user) {
    return res.sendStatus(404);
  } else {
    return res.send(user);
  }
});

accountRouter.post("/", async (req, res) => {
  const { name, password } = req.body;

  // Verifica si el usuario ya existe
  const existingUser = await userModel.findOne({ name });
  if (existingUser) {
    console.log("El usuario ya existe:", name);
    return res.status(400).send("El usuario ya existe");
  }

  // Hashea la contraseña antes de guardarla
  const hashedPassword = await bcrypt.hash(password, 10);

  // Crea el nuevo usuario
  const user = new userModel({
    name,
    password: hashedPassword,
  });

  await user.save();
  return res.send("Usuario creado");
});
// Actualizar una cuenta
accountRouter.patch("/:guid", async (req, res) => {
  const guid = req.params.guid;
  const { name } = req.body;
  const user = await userModel.findById(guid).exec();

  if (!name) {
    return res.sendStatus(400);
  }
  if (!user) {
    console.log(user);
    return res.sendStatus(404);
  }
  // user.
  user.name = name;

  await user.save();
  return res.send("Usuario modificado");
});

// Eliminar una cuenta
// Eliminar una cuenta
// Eliminar una cuenta
accountRouter.delete("/:id", async (req, res) => {
  try {
    const user = await userModel.findOneAndDelete({ _id: req.params.id });
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }
    res.status(200).send({ message: "User deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

export default accountRouter;
