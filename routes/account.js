import express from "express";
import { USERS_BBDD } from "../bbdd.js";
import userModel from "../schemas/user-schema.js";

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
// Crear una nueva cuenta a partir de guid y name
accountRouter.post("", async (req, res) => {
  const { guid, name } = req.body;
  const user = await userModel.findById(guid).exec();

  // const user = USERS_BBDD.find((user) => {
  //   return user.guid === guid;
  // });
  if (!guid || !name) {
    return res.sendStatus(400);
  }

  if (user) {
    return res.status(409).send("Usuario ya registrado");
  }
  const newUser = new userModel({ _id: guid, name });
  await newUser.save();
  // USERS_BBDD.push({
  //   guid,
  //   name,
  // });
  return res.send("Usuario registrado");
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
    return res.sendStatus(404);
  }
  // user.
  user.name = name;

  await user.save();
  return res.send("Usuario modificado");
});

// Eliminar una cuenta
accountRouter.delete("/:guid", async (req, res) => {
  const guid = req.params.guid;

  try {
    const result = await userModel.deleteOne({ _id: guid }).exec();

    if (result.deletedCount === 0) {
      console.log("No se encontró el usuario para eliminar");
      return res.sendStatus(404);
    }

    return res.send("Usuario eliminado");
  } catch (error) {
    console.error(error);
    return res.sendStatus(500); // Devuelve un error 500 si algo sale mal
  }
});
export default accountRouter;
