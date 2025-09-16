const $ = id => document.getElementById(id);

// ----------------- User Authentication -----------------
function getUsers() {
  return JSON.parse(localStorage.getItem('users') || '[]');
}

function saveUsers(users) {
  localStorage.setItem('users', JSON.stringify(users));
}

function getCurrentUser() {
  return JSON.parse(localStorage.getItem('currentUser'));
}

function setCurrentUser(user) {
  localStorage.setItem('currentUser', JSON.stringify(user));
}

function clearCurrentUser() {
  localStorage.removeItem('currentUser');
}

// ----------------- Login Page -----------------
if (window.location.pathname.endsWith('login.html')) {
  const form = $('login-form');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const email = $('email').value.trim().toLowerCase();
    const password = $('password').value;
    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      setCurrentUser(user);
      window.location.href = 'menu.html';
    } else {
      alert('Invalid email or password');
    }
  });
}

// ----------------- Register Page -----------------
if (window.location.pathname.endsWith('register.html')) {
  const form = $('register-form');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const email = $('email').value.trim().toLowerCase();
    const password = $('password').value;
    const confirmPassword = $('confirm-password').value;

    if (password !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    let users = getUsers();
    if (users.find(u => u.email === email)) {
      alert('User with this email already exists.');
      return;
    }

    const newUser = { email, password, bookings: [] };
    users.push(newUser);
    saveUsers(users);
    alert('Registration successful! Please login.');
    window.location.href = 'login.html';
  });
}

// ----------------- Menu Page -----------------
if (window.location.pathname.endsWith('menu.html')) {
  const user = getCurrentUser();
  if (!user) {
    alert('Please login first');
    window.location.href = 'login.html';
  } else {
    $('user-email').textContent = user.email;
  }

  $('logout-btn').addEventListener('click', () => {
    clearCurrentUser();
    window.location.href = 'logout.html';
  });
}

// ----------------- Search Page -----------------
if (window.location.pathname.endsWith('search.html') || window.location.pathname.endsWith('/')) {
  const validOrigins = [
    'Indira Gandhi International Airport, Delhi',
    'Chhatrapati Shivaji Maharaj International Airport, Mumbai',
    'Kempegowda International Airport, Bengaluru',
    'Rajiv Gandhi International Airport, Hyderabad',
    'Netaji Subhash Chandra Bose International Airport, Kolkata',
    'Chennai International Airport, Chennai',
    'Pune Airport, Pune',
    'Goa International Airport, Goa',
    'Sardar Vallabhbhai Patel International Airport, Ahmedabad',
    'Lal Bahadur Shastri Airport, Varanasi',
    'Dr. Babasaheb Ambedkar International Airport, Nagpur',
    'Birsa Munda Airport, Ranchi',
    'Sonari Airport, Jamshedpur',
    'Dhanbad Airport, Dhanbad'
  ];

  const validDestinations = [
    'Birsa Munda Airport, Ranchi',
    'Sonari Airport, Jamshedpur',
    'Dhanbad Airport, Dhanbad'
  ];

  const originSelect = $('origin');
  const destSelect = $('destination');

  validOrigins.forEach(city => {
    const opt = document.createElement('option');
    opt.value = city; opt.textContent = city;
    originSelect.appendChild(opt);
  });

  validDestinations.forEach(city => {
    const opt = document.createElement('option');
    opt.value = city; opt.textContent = city;
    destSelect.appendChild(opt);
  });

  const user = getCurrentUser();
  if (!user) { alert('Please login first'); window.location.href='login.html'; }

  const form = $('search-form');
  const dateInput = $('date');
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const maxDate = new Date(today); maxDate.setFullYear(maxDate.getFullYear() + 1);
  dateInput.setAttribute('min', todayStr);
  dateInput.setAttribute('max', maxDate.toISOString().split('T')[0]);

  form.addEventListener('submit', e => {
    e.preventDefault();
    const origin = originSelect.value;
    const destination = destSelect.value;
    const date = dateInput.value;
    const selectedDate = new Date(date);
    const now = new Date(); now.setHours(0,0,0,0);

    if (!origin || !destination || !date) return alert('Please fill all fields');
    if (origin === destination) return alert('Origin and destination cannot be the same');
    if (selectedDate < now) return alert('You cannot select a past date for travel!');
    if (selectedDate > maxDate) return alert('You cannot select a travel date more than 1 year from today!');
    if (!validOrigins.includes(origin)) return alert('Invalid origin airport');
    if (!validDestinations.includes(destination)) return alert('Invalid destination airport');

    sessionStorage.setItem('searchCriteria', JSON.stringify({ origin, destination, date }));
    window.location.href='search-results.html';
  });
}

