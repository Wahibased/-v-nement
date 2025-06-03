const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt'); // Pour hacher les mots de passe si besoin
const Event = require('../models/Event.model');
const User = require('../models/User.model'); // Assure-toi que ce fichier existe

// Middleware d'authentification
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token.' });
  }
};

// ==========================================
// 🔐 LOGIN (route POST /login)
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid email or password' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// ==========================================
// 👤 PROFILE (route GET /profile)
router.get('/profile', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json(user);
  } catch (err) {
    console.error('Profile error:', err);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// ==========================================
// ⚙️ SETTINGS (fictive, route GET /settings)
router.get('/settings', authenticate, async (req, res) => {
  res.json({ message: 'Settings page (example)', userId: req.user.id });
});

// ==========================================
//  EVENTS – CRUD
// READ all events (GET /)
router.get('/', authenticate, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const sortOrder = req.query.sort === 'desc' ? -1 : 1;
    const filter = { createdBy: req.user.id };

    const totalEvents = await Event.countDocuments(filter);
    const totalPages = Math.ceil(totalEvents / limit);
    const events = await Event.find(filter)
      .sort({ date: sortOrder })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({ events, totalPages, page });
  } catch (err) {
    console.error('Erreur récupération événements :', err);
    res.status(500).json({ error: 'Failed to fetch events.' });
  }
});

// CREATE an event (POST /)
router.post('/', authenticate, async (req, res) => {
  const { title, date, location, description } = req.body;

  try {
    const event = new Event({
      title,
      date,
      location,
      description,
      createdBy: req.user.id,
    });

    await event.save();
    res.status(201).json(event);
  } catch (err) {
    console.error('Erreur création événement :', err);
    res.status(500).json({ error: 'Failed to create event.' });
  }
});

// READ ONE event (GET /:id)
router.get('/:id', authenticate, async (req, res) => {
  try {
    const event = await Event.findOne({
      _id: req.params.id,
      createdBy: req.user.id,
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found.' });
    }

    res.json(event);
  } catch (err) {
    console.error('Erreur récupération événement unique :', err);
    res.status(500).json({ error: 'Failed to fetch event.' });
  }
});

// UPDATE event (PUT /:id)
router.put('/:id', authenticate, async (req, res) => {
  const { title, date, location, description } = req.body;

  try {
    const event = await Event.findOne({
      _id: req.params.id,
      createdBy: req.user.id,
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found.' });
    }

    event.title = title ?? event.title;
    event.date = date ?? event.date;
    event.location = location ?? event.location;
    event.description = description ?? event.description;

    await event.save();
    res.json({ message: 'Event updated.', event });
  } catch (err) {
    console.error('Erreur mise à jour événement :', err);
    res.status(500).json({ error: 'Failed to update event.' });
  }
});

// DELETE event (DELETE /:id)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const deleted = await Event.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user.id,
    });

    if (!deleted) {
      return res.status(404).json({ error: 'Event not found or already deleted.' });
    }

    res.json({ message: 'Event deleted.' });
  } catch (err) {
    console.error('Erreur suppression événement :', err);
    res.status(500).json({ error: 'Failed to delete event.' });
  }
});

module.exports = router;

