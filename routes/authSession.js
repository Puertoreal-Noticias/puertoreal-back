import { Router } from "express";
import checkEmailPassword from "../helpers/check-email-password.js";
import { nanoid } from "nanoid";
import { USERS_BBDD } from "../bbdd.js";

const sessions = [];
const authSessionRouter = Router();

// Login con email y password

authSessionRouter.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.sendStatus(400);
  try {
    const { guid } = checkEmailPassword(email, password);
    const sesionId = nanoid();
    sessions.push({ sesionId, guid });
    res.cookie("sesionId", sesionId, {
      httpOnly: true,
    });

    return res.send();
  } catch (error) {
    return res.sendStatus(401);
  }
});

// Solicitud autenticada con sesion para obtener el perfil del usuario

authSessionRouter.get("/profile", (req, res) => {
  const { cookies } = req;

  if (!cookies.sesionId) return res.sendStatus(401);

  const userSession = sessions.find(
    (session) => session.sesionId === cookies.sesionId
  );

  if (!userSession) return res.sendStatus(401);

  const user = USERS_BBDD.find((user) => user.guid === userSession.guid);

  if (!user) return res.sendStatus(401);
  delete user.password;
  return res.send(user);
});
export default authSessionRouter;