// ----------------- Search Results Page -----------------
if (window.location.pathname.endsWith('search-results.html')) {
  const crit = sessionStorage.getItem('searchCriteria');
  if (!crit) { alert('No data'); window.location.href = 'search.html'; }

  const c = JSON.parse(crit),
        res = $('results-container'),
        flts = [
          { id:'F1001', al:'Air India', f:c.origin, t:c.destination, d:c.date, time:'10:00', p:3500 },
          { id:'F1002', al:'IndiGo', f:c.origin, t:c.destination, d:c.date, time:'13:00', p:3200 },
          { id:'F1003', al:'SpiceJet', f:c.origin, t:c.destination, d:c.date, time:'18:00', p:3000 }
        ];

  res.innerHTML = `<h1>${c.origin} → ${c.destination} | ${c.date}</h1>`;

  flts.forEach(f => {
    const card = document.createElement('div');
    card.className = 'flight-card';
    card.innerHTML = `
      <div class="flight-info">
        <h2>${f.al}-${f.id}</h2>
        <p>From: ${f.f}</p>
        <p>To: ${f.t}</p>
        <p>Date: ${f.d}</p>
        <p>Time: ${f.time}</p>
        <p>Price: ₹${f.p}</p>
      </div>
      <a href="#" class="book-btn" data-flight='${JSON.stringify(f)}'>Book</a>
    `;
    res.appendChild(card);
  });

  res.insertAdjacentHTML('beforeend', `<a href="search.html" class="back-link">← Back</a>`);

  document.querySelectorAll('.book-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      const f = JSON.parse(btn.dataset.flight);
      sessionStorage.setItem('selectedFlight', JSON.stringify(f));
      window.location.href = 'booking.html';
    });
  });
}

// ----------------- Booking Page -----------------
if (window.location.pathname.endsWith('booking.html')) {
  const flightRaw = sessionStorage.getItem('selectedFlight');
  if (!flightRaw) { alert('No flight selected!'); window.location.href = 'search-results.html'; }

  const f = JSON.parse(flightRaw);
  $('flight-info').innerHTML = `
    <h2>${f.al} - ${f.id}</h2>
    <p>From: ${f.f}</p>
    <p>To: ${f.t}</p>
    <p>Date: ${f.d}</p>
    <p>Time: ${f.time}</p>
    <p>Price per passenger: ₹${f.p}</p>
  `;

  const passengerCountInput = $('passenger-count');
  const generateBtn = $('generate-passenger-fields');
  const passengerDetails = $('passenger-details');
  const finalSubmit = $('final-submit');

  generateBtn.addEventListener('click', () => {
    const count = parseInt(passengerCountInput.value);
    if (!count || count < 1 || count > 10) return alert('Enter a valid number of passengers (1-10)');

    passengerDetails.innerHTML = '';
    for (let i = 1; i <= count; i++) {
      const fieldset = document.createElement('fieldset');
      fieldset.innerHTML = `
        <legend>Passenger ${i}</legend>
        <label>Full Name:</label><input type="text" id="p${i}-name" required />
        <label>Age:</label><input type="number" id="p${i}-age" min="0" max="120" required />
        <label>Gender:</label>
        <select id="p${i}-gender" required>
          <option value="">Select</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
      `;
      passengerDetails.appendChild(fieldset);
    }
    finalSubmit.style.display = 'inline-block';
  });

  $('booking-form').addEventListener('submit', e => {
    e.preventDefault();
    const count = parseInt(passengerCountInput.value);
    const passengers = [];
    for (let i = 1; i <= count; i++) {
      const name = $(`p${i}-name`).value.trim();
      const age = parseInt($(`p${i}-age`).value);
      const gender = $(`p${i}-gender`).value;
      if (!name || !age || !gender) return alert(`Please fill all details for passenger ${i}`);
      passengers.push({ name, age, gender });
    }

    const booking = {
      flight: f,
      passengers,
      passengerCount: passengers.length,
      totalPrice: f.p * passengers.length
    };

    sessionStorage.setItem('bookingDetails', JSON.stringify(booking));
    window.location.href = 'payment.html';
  });
}

