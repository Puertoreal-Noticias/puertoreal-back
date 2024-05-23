import express from "express";
import { NewsModel } from "../schemas/noticias-schema.js";
import { limitarNoticias } from "../helpers/limit-query-news.js";
const newsRouter = express.Router();
// GET /noticias: Obtener todas las noticias. menos destacado
newsRouter.get("/obtener", async (req, res) => {
  try {
    const noticias = await NewsModel.find({ destacado: { $ne: "si" } }).sort({
      fecha_publicacion: -1,
    });
    const limit = parseInt(req.query.limit) || noticias.length;
    const noticiasLimitadas = limitarNoticias(noticias, limit);
    res.status(200).json(noticiasLimitadas);
  } catch (err) {
    res.status(500).send(err);
  }
});
// GET obtener noticia destacada
newsRouter.get("/obtener/destacada", async (req, res) => {
  try {
    const noticia = await NewsModel.findOne({ destacado: "si" }).sort({
      fecha_publicacion: -1,
    });
    if (noticia) {
      res.status(200).json(noticia);
    } else {
      res.status(404).send("No se encontró ninguna noticia destacada");
    }
  } catch (err) {
    res.status(500).send(err);
  }
});

// Obtener todo lo mas recientes incluyendo destacados y no destacados
newsRouter.get("/obtener/recientes", async (req, res) => {
  try {
    const noticias = await NewsModel.find({}).sort({
      fecha_publicacion: -1,
    });
    const limit = parseInt(req.query.limit) || noticias.length;
    const noticiasLimitadas = limitarNoticias(noticias, limit);
    res.status(200).json(noticiasLimitadas);
  } catch (err) {
    res.status(500).send(err);
  }
});
newsRouter.get("/filtrar/:categoria", async (req, res) => {
  const categoria = req.params.categoria;
  const limit = parseInt(req.query.limit) || 0; // Si no se proporciona un límite, devuelve todas las noticias
  try {
    const noticias = await NewsModel.find({ categoria: categoria })
      .sort({ fecha_publicacion: -1 })
      .limit(limit);
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

newsRouter.get("/obtener/first/:categoria", async (req, res) => {
  const categoria = req.params.categoria;
  try {
    const noticia = await NewsModel.findOne({
      categoria,
      destacado: "si",
    }).sort({
      fecha_publicacion: -1,
    });
    // Ahora 'noticia' contiene la noticia más reciente y destacada de la categoría solicitada
    console.log(noticia);
    res.status(200).json(noticia);
  } catch (error) {
    // Manejar error
    res.status(500).send(error);
  }
});
newsRouter.get("/obtener/random/:categoria", async (req, res) => {
  const categoria = req.params.categoria;
  try {
    const noticias = await NewsModel.aggregate([
      { $match: { categoria } },
      { $sample: { size: 3 } },
    ]);
    // Ahora 'noticias' contiene hasta 3 noticias aleatorias de la categoría solicitada
    console.log(noticias);
    res.status(200).json(noticias);
  } catch (error) {
    // Manejar error
    res.status(500).send(error);
  }
});

newsRouter.get("/obtener/excepto-ultimo/:categoria", async (req, res) => {
  const categoria = req.params.categoria;
  try {
    const ultimaNoticia = await NewsModel.findOne({
      categoria,
      destacado: "si",
    }).sort({
      fecha_publicacion: -1,
    });
    const otrasNoticias = await NewsModel.find({
      categoria,
      destacado: { $ne: "si" },
      fecha_publicacion: { $ne: ultimaNoticia.fecha_publicacion },
    }).sort({ fecha_publicacion: -1 });
    const limit = parseInt(req.query.limit) || otrasNoticias.length; // Por defecto, muestra todas las noticias si no se proporciona un límite

    // Llama a la función para obtener las noticias limitadas
    const noticiasLimitadas = limitarNoticias(otrasNoticias, limit);
    // Ahora 'otrasNoticias' contiene todas las noticias excepto la más reciente de la categoría solicitada
    res.status(200).json(noticiasLimitadas);
  } catch (error) {
    // Manejar error
    res.status(500).send(error);
  }
});

// POST /noticias: Crear una nueva noticia.
newsRouter.post("/create-new", async (req, res) => {
  let { titulo, contenido, autor, categoria, subtitulo, destacado } = req.body;

  if (autor === "") {
    autor = undefined;
  }
  const noticia = new NewsModel({
    titulo,
    subtitulo,
    contenido,
    autor,
    categoria,
    destacado,
    fecha_publicacion: new Date(),
  });

  noticia
    .save()
    .then(() => res.status(201).json(noticia))
    .catch((err) => res.status(500).send(err));
});
// PATCH /noticias/:id: Actualizar una noticia específica por su ID.
newsRouter.patch("/modificar/:id", async (req, res) => {
  const id = req.params.id;
  const { titulo, contenido, autor, categoria, subtitulo } = req.body;
  if (!id) return res.status(401).send("No hay id");
  if (!titulo || !contenido || !autor || !categoria || !subtitulo) {
    return res.status(401).send("No hay ningun dato para modificar");
  }

  const noticiaModificada = await NewsModel.findById(id).exec();

  if (!noticiaModificada) {
    return res.sendStatus(400);
  }
  noticiaModificada.titulo = titulo;
  noticiaModificada.contenido = contenido;
  noticiaModificada.autor = autor;
  noticiaModificada.subtitulo = subtitulo;
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
