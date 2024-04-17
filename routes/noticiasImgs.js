import express from "express";
import multer from "multer";

const imagesRouter = express.Router();

// Configura multer para guardar las imágenes subidas en la carpeta 'uploads'
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "../uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, new Date().toISOString() + file.originalname);
  },
});

const upload = multer({ storage: storage });

// Ruta para subir imágenes
imagesRouter.post(
  "/upload-image/:newsId",
  upload.single("image"),
  async (req, res) => {
    const { newsId } = req.params;

    // Comprueba si la noticia existe
    const noticia = await NewsModel.findById(newsId);
    if (!noticia) {
      return res.status(404).send("Noticia no encontrada");
    }

    // Crea una nueva imagen y asocia la noticia
    const newImage = new ImageModel({
      imagePath: req.file.path,
      newsId: newsId,
    });
    await newImage.save();

    // Añade la imagen a la noticia
    noticia.imagenes.push(newImage._id);
    await noticia.save();

    res.status(200).send("Imagen subida y asociada a la noticia");
  }
);

// GET /noticias/:id/imagenes: Obtener todas las imágenes de una noticia específica.

// DELETE /noticias/:id/imagenes/:imagenId: Eliminar una imagen específica de una notici
export default imagesRouter;
