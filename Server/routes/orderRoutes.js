const router = require('express').Router();
const c = require('../controllers/orderController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.post('/', c.createOrder);
router.get('/my', c.getMyOrders);
router.get('/:id', c.getOrder);

module.exports = router;
