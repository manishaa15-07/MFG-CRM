const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
} = require('../controllers/userController');
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');

// All user routes are protected
router.use(auth);

router.get('/', roleAuth('admin', 'manager'), getUsers);
router.get('/:id', getUser);
router.put('/:id', roleAuth('admin'), updateUser);
router.delete('/:id', roleAuth('admin'), deleteUser);

module.exports = router;
