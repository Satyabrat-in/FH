const express = require('express');
const router = express.Router();
const { createReview, getUserReviews, getGigReviews } = require('../controllers/reviews');
const { protect } = require('../middleware/auth');
router.post('/', protect, createReview);
router.get('/user/:userId', getUserReviews);
router.get('/gig/:gigId', getGigReviews);
module.exports = router;