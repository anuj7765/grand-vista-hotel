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

document.getElementById('contact-form').addEventListener('submit', function(e) {
  e.preventDefault();
  alert('Thank you! We will get back to you shortly.');
  this.reset();
});

// --- Razorpay Booking ---
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

bookingForm.addEventListener('submit', function(e) {
  e.preventDefault();

  const name = document.getElementById('guest-name').value.trim();
  const email = document.getElementById('guest-email').value.trim();
  const phone = document.getElementById('guest-phone').value.trim();
  const city = document.getElementById('guest-city').value.trim();
  const checkIn = document.getElementById('check-in').value;
  const checkOut = document.getElementById('check-out').value;
  const room = roomNameInput.value;
  const price = Number(roomPriceInput.value);

  if (!checkIn || !checkOut) {
    alert('Please select check-in and check-out dates.');
    return;
  }

  if (new Date(checkOut) <= new Date(checkIn)) {
    alert('Check-out date must be after check-in date.');
    return;
  }

  const nights = Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));
  const total = price * nights;
  payAmount.textContent = total.toLocaleString('en-IN');

  const options = {
    key: RAZORPAY_CONFIG.key_id,
    amount: total * 100,
    currency: RAZORPAY_CONFIG.currency,
    name: RAZORPAY_CONFIG.name,
    description: `${room} - ${nights} night(s)`,
    image: RAZORPAY_CONFIG.image,
    prefill: { name, email, contact: phone },
    theme: RAZORPAY_CONFIG.theme,
    handler: function(response) {
      const detailStr = `${formatDate(checkIn)} to ${formatDate(checkOut)}, ${nights} night(s)`;
      openSuccessModal(room, response.razorpay_payment_id, detailStr);
      closeBookingModal();
    },
    modal: {
      ondismiss: function() {
        // user closed Razorpay modal
      }
    }
  };

  const rzp = new Razorpay(options);
  rzp.open();
});
