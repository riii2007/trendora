const router = require('express').Router();
const c = require('../controllers/productController');
const { protect, adminOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', c.getProducts);
router.get('/filters', c.getFilters);
router.get('/suggestions', c.getSuggestions);
router.get('/:id/related', c.getRelated);
router.get('/:id', c.getProduct);
router.post('/', protect, adminOnly, upload.array('images', 5), c.createProduct);
router.put('/:id', protect, adminOnly, upload.array('images', 5), c.updateProduct);
router.delete('/:id', protect, adminOnly, c.deleteProduct);

module.exports = router;
