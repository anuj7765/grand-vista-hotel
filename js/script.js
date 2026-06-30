const header = document.getElementById('header');
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');

window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 60);
});

hamburger.addEventListener('click', () => {
  navMenu.classList.toggle('active');
  hamburger.classList.toggle('active');
});

document.querySelectorAll('#nav-menu a').forEach(link => {
  link.addEventListener('click', () => {
    navMenu.classList.remove('active');
    hamburger.classList.remove('active');
    document.querySelectorAll('#nav-menu a').forEach(l => l.classList.remove('active'));
    link.classList.add('active');
  });
});

window.addEventListener('scroll', () => {
  const sections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('#nav-menu a');
  let current = '';
  sections.forEach(section => {
    const top = section.offsetTop - 120;
    if (window.scrollY >= top) {
      current = section.getAttribute('id');
    }
  });
  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === '#' + current) {
      link.classList.add('active');
    }
  });
});

// --- Contact Form ---
document.getElementById('contact-form').addEventListener('submit', async function(e) {
  e.preventDefault();
  const form = this;
  const btn = form.querySelector('button');
  const originalText = btn.textContent;

  btn.textContent = 'Sending...';
  btn.disabled = true;

  try {
    const res = await fetch(CONFIG.API_BASE_URL + '/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.querySelector('input[placeholder="Your Name"]').value,
        email: form.querySelector('input[placeholder="Your Email"]').value,
        subject: form.querySelector('input[placeholder="Subject"]').value,
        message: form.querySelector('textarea').value,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      alert(data.message || 'Thank you! We will get back to you shortly.');
      form.reset();
    } else {
      alert(data.error || 'Something went wrong. Please try again.');
    }
  } catch (err) {
    alert('Network error. Please check your connection and try again.');
  } finally {
    btn.textContent = originalText;
    btn.disabled = false;
  }
});

// --- Booking Modal ---
const bookingModal = document.getElementById('booking-modal');
const successModal = document.getElementById('success-modal');
const modalClose = document.getElementById('modal-close');
const bookingForm = document.getElementById('booking-form');

const roomNameInput = document.getElementById('room-name');
const roomPriceInput = document.getElementById('room-price');
const modalRoomInfo = document.getElementById('modal-room-info');
const payAmount = document.getElementById('pay-amount');

function openBookingModal(room, price, image) {
  roomNameInput.value = room;
  roomPriceInput.value = price;
  modalRoomInfo.innerHTML = `<i class="fas fa-bed"></i> ${room} &mdash; ₹${Number(price).toLocaleString('en-IN')} / night`;
  payAmount.textContent = Number(price).toLocaleString('en-IN');
  document.getElementById('guest-name').value = '';
  document.getElementById('guest-email').value = '';
  document.getElementById('guest-phone').value = '';
  document.getElementById('guest-city').value = '';
  document.getElementById('check-in').value = '';
  document.getElementById('check-out').value = '';
  bookingModal.classList.add('active');
}

function closeBookingModal() {
  bookingModal.classList.remove('active');
}

function openSuccessModal(room, paymentId, details) {
  document.getElementById('success-room').textContent = room;
  document.getElementById('success-details').textContent = details;
  document.getElementById('success-payment-id').textContent = 'Payment ID: ' + paymentId;
  successModal.classList.add('active');
}

document.querySelectorAll('.book-btn').forEach(btn => {
  btn.addEventListener('click', e => {
    e.preventDefault();
    const room = btn.dataset.room;
    const price = btn.dataset.price;
    const image = btn.dataset.image;
    openBookingModal(room, price, image);
  });
});

modalClose.addEventListener('click', closeBookingModal);

bookingModal.addEventListener('click', e => {
  if (e.target === bookingModal) closeBookingModal();
});

document.getElementById('success-close').addEventListener('click', e => {
  e.preventDefault();
  successModal.classList.remove('active');
});

successModal.addEventListener('click', e => {
  if (e.target === successModal) successModal.classList.remove('active');
});

function pad(n) {
  return n.toString().padStart(2, '0');
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

// --- Booking Submit with Backend ---
bookingForm.addEventListener('submit', async function(e) {
  e.preventDefault();

  const name = document.getElementById('guest-name').value.trim();
  const email = document.getElementById('guest-email').value.trim();
  const phone = document.getElementById('guest-phone').value.trim();
  const city = document.getElementById('guest-city').value.trim();
  const checkIn = document.getElementById('check-in').value;
  const checkOut = document.getElementById('check-out').value;
  const room = roomNameInput.value;
  const pricePerNight = Number(roomPriceInput.value);

  if (!checkIn || !checkOut) {
    alert('Please select check-in and check-out dates.');
    return;
  }

  if (new Date(checkOut) <= new Date(checkIn)) {
    alert('Check-out date must be after check-in date.');
    return;
  }

  if (pricePerNight === 0) {
    alert('Please contact us for pricing of this room.');
    return;
  }

  const nights = Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));
  const total = pricePerNight * nights;
  payAmount.textContent = total.toLocaleString('en-IN');

  const payBtn = document.getElementById('pay-btn');
  payBtn.textContent = 'Processing...';
  payBtn.disabled = true;

  try {
    const orderRes = await fetch(CONFIG.API_BASE_URL + '/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        room,
        guestName: name,
        guestEmail: email,
        guestPhone: phone,
        guestCity: city,
        checkIn,
        checkOut,
        nights,
        amount: total,
      }),
    });

    const orderData = await orderRes.json();

    if (!orderRes.ok) {
      alert(orderData.error || 'Failed to create order. Please try again.');
      payBtn.innerHTML = `<i class="fas fa-lock"></i> Pay ₹${total.toLocaleString('en-IN')}`;
      payBtn.disabled = false;
      return;
    }

    const options = {
      key: CONFIG.RAZORPAY.key_id,
      amount: orderData.amount,
      currency: orderData.currency,
      name: CONFIG.RAZORPAY.name,
      description: `${room} - ${nights} night(s)`,
      image: CONFIG.RAZORPAY.image,
      order_id: orderData.orderId,
      prefill: { name, email, contact: phone },
      theme: CONFIG.RAZORPAY.theme,
      handler: async function(response) {
        const verifyRes = await fetch(CONFIG.API_BASE_URL + '/verify-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          }),
        });

        const verifyData = await verifyRes.json();

        if (verifyRes.ok && verifyData.verified) {
          const detailStr = `${formatDate(checkIn)} to ${formatDate(checkOut)}, ${nights} night(s)`;
          openSuccessModal(room, response.razorpay_payment_id, detailStr);
          closeBookingModal();
        } else {
          alert('Payment verification failed. Please contact support.');
        }
      },
      modal: {
        ondismiss: function() {
          payBtn.innerHTML = `<i class="fas fa-lock"></i> Pay ₹${total.toLocaleString('en-IN')}`;
          payBtn.disabled = false;
        }
      }
    };

    const rzp = new Razorpay(options);
    rzp.open();
  } catch (err) {
    alert('Network error. Please try again.');
    payBtn.innerHTML = `<i class="fas fa-lock"></i> Pay ₹${total.toLocaleString('en-IN')}`;
    payBtn.disabled = false;
  }
});
