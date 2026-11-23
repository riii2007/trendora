const { asyncHandler, createError } = require('../utils/helpers');

// GET /api/delivery/:pincode
// Simple serviceability rule for the college project (a real project would call a courier API):
//   - pincode must be 6 digits and not start with 0
//   - pincodes starting with 9 (army / field post offices) are not serviceable
//   - delivery days depend on the first digit (zone)
exports.checkPincode = asyncHandler(async (req, res) => {
  const pincode = req.params.pincode;
  if (!/^[1-9]\d{5}$/.test(pincode)) throw createError('Please enter a valid 6 digit pincode');

  const zone = pincode[0];
  if (zone === '9') {
    return res.json({ available: false, pincode, message: 'Sorry, we do not deliver to this pincode yet' });
  }

  const days = zone === '3' ? { min: 2, max: 3 } : ['8'].includes(zone) ? { min: 6, max: 7 } : { min: 4, max: 5 };
  const date = new Date();
  date.setDate(date.getDate() + days.max);

  res.json({
    available: true,
    pincode,
    days,
    deliveryBy: date.toDateString(),
    cod: true,
    message: `Delivery in ${days.min}-${days.max} days`,
  });
});
