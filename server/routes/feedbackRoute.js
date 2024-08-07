const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');

// 피드백 요청
router.post('/', feedbackController.feedbackRequest);

// 피드백 결과 조회
router.get('/:requestId', feedbackController.getResultFeedback);

module.exports = router;