const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BookingSchema = new Schema({
  item: {
    type: Schema.Types.ObjectId,
    ref: 'item',
    required: true
  },
  borrower: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  lender: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  totalPrice: {
    type: Number,
    required: true
  },
  bookingStatus: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  stripePaymentIntentId: {
    type: String
  },
  dateBooked: {
    type: Date,
    default: Date.now
  }
});

module.exports = Booking = mongoose.model('booking', BookingSchema);