const express = require('express');
const router = express.Router();

router.get('/test', (req, res) => {
  res.json({
    success: true,
    data: 'API is working',
  });
});

module.exports = router;