const router = require('express').Router();

const {
  getUsers,
  getUserById,
  getUserData,
  updateUserData,
  updateUserAvatar,
} = require('../controllers/users');

router.get('/', getUsers);
router.get('/me', getUserData);
router.patch('/me', updateUserData);
router.patch('/me/avatar', updateUserAvatar);
router.get('/:userId', getUserById);

module.exports = router;
