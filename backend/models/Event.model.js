const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  createdBy: {
    type: Number, // <-- Correspond à l'id MySQL d’un utilisateur
    required: true,
  },
}, {
  timestamps: true,
});

const Event = mongoose.model('Event', eventSchema);


module.exports = Event;

