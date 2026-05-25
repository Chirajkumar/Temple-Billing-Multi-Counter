const express = require('express');
const router = express.Router();

const Room = require('../models/Room');
const RoomBooking = require('../models/RoomBooking');
const { protect } = require('../middleware/auth');

// GET room setup
router.get('/setup', async (req, res) => {
  try {
    const rooms = await Room.find({}).sort({ roomId: 1 });
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET room bookings (from Mongo collection `room_book`)
router.get('/booking', async (req, res) => {
  try {
    const bookings = await RoomBooking.find({})
      .sort({ createdAt: -1 });

    // Match frontend expectations: `id` should exist
    const mapped = bookings.map((b) => ({
      id: b._id,
      roomId: b.roomId,
      bookedBy: b.bookedBy,
      mobile: b.mobile,
      checkIn: b.checkIn,
      checkOut: b.checkOut,
      persons: b.persons,
      specialRequests: b.specialRequests,
      type: b.type,
      price: b.price,
      status: b.status,
      bookingId: b.bookingId
    }));

    res.json(mapped);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create setup room
router.post('/setup', async (req, res) => {
  try {
    // Accept both `id` (frontend) and `roomId` (backend model)
    const { id, roomId, type, capacity, price, status, facilities } = req.body;
    const finalRoomId = roomId ?? id;

    const newRoom = await Room.create({
      roomId: finalRoomId,
      type,
      capacity,
      price,
      status: status || 'Active',
      facilities
    });

    res.status(201).json(newRoom);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT update setup (bulk)
router.put('/setup', async (req, res) => {
  try {
    const updatedRooms = req.body;
    const results = await Promise.all(
      updatedRooms.map((room) =>
        Room.findByIdAndUpdate(room._id, room, { new: true })
      )
    );
    res.json({ success: true, rooms: results });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

const findSetupRoom = async (id) => {
  if (id.match(/^[0-9a-fA-F]{24}$/)) {
    const byId = await Room.findById(id);
    if (byId) return byId;
  }
  return Room.findOne({ roomId: id });
};

// PUT update single setup room
router.put('/setup/:id', async (req, res) => {
  try {
    const room = await findSetupRoom(req.params.id);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    const { roomId, id: bodyId, type, capacity, price, status, facilities } = req.body;
    const newRoomId = roomId ?? bodyId;

    if (newRoomId && newRoomId !== room.roomId) {
      const duplicate = await Room.findOne({ roomId: newRoomId, _id: { $ne: room._id } });
      if (duplicate) {
        return res.status(400).json({ message: 'Room ID already exists' });
      }
      room.roomId = newRoomId;
    }
    if (type !== undefined) room.type = type;
    if (capacity !== undefined) room.capacity = capacity;
    if (price !== undefined) room.price = price;
    if (status !== undefined) room.status = status;
    if (facilities !== undefined) room.facilities = facilities;

    await room.save();
    res.json(room);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE setup room
router.delete('/setup/:id', async (req, res) => {
  try {
    const room = await findSetupRoom(req.params.id);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    await room.deleteOne();
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// POST create booking
router.post('/booking', async (req, res) => {
  try {
    const {
      roomId,
      bookedBy,
      mobile,
      checkIn,
      checkOut,
      persons,
      specialRequests,
      type,
      price,
      bookingId,
      status
    } = req.body;

    if (!roomId || !bookedBy || !mobile || !checkIn || !checkOut) {
      return res.status(422).json({ message: 'roomId, bookedBy, mobile, checkIn, checkOut are required' });
    }

    const inDate = new Date(checkIn);
    const outDate = new Date(checkOut);
    if (Number.isNaN(inDate.getTime()) || Number.isNaN(outDate.getTime())) {
      return res.status(422).json({ message: 'Invalid checkIn/checkOut date' });
    }

    if (outDate <= inDate) {
      return res.status(422).json({ message: 'checkOut must be after checkIn' });
    }

    const room = await Room.findOne({ roomId: roomId });
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    if (room.status !== 'Active') {
      return res.status(422).json({ message: 'Room is not Active' });
    }

    // Overlap check (only for active reservations)
    const overlap = await RoomBooking.findOne({
      roomId,
      status: { $in: ['Confirmed', 'Checked In'] },
      $expr: {
        $and: [
          { $lt: ['$checkIn', outDate] },
          { $gt: ['$checkOut', inDate] }
        ]
      }
    });

    if (overlap) {
      return res.status(422).json({ message: 'Room already booked for the selected dates' });
    }

    // Use snapshot from room setup unless provided
    const booking = await RoomBooking.create({
      bookingId,
      roomId,
      bookedBy,
      mobile,
      checkIn: inDate,
      checkOut: outDate,
      persons: persons ?? 1,
      specialRequests: specialRequests ?? '',
      type: type ?? room.type,
      price: price ?? room.price,
      status: status ?? 'Confirmed'
    });

    res.status(201).json({
      id: booking._id,
      roomId: booking.roomId,
      bookedBy: booking.bookedBy,
      mobile: booking.mobile,
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      persons: booking.persons,
      specialRequests: booking.specialRequests,
      type: booking.type,
      price: booking.price,
      status: booking.status,
      bookingId: booking.bookingId
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT update booking status by id
router.put('/booking/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    if (!status) return res.status(422).json({ message: 'status is required' });

    const allowed = ['Confirmed', 'Checked In', 'Checked Out', 'Cancelled'];
    if (!allowed.includes(status)) {
      return res.status(422).json({ message: 'Invalid status' });
    }

    const booking = await RoomBooking.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    res.json({
      id: booking._id,
      roomId: booking.roomId,
      bookedBy: booking.bookedBy,
      mobile: booking.mobile,
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      persons: booking.persons,
      specialRequests: booking.specialRequests,
      type: booking.type,
      price: booking.price,
      status: booking.status,
      bookingId: booking.bookingId
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE (cancel) booking
router.delete('/booking/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await RoomBooking.findByIdAndUpdate(
      id,
      { status: 'Cancelled' },
      { new: true }
    );

    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;


