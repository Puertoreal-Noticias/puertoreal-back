// const DTOP_PROPERTY_NAMES = ["email", "password"];
import { Type } from "@sinclair/typebox";
import addFormats from "ajv-formats";
import addErrors from "ajv-errors";

import Ajv from "ajv";

const loginDTOSchema = Type.Object(
  {
    email: Type.String({
      format: "email",
      errorMessage: "El email debe contener un correo electronico válido",
    }),
    password: Type.String({
      errorMessage: {
        errorMessage: "El tipo de password debe ser un string",
      },
    }),
  },
  {
    additionalProperties: false,
    errorMessage: {
      additionalProperties: "El formato del objeto no es válido",
    },
  }
);
const ajvInstance = new Ajv({ allErrors: true });
addFormats(ajvInstance, ["email"]).addKeyword("kind").addKeyword("modifier");
addErrors(ajvInstance);

const validate = ajvInstance.compile(loginDTOSchema);
const validateLoginDTO = (req, res, next) => {
  const isDtoValid = validate(req.body);
  if (!isDtoValid) {
    res
      .status(400)
      .send(ajvInstance.errorsText(validate.errors, { separator: "\n" }));
    return; // Detiene la ejecución si la validación falla
  }
  next();
  //   if (typeof loginDto !== "object")
  //     res.status(400).send("El body tiene que venir en formato json");

  //   const bodyPropertyNames = Object.keys(loginDto);
  //   const checkProperties =
  //     bodyPropertyNames === DTOP_PROPERTY_NAMES.length &&
  //     bodyPropertyNames.every((bodyPropertyNames) =>
  //       DTOP_PROPERTY_NAMES.includes(bodyPropertyNames)
  //     );
  //   if (!checkProperties)
  //     res.status(400).send("El body debe contener unicamente email y password");
};
export default validateLoginDTO;
