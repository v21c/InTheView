const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');

// 세션 생성
router.post('/', sessionController.createSession);

// 세션 조회
router.get('/', sessionController.getSession);

// 세션 상세 정보 조회
router.get('/:sessionId', sessionController.getSessionDetails);

// 세션 업데이트
router.put('/:sessionId', sessionController.updateSession);

// 세션 제거
router.delete('/:sessionId', sessionController.deleteSession);

module.exports = router;