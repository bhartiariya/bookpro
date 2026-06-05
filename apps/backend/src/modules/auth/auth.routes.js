const express = require('express');
const router = express.Router();

router.get('/placeholder', (req, res) => {
  res.json({ message: 'Auth routes placeholder' });
});

module.exports = router;
