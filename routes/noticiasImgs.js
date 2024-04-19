import express from "express";
import multer from "multer";
import { ImageModel, NewsModel } from "../schemas/noticias-schema.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const imagesRouter = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadFolder = path.join(__dirname, "../uploads");

// Verifica si la carpeta de uploads existe y la crea si no existe
fs.access(uploadFolder, (error) => {
  if (error) {
    console.log("La carpeta de uploads no existe. Creándola...");
    fs.mkdir(uploadFolder, (error) => {
      if (error) {
        console.error("Error al crear la carpeta de uploads:", error);
      } else {
        console.log("Carpeta de uploads creada con éxito.");
      }
    });
  }
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadFolder);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

imagesRouter.get("/obtener", async (req, res) => {
  try {
    const imgs = await ImageModel.find();
    res.status(200).json(imgs);
  } catch (error) {
    res.status(500).send(error);
  }
});

imagesRouter.post("/upload/:id", upload.single("imagen"), async (req, res) => {
  // Obtiene la ID de la noticia de los parámetros de la ruta
  const newsId = req.params.id;

  try {
    // Busca la noticia con la ID especificada
    const news = await NewsModel.findById(newsId);

    // Si la noticia no existe, retorna un error
    if (!news) {
      return res.status(404).send("Noticia no encontrada");
    }

    // Crea un nuevo documento ImageModel con los detalles de la imagen
    const image = new ImageModel({
      imagePath: req.file.path,
      newsId: newsId,
    });

    // Guarda la nueva imagen en la base de datos
    const savedImage = await image.save();

    // Si la noticia no tiene una imagen principal, establece la nueva imagen como la imagen principal
    if (!news.imagenPrincipal) {
      news.imagenPrincipal = savedImage._id;
      await news.save();
    } else {
      // Si la noticia ya tiene una imagen principal, agrega la nueva imagen al array de imagenes
      news.imagenes.push(savedImage._id);
      await news.save();
    }

    // Envía los detalles de la nueva imagen guardada en la respuesta
    res.status(201).json(savedImage);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Resto de tu código...
export default imagesRouter;
