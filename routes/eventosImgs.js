import express from "express";
import multer from "multer";
import { EventModel, ImageEventModel } from "../schemas/eventos-schema.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const imagesEventRouter = express();
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

imagesEventRouter.get("/obtener/:id", async (req, res) => {
  try {
    const imageId = req.params.id;
    const image = await ImageEventModel.findById(imageId);
    if (!image) {
      return res.status(404).send("Imagen no encontrada");
    }
    // Extraer el nombre del archivo de image.imagePath
    const filename = image.imagePath.split("\\").pop();
    // Modificar la respuesta para devolver la URL de la imagen
    res.status(200).json({ url: `http://localhost:3000/uploads/${filename}` });
  } catch (error) {
    res.status(500).send(error);
  }
});
imagesEventRouter.post(
  "/crear/:id",
  upload.single("imagen"),
  async (req, res) => {
    const eventId = req.params.id;
    try {
      const evento = await EventModel.findById(eventId);
      if (!evento) {
        return res.status(404).send("Evento no encontrado");
      }
      const newImage = new ImageEventModel({
        imagePath: req.file.path,
        eventId,
      });
      const savedImageEvent = await newImage.save();
      console.log(savedImageEvent);
      if (!evento.imagenPrincipal) {
        evento.imagenPrincipal = savedImageEvent._id;
        await evento.save();
      }
      console.log(evento);
      res.status(201).send(savedImageEvent);
    } catch (error) {
      res.status(500).send(error);
    }
  }
);

// Eliminar imagen por id
imagesEventRouter.delete("/eliminar/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const result = await ImageEventModel.deleteOne({ _id: id }).exec();

    if (result.deletedCount === 0) {
      console.log("No se encontró la imagen para eliminar");
      return res.sendStatus(404);
    }

    return res.send("Imagen eliminada");
  } catch (error) {
    console.error(error);
  }
});

export default imagesEventRouter;
