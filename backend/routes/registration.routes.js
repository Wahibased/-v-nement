const express = require('express');
const { registerToEvent, getMyRegistrations } = require('../controllers/registrationController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Inscription à un événement
router.get('/my', authMiddleware, getMyRegistrations);
router.post('/:eventId', authMiddleware, registerToEvent);

module.exports = router;
