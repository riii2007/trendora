const router = require('express').Router();
const c = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect, adminOnly);
router.get('/stats', c.getStats);
router.get('/users', c.getUsers);
router.delete('/users/:id', c.deleteUser);
router.get('/orders', c.getAllOrders);
router.put('/orders/:id/status', c.updateOrderStatus);

module.exports = router;
