import mongoose from "mongoose";

const NewsSchema = mongoose.Schema({
  titulo: String,
  contenido: String,
  categoria: String,
  fecha_publicacion: Date, // Aquí solo especifica el tipo de dato
  autor: { type: String, default: "Equipo editorial" },
  imagenPrincipal: { type: mongoose.Schema.Types.ObjectId, ref: "Image" },
  imagenes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Image" }],
});

const ImageSchema = mongoose.Schema({
  imagePath: String,
  newsId: { type: mongoose.Schema.Types.ObjectId, ref: "News" },
});

const NewsModel = mongoose.model("News", NewsSchema);
const ImageModel = mongoose.model("Image", ImageSchema);

export { NewsModel, ImageModel };
