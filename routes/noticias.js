import express from "express";
import { NewsModel } from "../schemas/noticias-schema.js";

const newsRouter = express.Router();
// GET /noticias: Obtener todas las noticias.
newsRouter.get("", async (req, res) => {
  try {
    const noticias = await NewsModel.find();
    res.status(200).json(noticias);
  } catch (err) {
    res.status(500).send(err);
  }
});

// POST /noticias: Crear una nueva noticia.
newsRouter.post("/create-new", async (req, res) => {
  let { titulo, contenido, autor } = req.body;

  if (autor === "") {
    autor = undefined;
  }
  const noticia = new NewsModel({ titulo, contenido, autor });

  noticia
    .save()
    .then(() => res.status(201).send("Noticia creada"))
    .catch((err) => res.status(500).send(err));
});

// GET /noticias/:id: Obtener una noticia específica por su ID.
newsRouter.get;

// PATCH /noticias/:id: Actualizar una noticia específica por su ID.
newsRouter.patch;

// DELETE /noticias/:id: Eliminar una noticia específica por su ID.
newsRouter.delete;

export default newsRouter;
