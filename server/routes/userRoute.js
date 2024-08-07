const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// 사용자 생성
router.post('/', userController.createUser);

// 사용자 정보 조회
router.get('/:uid', userController.getUser);

// 사용자 정보 업데이트
router.put('/:uid', userController.updateUser);

module.exports = router;