// ----------------- Payment Page -----------------
if (window.location.pathname.endsWith('payment.html')) {
  const bookingRaw = sessionStorage.getItem('bookingDetails');
  if (!bookingRaw) { alert('No booking details found.'); window.location.href = 'search.html'; }

  const booking = JSON.parse(bookingRaw);
  $('payment-info').innerHTML = `<h1>Payment for ${booking.flight.al} (${booking.flight.id})</h1><p>Total Amount: ₹${booking.totalPrice}</p>`;

  $('payment-form').addEventListener('submit', e => {
    e.preventDefault();
    const cardNumber = $('card-number').value.trim().replace(/\s+/g, '');
    const expiryDate = $('expiry-date').value.trim();
    const cvv = $('cvv').value.trim();

    if (!/^\d{16}$/.test(cardNumber)) return alert('Invalid card number. Must be 16 digits.');
    if (!expiryDate) return alert('Select card expiry date.');
    const [year, month] = expiryDate.split('-').map(Number);
    const expiry = new Date(year, month, 0);
    const today = new Date(); today.setHours(0,0,0,0);
    if(expiry < today) return alert('Card has expired.');

    if (!/^\d{3,4}$/.test(cvv)) return alert('Invalid CVV. Must be 3 or 4 digits.');

    alert('Payment successful!');
    const user = getCurrentUser();
    if (!user) { alert('User not logged in.'); window.location.href = 'login.html'; return; }

    if (!user.bookings) user.bookings = [];
const confirmedBooking = { ...booking, bookingTime: new Date().toISOString() };
user.bookings.push(confirmedBooking);

const users = getUsers();
const idx = users.findIndex(u => u.email === user.email);
if (idx !== -1) { 
  users[idx] = user; 
  saveUsers(users); 
  setCurrentUser(user); 
}

// Clean up temp storage
sessionStorage.removeItem('bookingDetails');
sessionStorage.removeItem('selectedFlight');
sessionStorage.removeItem('searchCriteria');

// Store the latest confirmed booking for confirmation page
sessionStorage.setItem('lastBooking', JSON.stringify(confirmedBooking));

window.location.href = 'confirmation.html';

  });
}

// ----------------- Confirmation Page -----------------
if (window.location.pathname.endsWith('confirmation.html')) {
  const lastBookingRaw = sessionStorage.getItem('lastBooking');
  if (!lastBookingRaw) { alert('No confirmation data found.'); window.location.href = 'menu.html'; }

  const booking = JSON.parse(lastBookingRaw);
  const container = $('confirmation-container');
  const passengerDetails = booking.passengers.map((p,i)=>`Passenger ${i+1}: ${p.name}, Age: ${p.age}`).join('<br>');

  container.innerHTML = `
    <div class="confirmation-icon">🎉</div>
    <h1>Booking Confirmed!</h1>
    <p>Thank you for booking with us. Have a happy journey!</p>
    <div class="booking-summary">
      <h2>Booking Summary</h2>
      <ul>
        <li><strong>Flight:</strong> ${booking.flight.al} (${booking.flight.id})</li>
        <li><strong>From:</strong> ${booking.flight.f}</li>
        <li><strong>To:</strong> ${booking.flight.t}</li>
        <li><strong>Date:</strong> ${booking.flight.d}</li>
        <li><strong>Time:</strong> ${booking.flight.time}</li>
        <li><strong>Passengers:</strong><br>${passengerDetails}</li>
        <li><strong>Passengers Count:</strong> ${booking.passengerCount}</li>
        <li><strong>Total Paid:</strong> ₹${booking.totalPrice}</li>
      </ul>
    </div>
    <div class="btn-group">
      <a href="menu.html" class="btn">Back to Menu</a>
      <a href="history.html" class="btn btn-secondary">View Booking History</a>
    </div>
  `;
}

