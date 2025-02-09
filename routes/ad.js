import express from "express";
import multer from "multer";
import { AdModel } from "../schemas/ad-schema.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const adRouter = express.Router();

// Configuración de __dirname para ES6
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración de Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, "../uploads");
    // Verifica si la carpeta de uploads existe y la crea si no existe
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath);
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

// Obtener todos los anuncios
// Obtener los últimos anuncios
adRouter.get("/obtener", async (req, res) => {
  const limit = parseInt(req.query.limit) || 0;
  try {
    const ads = await AdModel.find({}).sort({ _id: -1 }).limit(limit); // Ordenar por ID descendente y limitar
    res.status(200).json(ads);
  } catch (err) {
    res.status(500).send(err);
  }
});
adRouter.post("/crear", upload.single("image"), async (req, res) => {
  const { url } = req.body;
  const imgPath = `https://puertoreal-back-production.up.railway.app/uploads/${req.file.filename}`; // URL fija del despliegue

  // Si no se proporciona URL, se puede dejar en blanco o no incluirla
  const ad = new AdModel({
    url: url || "", // Si no se proporciona URL, se guarda como una cadena vacía
    imgPath,
  });

  try {
    await ad.save();
    res.status(201).json(ad);
  } catch (err) {
    res.status(500).send(err);
  }
});

adRouter.patch("/modificar/:id", upload.single("image"), async (req, res) => {
  const id = req.params.id;
  const { url } = req.body;
  const imgPath = req.file
    ? `https://puertoreal-back-production.up.railway.app/uploads/${req.file.filename}`
    : req.body.imgPath; // URL fija del despliegue o la anterior imagen si no hay nueva

  try {
    const ad = await AdModel.findById(id);

    if (!ad) {
      return res.status(404).send("Anuncio no encontrado");
    }

    // Si la URL se proporciona, actualízala. Si no, se deja la anterior.
    ad.url = url || ad.url; // Si no se proporciona URL, mantiene la anterior
    ad.imgPath = imgPath;

    await ad.save();
    res.status(200).json(ad);
  } catch (err) {
    res.status(500).send(err);
  }
});

// Eliminar un anuncio específico por su ID
adRouter.delete("/eliminar/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const result = await AdModel.deleteOne({ _id: id });

    if (result.deletedCount === 0) {
      return res.status(404).send("Anuncio no encontrado");
    }

    res.status(200).send("Anuncio eliminado");
  } catch (err) {
    res.status(500).send(err);
  }
});

export default adRouter;
