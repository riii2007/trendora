const router = require('express').Router();
const c = require('../controllers/cartController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', c.getCart);
router.post('/', c.addToCart);
router.put('/:itemId', c.updateItem);
router.delete('/:itemId', c.removeItem);

module.exports = router;
