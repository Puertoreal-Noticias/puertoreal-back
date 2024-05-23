import express from "express";
import { EventModel } from "../schemas/eventos-schema.js";

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
export default eventosRouter;
