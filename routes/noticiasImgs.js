import express from "express";
import fs from "fs";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { ImageModel, NewsModel } from "../schemas/noticias-schema.js";

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
imagesRouter.get("/obtener/:id", async (req, res) => {
  try {
    const imageId = req.params.id;
    const image = await ImageModel.findById(imageId);
    if (!image) {
      return res.status(404).send("Imagen no encontrada");
    }
    // Extraer el nombre del archivo de image.imagePath
    const filename = image.imagePath.split("\\").pop();
    // Modificar la respuesta para devolver la URL de la imagen
    res.status(200).json({
      url: `https://puertorealnoticias-back-production.up.railway.app/uploads/${filename}`,
    });
  } catch (error) {
    res.status(500).send(error);
  }
});
imagesRouter.post("/upload/:id", upload.single("imagen"), async (req, res) => {
  // Obtiene la ID de la noticia de los parámetros de la ruta
  const newsId = req.params.id;
  console.log("newsId:", newsId); // Verifica la ID de la noticia

  try {
    // Busca la noticia con la ID especificada
    const news = await NewsModel.findById(newsId);

    // Si la noticia no existe, retorna un error
    if (!news) {
      return res.status(404).send("Noticia no encontrada");
    }

    console.log("req.file.path:", req.file.path); // Verifica la ruta de la imagen

    // Crea un nuevo documento ImageModel con los detalles de la imagen
    const image = new ImageModel({
      imagePath: req.file.filename,
      newsId: newsId,
    });

    // Guarda la nueva imagen en la base de datos
    const savedImage = await image.save();
    console.log("savedImage:", savedImage); // Verifica la imagen guardada

    res.status(200).json({
      url: `https://puertorealnoticias-back-production.up.railway.app/uploads/${savedImage.imagePath}`,
    });
  } catch (error) {
    console.error("Error:", error); // Captura y registra cualquier error
    res.status(500).send(error);
  }
});

// Añadir imagen relacionada a una noticia
imagesRouter.post(
  "/add-img-relacionada/:id",
  upload.single("imagen"),
  async (req, res) => {
    try {
      const newsId = req.params.id;
      const news = await NewsModel.findById(newsId);
      if (!news) {
        return res.status(404).send("Noticia no encontrada");
      }
      const image = new ImageModel({
        imagePath: req.file.path,
        newsId: newsId,
      });
      const savedImage = await image.save();

      // Añadir la imagen a la lista de imágenes de la noticia
      news.imagenes.push(savedImage._id);
      await news.save();

      res.status(201).send(savedImage);
    } catch (error) {
      console.error(error);
      res.status(500).send(error);
    }
  }
);
// Eliminar imagen relacionada a una noticia
// Eliminar imagen relacionada a una noticia
// Eliminar imagen relacionada a una noticia
imagesRouter.delete(
  "/delete-img-relacionada/:newsId/:imgId",
  async (req, res) => {
    try {
      const newsId = req.params.newsId;
      const imgId = req.params.imgId;
      const image = await ImageModel.findById(imgId);
      if (!image) {
        return res.status(404).send("Imagen no encontrada");
      }
      const news = await NewsModel.findById(newsId);
      if (!news) {
        return res.status(404).send("Noticia no encontrada");
      }
      news.imagenes = news.imagenes.filter((id) => id.toString() !== imgId);
      await news.save();
      const result = await ImageModel.deleteOne({ _id: imgId });
      if (result.deletedCount === 0) {
        return res.status(404).send("Imagen no encontrada");
      }
      res.status(200).send("Imagen eliminada con éxito");
    } catch (error) {
      console.log(error);
      res.status(500).send(error);
    }
  }
);
imagesRouter.delete("/delete/:id", async (req, res) => {
  try {
    const imageId = req.params.id;
    const result = await ImageModel.deleteOne({ _id: imageId });
    if (result.deletedCount === 0) {
      return res.status(404).send("Imagen no encontrada");
    }
    res.status(200).send("Imagen eliminada con éxito");
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

// Actualizar

imagesRouter.put(
  "/actualizar/:id",
  upload.single("imagen"),
  async (req, res) => {
    const noticiaId = req.params.id;
    console.log(noticiaId);
    try {
      const noticia = await NewsModel.findById(noticiaId);
      if (!noticia) {
        return res.status(404).send("Noticia no encontrada");
      }

      const image = await ImageModel.findOne({ newsId: noticiaId });
      if (!image) {
        return res.status(404).send("Imagen no encontradaaaaa");
      }

      // Elimina la imagen antigua del sistema de archivos
      const oldImagePath = image.imagePath;
      fs.unlink(oldImagePath, (err) => {
        if (err) {
          console.error(`Error al eliminar el archivo de imagen: ${err}`);
        } else {
          console.log(`Archivo de imagen ${oldImagePath} eliminado`);
        }
      });

      // Actualiza la ruta de la imagen en la base de datos
      image.imagePath = req.file.path;
      const updatedImage = await image.save();

      res.status(200).send(updatedImage);
    } catch (error) {
      res.status(500).send(error);
    }
  }
);
// Imagen especifica

export default imagesRouter;
