const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  vinylID: [{ id: String, count: Number }],
  userId: String,
  status: String,
  isClosed: { type: Boolean, default: false },
  statusLog: [{ status: String, date: Date, by: String }],
  assignedManager: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  payment: {
    method: String,
    transactionId: String,
    amount: Number
  },
  shipment: {
    address: String,
    trackingNumber: String,
    status: String
  },
  comments: [{ text: String, author: String, date: Date }],
  files: [{ name: String, url: String }]
});


const Order = mongoose.models.Order || mongoose.model('Order', orderSchema, 'orders');
const Vinyl = mongoose.models.Vinyl || mongoose.model('Vinyl', new mongoose.Schema({ title: String, artist: String }), 'vinyls');
const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({
  name: String, email: String, phone: String, password: String, role: String, address: String, avatar: String
}), 'users');

router.patch('/:id/assign-manager', async (req, res) => {
  try {
    const { managerId, byRole = 'manager' } = req.body;

    if (!mongoose.Types.ObjectId.isValid(req.params.id) || !mongoose.Types.ObjectId.isValid(managerId)) {
      return res.status(400).send('Неправильний ID');
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).send('Замовлення не знайдено');

    // Якщо вже призначено менеджера — лише адмін може змінити
    if (order.assignedManager && byRole !== 'admin') {
      return res.status(403).send('Менеджера вже призначено. Лише адмін може змінити його.');
    }

    const manager = await User.findById(managerId);
    if (!manager || manager.role !== 'manager') {
      return res.status(400).send('Користувач не є менеджером');
    }

    const updated = await Order.findByIdAndUpdate(
      req.params.id,
      {
        assignedManager: managerId,
        $push: {
          statusLog: {
            status: 'ASSIGNED_MANAGER',
            date: new Date(),
            by: byRole
          }
        }
      },
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    console.error('Помилка при закріпленні менеджера:', err);
    res.status(500).send('Серверна помилка');
  }
});



router.get('/with-vinyls', async (req, res) => {
  try {
    const orders = await Order.find();
    const vinylIds = orders.flatMap(o => o.vinylID.map(v => v.id));
    const userIds = orders.map(o => o.userId);

    const [vinyls, users] = await Promise.all([
      Vinyl.find({ _id: { $in: vinylIds.filter(mongoose.Types.ObjectId.isValid) } }),
      User.find({ _id: { $in: userIds.filter(mongoose.Types.ObjectId.isValid) } })
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
        ? { name: user.name, email: user.email, phone: user.phone }
        : {};

      return {
        ...order.toObject(),
        address: order.shipment?.address || '—',
        vinylInfos,
        userInfo
      };
    });

    res.json(enriched);
  } catch (err) {
    console.error('Помилка отримання замовлень:', err);
    res.status(500).send('Серверна помилка');
  }
});



router.patch('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).send('Invalid order ID');
    let { status, byRole = 'manager' } = req.body;
    if (!status) return res.status(400).send('Missing status');
    status = status.toUpperCase();
    const allowedStatuses = ['НОВЕ', 'В ОБРОБЦІ', 'ВІДПРАВЛЕНО', 'ВИКОНАНО', 'ВІДХИЛЕНО'];
    if (!allowedStatuses.includes(status)) return res.status(400).send(`Недопустимий статус: ${status}`);
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).send('Order not found');
    if (order.isClosed && byRole !== 'admin') return res.status(403).send('Замовлення закрите. Лише адмін може змінювати його.');

    // ==== СПИСАННЯ ЗІ СКЛАДУ ====
    if (status === 'ВИКОНАНО' && !order.isClosed) {
      for (const item of order.vinylID) {
        const vinyl = await Vinyl.findById(item.id);
        if (vinyl?.inventory?.stock != null) {
          vinyl.inventory.stock = Math.max(0, vinyl.inventory.stock - item.count);
          await vinyl.save();
        }
      }
    }

    let isClosedUpdate = order.isClosed;
    if (status === 'ВИКОНАНО' || status === 'ВІДХИЛЕНО') isClosedUpdate = true;

    const updated = await Order.findByIdAndUpdate(
      req.params.id,
      {
        status,
        isClosed: isClosedUpdate,
        $push: { statusLog: { status, date: new Date(), by: byRole } }
      },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    console.error('Помилка оновлення замовлення:', err);
    res.status(500).send('Серверна помилка');
  }
});



router.patch('/:id/reopen', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).send('Invalid order ID');
    const { byRole = 'user' } = req.body;
    if (byRole !== 'admin') return res.status(403).send('Тільки адмін може відкривати замовлення');

    const updated = await Order.findByIdAndUpdate(
      req.params.id,
      {
        isClosed: false,
        $push: { statusLog: { status: 'REOPENED', date: new Date(), by: byRole } }
      },
      { new: true }
    );
    if (!updated) return res.status(404).send('Order not found');
    res.json(updated);
  } catch (err) {
    res.status(500).send('Серверна помилка');
  }
});

router.post('/', async (req, res) => {
  try {
    const { vinylID, userId, payment, shipment = {}, files = [] } = req.body;

    if (!vinylID || !Array.isArray(vinylID) || !vinylID.length) {
      return res.status(400).json({ message: 'Список товарів обовʼязковий' });
    }

    if (!userId) {
      return res.status(400).json({ message: 'userId обовʼязковий' });
    }

    const newOrder = new Order({
      vinylID,
      userId,
      status: 'НОВЕ',
      statusLog: [{ status: 'НОВЕ', date: new Date(), by: 'user' }],
      payment: {
        method: payment?.method || 'невідомо',
        amount: payment?.amount || 0,
        transactionId: payment?.transactionId || ''
      },
      shipment: {
        address: shipment?.address || '',
        trackingNumber: shipment?.trackingNumber || '',
        status: shipment?.status || 'Очікує обробки'
      },
      comments: [],
      files
    });

    await newOrder.save();

    res.json({ message: 'Замовлення створено', order: newOrder });
  } catch (err) {
    console.error('Помилка створення замовлення:', err);
    res.status(500).json({ message: 'Серверна помилка', error: err.message });
  }
});



module.exports = router;
