const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');

// 메시지 생성
router.post('/', messageController.createMessage);

// 메시지 조회
router.get('/', messageController.getMessages);

// 메시지 수정
router.put('/:messageId', messageController.updateMessages);

module.exports = router;