const router = require('express').Router();
const c = require('../controllers/wishlistController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', c.getWishlist);
router.post('/:productId', c.toggleWishlist);

module.exports = router;
