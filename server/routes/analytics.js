const router = require('express').Router();
const auth = require('../middleware/auth');
const { getAnalytics, getStreaks } = require('../controllers/analyticsController');

router.use(auth);
router.get('/', getAnalytics);
router.get('/streaks', getStreaks);

module.exports = router;
