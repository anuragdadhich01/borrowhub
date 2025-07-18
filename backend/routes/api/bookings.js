const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const Booking = require('../../models/Booking');
const Item = require('../../models/Item');

// @route   POST api/bookings
// @desc    Create a booking request
// @access  Private
router.post('/', auth, async (req, res) => {
  const { itemId, startDate, endDate, totalPrice } = req.body;

  try {
    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ msg: 'Item not found' });
    }

    const newBooking = new Booking({
      item: itemId,
      borrower: req.user.id,
      lender: item.owner,
      startDate,
      endDate,
      totalPrice,
    });

    const booking = await newBooking.save();
    res.json(booking);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;