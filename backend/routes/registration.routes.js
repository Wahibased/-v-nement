const express = require('express');
const { registerToEvent, getMyRegistrations } = require('../controllers/registrationController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Inscription à un événement
router.post('/:eventId', authMiddleware, registerToEvent);
router.get('/my', authMiddleware, getMyRegistrations);
module.exports = router;
