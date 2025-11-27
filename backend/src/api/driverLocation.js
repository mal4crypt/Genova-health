// Driver location API (optional REST endpoint)
// This file provides a simple Express route to receive driver location updates.
// The real‑time updates are already handled via Socket.io in src/index.js,
// but this endpoint can be used for fallback or external services.

const express = require('express');
const router = express.Router();

// Expected payload: { driverId, name, plate, location: { lat, lng } }
router.post('/location', (req, res) => {
    const { driverId, name, plate, location } = req.body;
    if (!driverId || !location) {
        return res.status(400).json({ message: 'Missing driverId or location' });
    }
    // In a real app you would persist this data to DB and broadcast via Socket.io.
    // For the MVP we just acknowledge receipt.
    console.log('Received driver location via REST:', { driverId, name, plate, location });
    res.json({ status: 'ok' });
});

module.exports = router;
