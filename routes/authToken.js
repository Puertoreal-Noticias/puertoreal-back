import { Router } from "express";
import checkEmailPassword from "../helpers/check-email-password.js";
import { SignJWT, jwtVerify } from "jose";
import { USERS_BBDD } from "../bbdd.js";

const authTokenRouter = Router();

// login con email y password
authTokenRouter.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.sendStatus(400);
  try {
    const { guid } = checkEmailPassword(email, password);
    // Generar token y devolver token
    // genera el secreto del token
    const encoder = new TextEncoder();
    const jwtConstructor = new SignJWT({ guid });
    const jwt = await jwtConstructor
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .setIssuedAt()
      .setExpirationTime("1h")
      .sign(encoder.encode(process.env.JWT_PRIVATE_KEY));
    return res.send({ jwt });
  } catch (error) {
    return res.sendStatus(401);
  }
});
// solicitud autenticada con token para obtener el perfil del usuario

authTokenRouter.get("/profile", async (req, res) => {
  const { authorization } = req.headers;
  console.log(authorization);
  if (!authorization) return res.sendStatus(401);

  try {
    const encoder = new TextEncoder();

    const { payload } = await jwtVerify(
      authorization,
      encoder.encode(process.env.JWT_PRIVATE_KEY)
    );

    const user = USERS_BBDD.find((user) => user.guid === payload.guid);

    if (!user) return res.sendStatus(401);
    console.log("ha pasado de aqui");
    delete user.password;
    return res.send(user);
  } catch (error) {
    console.log("Error capturado", error);
    return res.sendStatus(401);
  }
});
export default authTokenRouter;
