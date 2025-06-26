const Registration = require('../models/registration.model');
const Event = require('../models/event.model');

exports.registerToEvent = async (req, res) => {
  try {
    const { eventId } = req.body;
    await Registration.create({ user_id: req.user.id, event_mongo_id: eventId });
    res.status(201).json({ message: 'Registered successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getMyRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.findAll({ where: { user_id: req.user.id } });
    const eventIds = registrations.map(r => r.event_mongo_id);
    const events = await Event.find({ _id: { $in: eventIds } });
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
