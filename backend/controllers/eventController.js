const Event = require('../models/event.model');

exports.createEvent = async (req, res) => {
  const { title, description, date, location } = req.body;
  try {
    const event = await Event.create({
      title,
      description,
      date,
      location,
      createdBy: req.user.id, // User ID de JWT
    });
    res.status(201).json(event);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getEvents = async (req, res) => {
  try {
    const events = await Event.find();
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

