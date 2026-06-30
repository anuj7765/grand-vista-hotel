const Razorpay = require('razorpay');
const connectDB = require('./_lib/db');
const Booking = require('./_lib/models/Booking');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { room, guestName, guestEmail, guestPhone, guestCity, checkIn, checkOut, nights, amount } = req.body;

    if (!room || !guestName || !guestEmail || !guestPhone || !checkIn || !checkOut || !nights || !amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (nights < 1 || amount < 1) {
      return res.status(400).json({ error: 'Invalid nights or amount' });
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`,
    });

    await connectDB();

    const booking = await Booking.create({
      room,
      guestName,
      guestEmail,
      guestPhone,
      guestCity: guestCity || '',
      checkIn: new Date(checkIn),
      checkOut: new Date(checkOut),
      nights,
      amount,
      razorpayOrderId: order.id,
      status: 'pending',
    });

    res.status(200).json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      bookingId: booking._id,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error('Create order error:', err);
    res.status(500).json({ error: 'Failed to create order' });
  }
};
