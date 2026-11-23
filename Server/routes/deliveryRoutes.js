const router = require('express').Router();
const { checkPincode } = require('../controllers/deliveryController');

router.get('/:pincode', checkPincode);

module.exports = router;
