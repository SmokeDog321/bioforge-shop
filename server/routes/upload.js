const express = require('express');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const auth = require('../middleware');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (req.query.type === 'model') {
      cb(null, path.join(__dirname, '../uploads/models'));
    } else {
      cb(null, path.join(__dirname, '../uploads'));
    }
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB for models
  fileFilter: (req, file, cb) => {
    const isModel = req.query.type === 'model';
    if (isModel) {
      const allowed = /glb|gltf|stl|obj/;
      const ext = allowed.test(path.extname(file.originalname).toLowerCase());
      if (ext) return cb(null, true);
      return cb(new Error('Only .glb, .gltf, .stl, .obj files allowed'));
    }
    const allowed = /jpeg|jpg|png|gif|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) return cb(null, true);
    cb(new Error('Only images allowed'));
  }
});

router.post('/', auth, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const isModel = req.query.type === 'model';
  const url = isModel ? `/uploads/models/${req.file.filename}` : `/uploads/${req.file.filename}`;
  res.json({ url });
});

module.exports = router;
