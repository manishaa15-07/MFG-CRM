const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getTeamPerformance,
  getLeaderboard,
  getTrends,
} = require('../controllers/analyticsController');
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');

// All analytics routes are protected
router.use(auth);

router.get('/dashboard', getDashboardStats);
router.get('/team', roleAuth('admin', 'manager'), getTeamPerformance);
router.get('/leaderboard', getLeaderboard);
router.get('/trends', getTrends);

module.exports = router;
