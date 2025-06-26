const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  vinylId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vinyl', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  text: { type: String, required: true },
  date: { type: Date, default: Date.now }
});
const Review = mongoose.models.Review || mongoose.model('Review', reviewSchema, 'reviews');

// Отримати коментарі
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.vinylId) {
      filter.vinylId = req.query.vinylId;
    }
    const reviews = await Review.find(filter)
      .populate('userId', 'name')
      .populate('vinylId', 'title artist');
    res.json(reviews);
  } catch (err) {
    console.error('Помилка отримання відгуків:', err);
    res.status(500).json({ message: 'Серверна помилка' });
  }
});

// Додати коментар
router.post('/', async (req, res) => {
  try {
    const { vinylId, rating, text, userId } = req.body;
    if (!vinylId || !rating || !text || !userId) {
      return res.status(400).json({ message: 'vinylId, rating, text, userId обовʼязкові' });
    }

    const newReview = new Review({
      vinylId,
      userId,
      rating,
      text
    });

    await newReview.save();
    const populatedReview = await Review.findById(newReview._id)
      .populate('userId', 'name')
      .populate('vinylId', 'title artist');
    res.json(populatedReview);
  } catch (err) {
    console.error('Помилка додавання відгуку:', err);
    res.status(500).json({ message: 'Серверна помилка' });
  }
});

// Видалити коментар
router.delete('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).send('Invalid ID');
    const result = await Review.findByIdAndDelete(req.params.id);
    if (result) res.send('Видалено');
    else res.status(404).send('Не знайдено');
  } catch (err) {
    res.status(500).send('Серверна помилка');
  }
});

module.exports = router;