// ----------------- History Page -----------------
if (window.location.pathname.endsWith('history.html')) {
  const user = getCurrentUser();
  if (!user) { 
    alert('Please login first.');
    window.location.href = 'login.html'; 
  }

  // Remove bookings that are past flight date + 2 days
  const today = new Date();
  if (user.bookings) {
    user.bookings = user.bookings.filter(b => {
      const flightDate = new Date(b.flight.d);
      flightDate.setDate(flightDate.getDate() + 2); // +2 days
      return flightDate >= today;
    });

    // Update the users array in localStorage to save filtered bookings
    const users = getUsers();
    const idx = users.findIndex(u => u.email === user.email);
    if (idx !== -1) { 
      users[idx] = user;
      saveUsers(users);
      setCurrentUser(user);
    }
  }

  const historyList = $('history-list');
  if (!user.bookings || user.bookings.length === 0) {
    historyList.innerHTML = '<p>You have no bookings yet.</p>';
  } else {
    historyList.innerHTML = '';
    user.bookings.forEach((booking, i) => {
      const card = document.createElement('div');
      card.className = 'booking-card';
      const date = new Date(booking.bookingTime);
      const passengerDetails = booking.passengers
        .map((p, idx) => `Passenger ${idx+1}: ${p.name}, Age: ${p.age}`)
        .join('<br>');
      
      card.innerHTML = `
        <h3>Booking #${i+1}</h3>
        <p><strong>Flight:</strong> ${booking.flight.al} (${booking.flight.id})</p>
        <p><strong>From:</strong> ${booking.flight.f} To: ${booking.flight.t}</p>
        <p><strong>Date:</strong> ${booking.flight.d} Time: ${booking.flight.time}</p>
        <p><strong>Passengers:</strong><br>${passengerDetails}</p>
        <p><strong>Passengers Count:</strong> ${booking.passengerCount}</p>
        <p><strong>Booking Date:</strong> ${date.toLocaleString()}</p>
        <p><strong>Total Paid:</strong> ₹${booking.totalPrice}</p>
        <button class="btn btn-submit download-btn" data-index="${i}">Download This Booking</button>
      `;
      historyList.appendChild(card);
    });

    // Attach event listener for individual download buttons (PDF export)
    historyList.addEventListener('click', (e) => {
      if (e.target.classList.contains('download-btn')) {
        const index = e.target.getAttribute('data-index');
        const booking = user.bookings[index];
        if (!booking) return;

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        let y = 10;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text(`Booking #${parseInt(index)+1}`, 10, y); 
        y += 8;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);

        const date = new Date(booking.bookingTime);
        const passengerDetails = booking.passengers.map(
          (p, idx) => `Passenger ${idx+1}: ${p.name}, Age: ${p.age}`
        );

        const bookingText = [
          `Flight: ${booking.flight.al} (${booking.flight.id})`,
          `From: ${booking.flight.f} To: ${booking.flight.t}`,
          `Date: ${booking.flight.d} Time: ${booking.flight.time}`,
          `Passengers:`,
          ...passengerDetails,
          `Passenger Count: ${booking.passengerCount}`,
          `Booking Date: ${date.toLocaleString()}`,
          `Total Paid: ₹${booking.totalPrice}`
        ];

        bookingText.forEach(line => {
          if (y > 280) {
            doc.addPage();
            y = 10;
          }
          doc.text(line, 10, y);
          y += 6;
        });

        doc.save(`booking-${parseInt(index)+1}-${user.email}.pdf`);
      }
    });
  }

  // Download all history button (PDF in readable text format)
  const downloadBtn = $('download-history-btn');
  if(downloadBtn){
    downloadBtn.addEventListener('click', () => {
      if (!user.bookings || user.bookings.length === 0) { 
        alert('No bookings to download.'); 
        return; 
      }

      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      let y = 10;

      user.bookings.forEach((booking, i) => {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text(`Booking #${i+1}`, 10, y); 
        y += 8;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);

        const date = new Date(booking.bookingTime);
        const passengerDetails = booking.passengers.map(
          (p, idx) => `Passenger ${idx+1}: ${p.name}, Age: ${p.age}`
        );

        const bookingText = [
          `Flight: ${booking.flight.al} (${booking.flight.id})`,
          `From: ${booking.flight.f} To: ${booking.flight.t}`,
          `Date: ${booking.flight.d} Time: ${booking.flight.time}`,
          `Passengers:`,
          ...passengerDetails,
          `Passenger Count: ${booking.passengerCount}`,
          `Booking Date: ${date.toLocaleString()}`,
          `Total Paid: ₹${booking.totalPrice}`
        ];

        bookingText.forEach(line => {
          if (y > 280) { // avoid overflow
            doc.addPage();
            y = 10;
          }
          doc.text(line, 10, y);
          y += 6;
        });

        y += 6; // spacing between bookings
      });

      doc.save(`booking-history-${user.email}.pdf`);
    });
  }
}

// ----------------- Helpline Page -----------------
if (window.location.pathname.endsWith('helpline.html')) {
  const user = getCurrentUser();
  if (!user) { alert('Please login first.'); window.location.href = 'login.html'; }
}
