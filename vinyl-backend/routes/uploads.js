const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});

const upload = multer({ storage });

router.post('/:type', upload.single('file'), (req, res) => {
  const { type } = req.params;
  if (!['vinyl', 'user'].includes(type)) {
    return res.status(400).json({ message: 'Непідтримуваний тип' });
  }
  res.json({ filePath: `/uploads/${req.file.filename}`, type });
});

module.exports = router;
