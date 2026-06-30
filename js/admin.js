const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user') || 'null');

if (!token || !user) {
  window.location.href = '/login.html';
}

document.getElementById('admin-name').textContent = user ? user.name : '';

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login.html';
}

async function loadBookings() {
  try {
    const res = await fetch(CONFIG.API_BASE_URL + '/bookings?email=', {
      headers: { Authorization: 'Bearer ' + token },
    });

    const data = await res.json();

    if (!res.ok) {
      if (res.status === 401) logout();
      return;
    }

    const bookings = data.bookings || [];
    const container = document.getElementById('bookings-list');

    document.getElementById('stat-total').textContent = bookings.length;
    document.getElementById('stat-paid').textContent = bookings.filter(b => b.status === 'paid').length;
    document.getElementById('stat-pending').textContent = bookings.filter(b => b.status === 'pending').length;

    if (bookings.length === 0) {
      container.innerHTML = `
        <div class="bookings-empty">
          <i class="fas fa-inbox"></i>
          <p>No bookings yet</p>
        </div>`;
      return;
    }

    const table = `
      <table class="bookings-table">
        <thead>
          <tr>
            <th>Guest</th>
            <th>Room</th>
            <th>Check In</th>
            <th>Check Out</th>
            <th>Nights</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Payment ID</th>
          </tr>
        </thead>
        <tbody>
          ${bookings.map(b => `
            <tr>
              <td><strong>${b.guestName}</strong><br><small style="color:#888">${b.guestEmail}</small></td>
              <td>${b.room}</td>
              <td>${new Date(b.checkIn).toLocaleDateString()}</td>
              <td>${new Date(b.checkOut).toLocaleDateString()}</td>
              <td>${b.nights}</td>
              <td>₹${Number(b.amount).toLocaleString('en-IN')}</td>
              <td><span class="status-badge status-${b.status}">${b.status}</span></td>
              <td><small style="color:#999">${b.razorpayPaymentId || '—'}</small></td>
            </tr>
          `).join('')}
        </tbody>
      </table>`;

    container.innerHTML = table;
  } catch (err) {
    console.error('Load bookings error:', err);
  }
}

loadBookings();
