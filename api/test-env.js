module.exports = (req, res) => {
  res.status(200).json({
    MONGODB_URI: process.env.MONGODB_URI ? 'set (' + process.env.MONGODB_URI.substring(0, 20) + '...)' : 'NOT SET',
    RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID ? 'set' : 'NOT SET',
    RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET ? 'set' : 'NOT SET',
    FRONTEND_URL: process.env.FRONTEND_URL || 'NOT SET',
  });
};
