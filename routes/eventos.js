import express from "express";
import { EventModel, ImageEventModel } from "../schemas/eventos-schema.js";
import imagesEventRouter from "./eventosImgs.js";

import fs from "fs";
import path from "path";

const eventosRouter = express.Router();

eventosRouter.get("/obtener", async (req, res) => {
  try {
    const eventos = await EventModel.find({}).sort({ fecha_publicacion: -1 });
    res.status(200).json(eventos);
  } catch (err) {
    res.status(500).send(err);
  }
});
eventosRouter.get("/obtener/:id", async (req, res) => {
  const eventoId = req.params.id;
  try {
    const evento = await EventModel.findById(eventoId);
    if (!evento) {
      return res.status(404).send("Evento no encontrado");
    }
    res.status(200).json(evento);
  } catch (err) {
    res.status(500).send(err);
  }
});

eventosRouter.post("/crear", async (req, res) => {
  const { titulo, descripcion, contenido, fecha_acto, fecha_publicacion } =
    req.body;
  try {
    const nuevoEvento = new EventModel({
      titulo,
      descripcion,
      contenido,
      fecha_acto,
      fecha_publicacion: new Date(),
    });
    await nuevoEvento.save();
    res.status(201).send(nuevoEvento);
  } catch (err) {
    res.status(500).send(err);
  }
});

// PATCH /eventos/:id: Actualizar un evento específica por su ID.

eventosRouter.patch("/actualizar/:id", async (req, res) => {
  const eventId = req.params.id;
  const { titulo, descripcion, contenido, fecha_acto } = req.body;
  if (!eventId) return res.status(401).send("No hay id");
  if (!titulo || !descripcion || !contenido || !fecha_acto) {
    return res.status(401).send("No hay ningun dato para modificar");
  }
  const eventoModificado = await EventModel.findById(eventId).exec();
  if (!eventoModificado) {
    return res.sendStatus(400);
  }
  eventoModificado.titulo = titulo;
  eventoModificado.descripcion = descripcion;
  eventoModificado.contenido = contenido;
  eventoModificado.fecha_acto = fecha_acto;
  await eventoModificado.save();
  return res.send("Evento modificado");
});
// Eliminar evento por id y llamar a la funcion de eliminar imagen

eventosRouter.delete("/eliminar/:id", async (req, res) => {
  const eventId = req.params.id;
  try {
    const evento = await EventModel.findById(eventId);
    if (!evento) {
      return res.status(404).send("Evento no encontrado");
    }
    await evento.deleteOne();
    console.log(`Evento con id ${eventId} eliminado`);

    // Busca la imagen asociada al evento
    const image = await ImageEventModel.findOne({ eventId: eventId });

    // Si se encuentra una imagen, elimínala
    if (image) {
      await ImageEventModel.deleteOne({ _id: image._id });
      console.log(`Imagen con id ${image._id} eliminada`);

      // Elimina el archivo de imagen de la carpeta uploads
      const imagePath = path.join("uploads", image.imagePath);
      fs.unlink(imagePath, (err) => {
        if (err) {
          console.error(`Error al eliminar el archivo de imagen: ${err}`);
        } else {
          console.log(`Archivo de imagen ${imagePath} eliminado`);
        }
      });
    }

    res.status(200).json({ message: "Evento eliminado" });
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

export default eventosRouter;
