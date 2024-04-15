import express from "express";
import { USERS_BBDD } from "../bbdd.js";

const accountRouter = express.Router();
accountRouter.use((req, res, next) => {
  console.log(req.ip);
  next();
});

// Obtener los Detalles de una cuenta
accountRouter.get("/:guid", (req, res) => {
  const guid = req.params.guid;
  const user = USERS_BBDD.find((user) => {
    return user.guid === guid;
  });
  if (!user) {
    return res.sendStatus(404);
  } else {
    return res.send(user);
  }
});
// Crear una nueva cuenta a partir de guid y name
accountRouter.post("", (req, res) => {
  const { guid, name } = req.body;
  const user = USERS_BBDD.find((user) => {
    return user.guid === guid;
  });
  if (!guid || !name) {
    return res.sendStatus(400);
  }

  if (user) {
    return res.sendStatus(409);
  }

  USERS_BBDD.push({
    guid,
    name,
  });
  return res.send();
});
// Actualizar una cuenta
accountRouter.patch("/:guid", (req, res) => {
  const guid = req.params.guid;
  const { name } = req.body;
  const user = USERS_BBDD.find((user) => {
    return user.guid === guid;
  });
  if (!name) {
    return res.sendStatus(400);
  }
  if (!user) {
    return res.sendStatus(404);
  }
  // user.
  user.name = name;
  return res.send();
});
// Eliminar una cuenta
accountRouter.delete("/:guid", (req, res) => {
  const guid = req.params.guid;
  const userIndex = USERS_BBDD.findIndex((user) => {
    return user.guid === guid;
  });
  if (userIndex === -1) {
    console.log("HA ENTRADO MAL?");
    return res.sendStatus(404);
  }

  USERS_BBDD.splice(userIndex, 1);
  return res.send();
});

export default accountRouter;
