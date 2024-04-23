import express from "express";
import { NewsModel } from "../schemas/noticias-schema.js";

const newsRouter = express.Router();
// GET /noticias: Obtener todas las noticias.
newsRouter.get("/obtener", async (req, res) => {
  try {
    const noticias = await NewsModel.find();
    res.status(200).json(noticias);
  } catch (err) {
    res.status(500).send(err);
  }
});
// GET /noticias/:id: Obtener una noticia específica por su ID.
newsRouter.get("/obtener/:id", async (req, res) => {
  const id = req.params.id;
  if (!id) return res.status(401).send("No hay id");

  const noticiaSeleccionada = await NewsModel.findById(id).exec();

  if (!noticiaSeleccionada) {
    return res.sendStatus(400);
  } else {
    return res.send(noticiaSeleccionada);
  }
});

// GET para filtrar por la categoria que le pasemos

// GET para filtrar por la categoria que le pasemos
newsRouter.get("/filtrar/:categoria", async (req, res) => {
  const categoria = req.params.categoria;
  try {
    const noticias = await NewsModel.find({ categoria: categoria });
    res.status(200).json(noticias);
  } catch (err) {
    res.status(500).send(err);
  }
});

// POST /noticias: Crear una nueva noticia.
newsRouter.post("/create-new", async (req, res) => {
  let { titulo, contenido, autor, categoria } = req.body;

  if (autor === "") {
    autor = undefined;
  }
  const noticia = new NewsModel({ titulo, contenido, autor, categoria });

  noticia
    .save()
    .then(() => res.status(201).send("Noticia creada"))
    .catch((err) => res.status(500).send(err));
});

// PATCH /noticias/:id: Actualizar una noticia específica por su ID.
newsRouter.patch("/modificar/:id", async (req, res) => {
  const id = req.params.id;
  const { titulo, contenido, autor, categoria } = req.body;
  if (!id) return res.status(401).send("No hay id");
  if (!titulo || !contenido || !autor || !categoria) {
    return res.status(401).send("No hay ningun dato para modificar");
  }

  const noticiaModificada = await NewsModel.findById(id).exec();

  if (!noticiaModificada) {
    return res.sendStatus(400);
  }
  noticiaModificada.titulo = titulo;
  noticiaModificada.contenido = contenido;
  noticiaModificada.autor = autor;
  noticiaModificada.categoria = categoria;

  await noticiaModificada.save();
  return res.send("Noticia modificada");
});

// DELETE /noticias/:id: Eliminar una noticia específica por su ID.
newsRouter.delete("/eliminar/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const result = await NewsModel.deleteOne({ _id: id }).exec();

    if (result.deletedCount === 0) {
      console.log("No se encontró el usuario para eliminar");
      return res.sendStatus(404);
    }

    return res.send("Noticia eliminado");
  } catch (error) {
    console.error(error);
    return res.sendStatus(500); // Devuelve un error 500 si algo sale mal
  }
});

export default newsRouter;
