const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');

// Multer config — збереження в uploads/
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    // назва файлу: час + original
    const unique = Date.now() + '-' + file.originalname.replace(/\s+/g, '_');
    cb(null, unique);
  }
});
const upload = multer({ storage });

// ---- SCHEMA ----
const inventorySchema = new mongoose.Schema({
  stock: Number,
  warehouseLocation: String
}, { _id: false });

const categorySchema = new mongoose.Schema({
  id: Number,
  name: String
}, { _id: false });

const vinylSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, auto: true }, // автоматичний ObjectId
  title: String,
  artist: String,
  genre: String,
  price: Number,
  cover: String, // only filename!
  description: String,
  category: categorySchema,
  inventory: inventorySchema
});

const Vinyl = mongoose.models.Vinyl || mongoose.model('Vinyl', vinylSchema, 'vinyls');

// ---- ROUTES ----

// GET ALL
router.get('/', async (req, res) => {
  try {
    const vinyls = await Vinyl.find();
    res.json(vinyls);
  } catch (err) {
    console.error('Помилка отримання платівок:', err);
    res.status(500).send('Серверна помилка');
  }
});

router.get('/with-vinyls', async (req, res) => {
  try {
    const { userId } = req.query;

    const filter = {};
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      filter.userId = userId;
    }

    const orders = await Order.find(filter);
    const vinylIds = orders.flatMap(o => o.vinylID.map(v => v.id));
    const userIds = orders.map(o => o.userId);
    const managerIds = orders.map(o => o.assignedManager).filter(id => mongoose.Types.ObjectId.isValid(id));

    const [vinyls, users, managers] = await Promise.all([
      Vinyl.find({ _id: { $in: vinylIds.filter(mongoose.Types.ObjectId.isValid) } }),
      User.find({ _id: { $in: userIds.filter(mongoose.Types.ObjectId.isValid) } }),
      User.find({ _id: { $in: managerIds } })
    ]);

    const enriched = orders.map(order => {
      const vinylInfos = order.vinylID.map(v => {
        const found = vinyls.find(vi => vi._id.equals(v.id));
        return found
          ? { title: found.title, artist: found.artist, count: v.count }
          : { title: 'Невідомо', artist: 'Невідомо', count: v.count };
      });

      const user = users.find(u => u._id.equals(order.userId));
      const userInfo = user
        ? { name: user.name, email: user.email, phone: user.phone, address: user.address }
        : {};

      const manager = managers.find(m => m._id.equals(order.assignedManager));
      const managerInfo = manager
        ? { name: manager.name, email: manager.email }
        : null;

      return {
        ...order.toObject(),
        vinylInfos,
        userInfo,
        managerInfo
      };
    });

    res.json(enriched);
  } catch (err) {
    console.error('Помилка отримання замовлень:', err);
    res.status(500).send('Серверна помилка');
  }
});


// CREATE (with file)
router.post('/', upload.single('cover'), async (req, res) => {
  try {
    const data = req.body;
    if (req.file) data.cover = req.file.filename;
    const newVinyl = new Vinyl(data);
    await newVinyl.save();
    res.send('OK');
  } catch (err) {
    console.error('Помилка створення платівки:', err);
    res.status(500).send('Серверна помилка');
  }
});

router.post('/by-ids', async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({ message: 'Поле ids обовʼязкове і має бути масивом' });
    }

    // Використовуємо map + new ObjectId()
    const objectIds = ids.map(id => {
      if (mongoose.Types.ObjectId.isValid(id)) {
        return new mongoose.Types.ObjectId(id);
      } else {
        throw new Error(`Неправильний формат ID: ${id}`);
      }
    });

    const vinyls = await Vinyl.find({ _id: { $in: objectIds } });

    res.json(vinyls.map(v => ({
      ...v.toObject(),
      id: v._id.toString()
    })));
  } catch (err) {
    console.error('Помилка завантаження платівок за IDs:', err.message);
    res.status(500).json({ message: 'Серверна помилка', error: err.message });
  }
});


// UPDATE (with file, PATCH)
router.patch('/:id', upload.single('cover'), async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).send('Invalid ID');
    const data = req.body;

    // Якщо файл новий — оновлюємо cover, якщо ні — не чіпаємо старий
    if (req.file) {
      data.cover = req.file.filename;
    } else {
      // забираємо поле cover із апдейту, щоб воно не стало undefined/null
      delete data.cover;
    }
    const vinyl = await Vinyl.findByIdAndUpdate(req.params.id, data, { new: true });
    if (vinyl) res.json(vinyl);
    else res.status(404).send('Не знайдено');
  } catch (err) {
    console.error('Помилка оновлення платівки:', err);
    res.status(500).send('Серверна помилка');
  }
});

// DELETE
router.delete('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).send('Invalid ID');
    const result = await Vinyl.findByIdAndDelete(req.params.id);
    if (result) res.send('Видалено');
    else res.status(404).send('Не знайдено');
  } catch (err) {
    res.status(500).send('Серверна помилка');
  }
});

// vinyls.js (роут)
// Додавання до кошика (cart)
router.patch('/:id/cart', async (req, res) => {
  try {
    const { productId, count } = req.body;
    if (!productId) return res.status(400).json({ message: 'productId required' });

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Not found' });

    // ==== Ось тут виправляємо ====
    const ObjectId = mongoose.Types.ObjectId;
    const prodId = ObjectId(productId); // приводимо до ObjectId
    const item = user.cart.find(i => i._id.equals(prodId));

    if (item) {
      item.count = count ?? (item.count + 1);
    } else {
      user.cart.push({ _id: prodId, count: count ?? 1 });
    }

    await user.save();
    res.json(user.cart);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid ID' });
    }

    const vinyl = await Vinyl.findById(req.params.id);
    if (!vinyl) {
      return res.status(404).json({ message: 'Платівку не знайдено' });
    }

    res.json(vinyl);
  } catch (err) {
    console.error('Помилка завантаження платівки:', err);
    res.status(500).json({ message: 'Серверна помилка' });
  }
});

module.exports = router;
