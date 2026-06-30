const connectDB = require('./_lib/db');
const Booking = require('./_lib/models/Booking');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  await connectDB();

  if (req.method === 'GET') {
    try {
      const { email } = req.query;
      let filter = {};
      if (email) filter.guestEmail = email;

      const bookings = await Booking.find(filter).sort({ createdAt: -1 });
      return res.status(200).json({ bookings });
    } catch (err) {
      console.error('Get bookings error:', err);
      return res.status(500).json({ error: 'Failed to fetch bookings' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { bookingId } = req.body;

      if (!bookingId) {
        return res.status(400).json({ error: 'Booking ID is required' });
      }

      const booking = await Booking.findById(bookingId);

      if (!booking) {
        return res.status(404).json({ error: 'Booking not found' });
      }

      return res.status(200).json({ booking });
    } catch (err) {
      console.error('Get booking error:', err);
      return res.status(500).json({ error: 'Failed to fetch booking' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
