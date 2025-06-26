const express = require('express');

const mongoose = require('mongoose');
const router = express.Router();
const jwt = require('jsonwebtoken');

// ==== Схема користувача ====
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  phone: String,
  role: { type: String, default: 'user' },
  isFrozen: { type: Boolean, default: false },
  address: String,
  avatar: String,
  cart: [
    {
      _id: { type: mongoose.Schema.Types.ObjectId, ref: 'Vinyl' },
      count: { type: Number, default: 1 }
    }
  ],
  paymentMethods: [
    {
      type: { type: String },
      details: { type: String }
    }
  ]
});

const User = mongoose.models.User || mongoose.model('User', userSchema, 'users');

// Отримання користувача за ID
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('cart._id');
    if (!user) return res.status(404).json({ message: 'Користувача не знайдено' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Помилка сервера', error: err.message });
  }
});

router.post('/by-ids', async (req, res) => {
  const { ids } = req.body;
  try {
    // ids - масив рядків з $oid, конвертуємо їх у ObjectId
    const objectIds = ids.map(id => mongoose.Types.ObjectId(id));
    const vinyls = await Vinyl.find({ _id: { $in: objectIds } });
    res.json(vinyls.map(v => ({
      ...v.toObject(),
      id: v._id.toString() // поле id для фронта!
    })));
  } catch (err) {
    res.status(500).json({ message: 'Error loading vinyls', error: err.message });
  }
});



// Оновлення корзини (додавання, оновлення кількості)
router.patch('/:id/cart', async (req, res) => {
  try {
    const { productId, count } = req.body;
    if (!productId) return res.status(400).json({ message: 'productId required' });

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Користувача не знайдено' });

    const item = user.cart.find(i => i._id.equals(productId));
    if (item) {
      item.count = count ?? (item.count + 1);
    } else {
      user.cart.push({ _id: productId, count: count ?? 1 });
    }

    await user.save();
    res.json(user.cart);
  } catch (err) {
    res.status(500).json({ message: 'Помилка сервера', error: err.message });
  }
});

// Видалення товару з корзини
router.patch('/:id/cart/remove', async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) return res.status(400).json({ message: 'productId required' });

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $pull: { cart: { _id: productId } } },
      { new: true }
    );

    if (!user) return res.status(404).json({ message: 'Користувача не знайдено' });

    res.json(user.cart);
  } catch (err) {
    res.status(500).json({ message: 'Помилка сервера', error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Користувача не знайдено' });
    }
    res.json({ message: 'Користувача видалено', user });
  } catch (err) {
    console.error('Помилка видалення користувача:', err);
    res.status(500).json({ message: 'Помилка сервера', error: err.message });
  }
});

router.patch('/:id/freeze', async (req, res) => {
  try {
    const { isFrozen } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { isFrozen }, { new: true });
    if (!user) return res.status(404).json({ message: 'Користувача не знайдено' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Помилка сервера', error: err.message });
  }
});

// === Отримати одного користувача ===
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Користувача не знайдено' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Помилка сервера', error: err.message });
  }
});

// === Додати користувача ===
router.post('/', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Користувач вже існує' });
    const user = new User({ name, email, password, role });
    await user.save();
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Помилка сервера', error: err.message });
  }
});


router.get('/', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});


// Очистка корзини
router.patch('/:id/cart/clear', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: { cart: [] } },
      { new: true }
    );

    if (!user) return res.status(404).json({ message: 'Користувача не знайдено' });

    res.json(user.cart);
  } catch (err) {
    res.status(500).json({ message: 'Помилка сервера', error: err.message });
  }
});

// CRM логін — тільки для admin/manager
router.post('/crm-login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Користувача не знайдено" });
    if (user.password !== password) return res.status(401).json({ message: "Невірний пароль" });
    if (user.isFrozen) return res.status(403).json({ message: "Обліковий запис заморожено" });

    if (user.role !== 'admin' && user.role !== 'manager') {
      return res.status(403).json({ message: "Доступ до CRM дозволено лише адміністраторам та менеджерам" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      "secret_key",
      { expiresIn: "7d" }
    );

    res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        avatar: user.avatar,
        role: user.role,
        cart: user.cart,
        paymentMethods: user.paymentMethods,
        isFrozen: user.isFrozen,
      },
      token
    });
  } catch (err) {
    res.status(500).json({ message: "Помилка сервера", error: err.message });
  }
});


// Авторизація користувача
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Користувача не знайдено" });
    if (user.password !== password) return res.status(401).json({ message: "Невірний пароль" });
    if (user.isFrozen) return res.status(403).json({ message: "Обліковий запис заморожено" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      "secret_key",
      { expiresIn: "7d" }
    );

    res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        avatar: user.avatar,
        role: user.role,
        cart: user.cart,
        paymentMethods: user.paymentMethods,
        isFrozen: user.isFrozen,
      },
      token
    });
  } catch (err) {
    res.status(500).json({ message: "Помилка сервера", error: err.message });
  }
});

// === Змінити роль користувача ===
router.patch('/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    if (!user) return res.status(404).json({ message: 'Користувача не знайдено' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Помилка сервера', error: err.message });
  }
});

// Реєстрація нового користувача
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Заповніть всі поля' });
  const existing = await User.findOne({ email });
  if (existing) return res.status(400).json({ message: 'Користувач вже існує' });
  const user = new User({ name, email, password });
  await user.save();
  res.json(user);
});

module.exports = router;
