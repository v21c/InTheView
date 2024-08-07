const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');

// 세션 생성
router.post('/', sessionController.createSession);

// 세션 상세 정보 조회
router.get('/:sessionid', sessionController.getSessionDetails);

// 메시지 생성
router.post('/messages', sessionController.createMessage);

// 메시지 조회
router.get('/messages/:messageid', sessionController.getMessages);

module.exports = router;