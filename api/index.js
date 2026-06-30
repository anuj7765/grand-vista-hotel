module.exports = (req, res) => {
  res.status(200).json({
    name: 'The Grand Vista API',
    version: '1.0.0',
    endpoints: {
      createOrder: '/api/create-order',
      verifyPayment: '/api/verify-payment',
      bookings: '/api/bookings',
      contact: '/api/contact',
    },
  });
};
