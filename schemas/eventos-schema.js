import mongoose from "mongoose";

const EventSchema = mongoose.Schema({
  titulo: String,
  descripcion: String,
  contenido: String,
  fecha_acto: String,
  fecha_publicacion: Date,
  imagenPrincipal: { type: mongoose.Schema.Types.ObjectId, ref: "ImageEvent" },
  //   imagenes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Image" }],
});

const ImageEventSchema = mongoose.Schema({
  imagePath: String,
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event" },
});

const EventModel = mongoose.model("Event", EventSchema);
const ImageEventModel = mongoose.model("ImageEvent", ImageEventSchema);

export { EventModel, ImageEventModel };
