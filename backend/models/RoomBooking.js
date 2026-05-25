const mongoose = require('mongoose');

const roomBookingSchema = new mongoose.Schema(
  {
    bookingId: { type: String },

    // physical room number like ROOM101
    roomId: { type: String, required: true },

    bookedBy: { type: String, required: true },
    mobile: { type: String, required: true },

    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required: true },

    persons: { type: Number, min: 1, max: 50, default: 1 },

    specialRequests: { type: String, default: '' },

    // Snapshot fields (optional, for UI/reporting)
    type: { type: String, default: '' },
    price: { type: Number, default: 0 },

    status: {
      type: String,
      enum: ['Confirmed', 'Checked In', 'Checked Out', 'Cancelled'],
      default: 'Confirmed'
    }
  },
  {
    timestamps: true,
    collection: 'room_book'
  }
);

module.exports = mongoose.model('RoomBooking', roomBookingSchema);

