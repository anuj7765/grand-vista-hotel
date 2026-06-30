const connectDB = require('./_lib/db');
const Contact = require('./_lib/models/Contact');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are required' });
    }

    await connectDB();

    await Contact.create({ name, email, subject: subject || '', message });

    res.status(200).json({ success: true, message: 'Thank you! We will get back to you shortly.' });
  } catch (err) {
    console.error('Contact error:', err);
    res.status(500).json({ error: 'Failed to submit message' });
  }
};
